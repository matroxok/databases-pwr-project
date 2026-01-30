from ninja import NinjaAPI
from ninja.security import django_auth
from ninja.errors import HttpError

from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator

from django.db import transaction
from django.db.models import Q, Sum, F, IntegerField, Case, When
from django.db.models.functions import Coalesce

from datetime import date
from typing import List

from api.models import CustomUser as User, Room, Reservation
from api import schemas
from api.emails import send_password_reset_email

api = NinjaAPI(csrf=True)


@api.get("/health")
def health_check(request):
    return {"status": "ok", "message": "API is healthy"}


@api.get("/set-csrf-token")
def get_csrf_token(request):
    # Ustawi cookie csrftoken i zwróci wartość tokena
    return {"csrftoken": get_token(request)}


@api.post("/auth/login")
def login_view(request, payload: schemas.SignInSchema):
    user = authenticate(request, username=payload.email, password=payload.password)
    if user is not None:
        login(request, user)
        return {"success": True}
    return {"success": False, "message": "Invalid credentials"}


@api.get("/auth/me", auth=django_auth)
def me_view(request):
    user = request.user
    return {"id": user.id, "email": user.email, "username": user.username}


@api.post("/auth/logout", auth=django_auth)
def logout_view(request):
    logout(request)
    return {"message": "Logged out"}


@api.post("/auth/register")
def register(request, payload: schemas.SignInSchema):
    try:
        User.objects.create_user(username=payload.email, email=payload.email, password=payload.password)
        return {"success": "User registered successfully"}
    except Exception as e:
        raise HttpError(400, str(e))


@api.post("/auth/change-password", auth=django_auth)
def change_password(request, payload: schemas.ChangePasswordSchema):
    user = request.user
    if not user or not user.is_authenticated:
        raise HttpError(401, "User is not authenticated")
    if not user.check_password(payload.old_password):
        raise HttpError(400, "Password incorrect")
    if payload.old_password == payload.new_password:
        raise HttpError(400, "New password must be different than old password")

    user.set_password(payload.new_password)
    user.save()
    return {"success": True}


@api.post("/auth/reset-password")
def reset_password(request, payload: schemas.RequestResetPasswordSchema):
    user = User.objects.filter(email=payload.email).first()
    if user:
        send_password_reset_email(user)
    return {"detail": "Jeśli konto istnieje, wysłaliśmy link do resetu hasła."}


@api.post("/auth/reset-password/confirm")
def password_reset_confirm(request, payload: schemas.ResetPasswordConfirmSchema):
    try:
        uid = urlsafe_base64_decode(str(payload.uid)).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        raise HttpError(400, "Nieprawidłowy link.")

    if not default_token_generator.check_token(user, payload.token):
        raise HttpError(400, "Token resetu jest nieprawidłowy lub wygasł.")

    user.set_password(payload.new_password)
    user.save()
    return {"success": True}


@api.get("/rooms/available", response=List[schemas.RoomOut])
def get_available_rooms(request, check_in: date, check_out: date, guests: int):
    if check_out <= check_in:
        raise HttpError(400, "Data wyjazdu musi być późniejsza niż data przyjazdu.")
    if guests <= 0:
        raise HttpError(400, "Liczba gości musi być dodatnia.")

    blocking_statuses = ["pending", "confirmed"]

    overlap_q = Q(
        reservations__status__in=blocking_statuses,
        reservations__check_in__lt=check_out,
        reservations__check_out__gt=check_in,
    )

    qs = (
        Room.objects
        .filter(is_active=True)
        .annotate(
            reserved_places=Coalesce(
                Sum("reservations__guests_count", filter=overlap_q),
                0,
                output_field=IntegerField(),
            ),
            total_places=Case(
                When(room_type="multi_room", then=F("beds")),
                default=F("capacity"),
                output_field=IntegerField(),
            ),
        )
        .filter(total_places__gte=guests)
        .filter(reserved_places__lte=F("total_places") - guests)
        .order_by("number")
    )

    return qs

@api.post("/reservations", auth=django_auth, response=schemas.ReservationOut)
def create_reservation(request, payload: schemas.CreateReservationSchema):
    if payload.check_out <= payload.check_in:
        raise HttpError(400, "Data wyjazdu musi być późniejsza niż data przyjazdu.")
    if payload.guests_count <= 0:
        raise HttpError(400, "Liczba gości/miejsc musi być dodatnia.")

    blocking_statuses = ["pending", "confirmed"]

    with transaction.atomic():
        room = (
            Room.objects.select_for_update()
            .filter(id=payload.room_id, is_active=True)
            .first()
        )
        if not room:
            raise HttpError(404, "Pokój nie istnieje lub jest nieaktywny.")

        total_places = room.beds if room.room_type == "multi_room" else room.capacity

        if payload.guests_count > total_places:
            raise HttpError(400, "Liczba miejsc przekracza pojemność pokoju.")

        reserved_places = Reservation.objects.filter(
            room=room,
            status__in=blocking_statuses,
            check_in__lt=payload.check_out,
            check_out__gt=payload.check_in,
        ).aggregate(total=Coalesce(Sum("guests_count"), 0))["total"]

        free_places = total_places - reserved_places
        if payload.guests_count > free_places:
            raise HttpError(409, f"Brak miejsc. Wolne: {free_places}.")

        r = Reservation.objects.create(
            user=request.user,
            room=room,
            check_in=payload.check_in,
            check_out=payload.check_out,
            guests_count=payload.guests_count,
            notes=payload.notes or "",
            status="pending",
        )

    return {
        "id": r.id,
        "room_id": str(room.id),
        "check_in": r.check_in,
        "check_out": r.check_out,
        "guests_count": r.guests_count,
        "status": r.status,
        "notes": r.notes,
        "created_at": r.created_at.isoformat(),
    }

@api.get("/reservations", auth=django_auth, response=List[schemas.ReservationOut])
def list_my_reservations(request):
    qs = (
        Reservation.objects
        .filter(user=request.user)
        .order_by("-created_at")
    )

    return [
        {
            "id": r.id,
            "room_id": str(r.room_id),
            "room_name": r.room.name,
            "check_in": r.check_in,
            "check_out": r.check_out,
            "guests_count": r.guests_count,
            "status": r.status,
            "notes": r.notes,
            "created_at": r.created_at.isoformat(),
        }
        for r in qs
    ]

@api.put("/reservations/{reservation_id}", auth=django_auth, response=schemas.ReservationOut)
def update_my_reservation(request, reservation_id: int, payload: schemas.UpdateReservationSchema):
    if payload.check_out <= payload.check_in:
        raise HttpError(400, "Data wyjazdu musi być późniejsza niż data przyjazdu.")
    if payload.guests_count <= 0:
        raise HttpError(400, "Liczba gości/miejsc musi być dodatnia.")

    blocking_statuses = ["pending", "confirmed"]

    with transaction.atomic():
        r = (
            Reservation.objects
            .select_for_update()
            .select_related("room")
            .filter(id=reservation_id, user=request.user)
            .first()
        )
        if not r:
            raise HttpError(404, "Rezerwacja nie istnieje.")

        room = r.room

        total_places = room.beds if room.room_type == "multi_room" else room.capacity
        if payload.guests_count > total_places:
            raise HttpError(400, "Liczba miejsc przekracza pojemność pokoju.")

        reserved_places = Reservation.objects.filter(
            room=room,
            status__in=blocking_statuses,
            check_in__lt=payload.check_out,
            check_out__gt=payload.check_in,
        ).exclude(id=r.id).aggregate(total=Coalesce(Sum("guests_count"), 0))["total"]

        free_places = total_places - reserved_places
        if payload.guests_count > free_places:
            raise HttpError(409, f"Brak miejsc. Wolne: {free_places}.")

        r.check_in = payload.check_in
        r.check_out = payload.check_out
        r.guests_count = payload.guests_count
        r.notes = payload.notes or ""
        r.save()

    return {
        "id": r.id,
        "room_id": str(room.id),
        "room_name": room.name,
        "check_in": r.check_in,
        "check_out": r.check_out,
        "guests_count": r.guests_count,
        "status": r.status,
        "notes": r.notes,
        "created_at": r.created_at.isoformat(),
    }



@api.delete("/reservations/{reservation_id}")
def delete_my_reservation(request, reservation_id: int):
    if not request.user.is_authenticated:
        raise HttpError(401, "User is not authenticated")

    r = Reservation.objects.filter(id=reservation_id, user=request.user).first()
    if not r:
        raise HttpError(404, "Rezerwacja nie istnieje.")

    r.delete()
    return {"success": True}
