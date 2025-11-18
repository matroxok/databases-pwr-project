from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser, Room, Reservation, Payment


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

    # pola tylko do odczytu (np. automatyczne timestampy)
    # readonly_fields = ("updated_at", )

