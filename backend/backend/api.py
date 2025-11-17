from ninja import NinjaAPI
from ninja.security import django_auth
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from api.models import CustomUser as User
from api import schemas
from ninja.errors import HttpError
from api.emails import send_mail, send_password_reset_email
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.db.models import Q
from datetime import date
from decimal import Decimal
from typing import List
from api.models import Room
from ninja import Schema
from pydantic import ConfigDict



api = NinjaAPI(csrf=True)

# health check api endpoint
@api.get("/health")
def health_check(request):
    return {"status": "ok", "message": "API is healthy"}

#endpoint for get token session for nextjs
@api.get("/set-csrf-token")
def get_csrf_token(request):
    return {"csrftoken": get_token(request)}

# login user endpoint
@api.post("/auth/login")
def login_view(request, payload: schemas.SignInSchema):
    user = authenticate(request, username=payload.email, password=payload.password)
    if user is not None:
        login(request, user)
        return {"success": True}
    return {"success": False, "message": "Invalid credentials"}

# take information about user to authStore endpoint
@api.get("/auth/me", auth=django_auth)
def me_view(request):
    user = request.user
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
    }
 
# logout endpoint
@api.post("/auth/logout", auth=django_auth)
def logout_view(request):
    logout(request)
    return {"message": "Logged out"}
 
@api.get("/user", auth=django_auth)
def user(request):
    secret_fact = (
        "The moment one gives close attention to any thing, even a blade of grass",
        "it becomes a mysterious, awesome, indescribably magnificent world in itself."
    )
    return {
        "username": request.user.username,
        "email": request.user.email,
        "secret_fact": secret_fact
    }
 
 # create new user endpoint

@api.post("/auth/register")
def register(request, payload: schemas.SignInSchema):
    try:
        User.objects.create_user(username=payload.email, email=payload.email, password=payload.password)
        return {"success": "User registered successfully"}
    except Exception as e:
        return {"error": str(e)}

# change password endpoint
@api.post("/auth/change-password", auth=django_auth)
def change_password(request, payload: schemas.ChangePasswordSchema):
    user = request.user

    if not user or not user.is_authenticated:
        raise HttpError(401, "User is not authenticated")
    
    if not user.check_password(payload.old_password):
        raise HttpError(400, "Password incorrect")
    
    if payload.old_password == payload.new_password:
        raise HttpError(400, "New password must be diffrent than old password")
    
    user.set_password(payload.new_password)
    user.save()

    return {"succes": True, "status": 200, "detail": "Password changed succesfuly"}
    
@api.post('/auth/reset-password', )
def reset_password(request, payload: schemas.RequestResetPasswordSchema):
    try:
        user = User.objects.get(email=payload.email)
        send_password_reset_email(user)
        # return {"success": True}
    except Exception as e:
        return {"error": str(e)}
    return {"detail": "Jeśli konto istnieje, wysłaliśmy link do resetu hasła."}

@api.post("/auth/reset-password/confirm")
def password_reset_confirm(request, payload: schemas.ResetPasswordConfirmSchema):
    try:
        uid = urlsafe_base64_decode(str(payload.uid)).decode()
        user = User.objects.get(pk=uid)
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return api.create_response(request, {"detail": "Nieprawidłowy link."}, status=400)

    if not default_token_generator.check_token(user, payload.token):
        return api.create_response(request, {"detail": "Token resetu jest nieprawidłowy lub wygasł."}, status=400)

    user.set_password(payload.new_password)
    user.save()

    return {"success": True, "status": 200, "detail": "Password changed succesfully"}



class RoomOut(Schema):
    model_config = ConfigDict(from_attributes=True) 

    id: str
    number: str
    image: str | None
    name: str | None
    room_type: str
    capacity: int
    price_per_night: Decimal
    description: str | None
    is_active: bool

@api.get("/rooms/available", response=List[RoomOut])
def get_available_rooms(
    request,
    check_in: date,
    check_out: date,
    guests: int,
):
    """
    Zwraca listę pokoi dostępnych w podanym zakresie dat,
    dla zadanej liczby gości.
    """

    # prosta walidacja
    if check_out <= check_in:
        # możesz też rzucić HttpError(400, "...")
        raise ValueError("Data wyjazdu musi być późniejsza niż data przyjazdu.")

    if guests <= 0:
        raise ValueError("Liczba gości musi być dodatnia.")

    # Statusy rezerwacji, które BLOKUJĄ pokój
    blocking_statuses = ["pending", "confirmed"]

    # Szukamy pokoi aktywnych, które mają wystarczającą pojemność
    qs = Room.objects.filter(
        is_active=True,
        capacity__gte=guests,
    ).exclude(
        # wykluczamy te, które mają rezerwacje nachodzące na zakres
        reservations__status__in=blocking_statuses,
        reservations__check_in__lt=check_out,
        reservations__check_out__gt=check_in,
    ).order_by("number")

    return qs