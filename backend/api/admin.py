from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm

from .models import CustomUser, Room, Reservation


# admin manage users

class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ("email", "username", "role")


class CustomUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = CustomUser
        fields = ("email", "username", "role", "is_active", "is_staff", "is_superuser", "groups", "user_permissions")


@admin.register(CustomUser)
class CustomUserAdmin(DjangoUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = CustomUser

    list_display = ("id", "email", "username", "role", "is_active", "is_staff", "is_superuser")
    list_filter = ("role", "is_active", "is_staff", "is_superuser", "groups")
    search_fields = ("email", "username")
    ordering = ("email",)

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Dane", {"fields": ("username", "role")}),
        ("Uprawnienia", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Daty", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "username", "role", "password1", "password2", "is_active", "is_staff", "is_superuser"),
        }),
    )


# admin manage rooms

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = (
        "number",
        "name",
        "room_type",
        "capacity",
        "price_per_night",
        "is_active",
    )
    list_filter = ("room_type", "is_active")
    search_fields = ("number", "name")
    ordering = ("number",)


# admin delete reservation
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "room", "check_in", "check_out", "status", "created_at")
    list_filter = ("status", "room", "created_at")
    search_fields = ("user__email", "room__number", "room__name")
    ordering = ("-created_at",)
    autocomplete_fields = ("user", "room")
