## narazie ten sposób, bo trzeba poprawić użytkownika jeszcze itp.

```
@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ("id", "reservation", "user", "amount", "currency", "method", "status", "paid_at")
    list_filter = ("status", "method", "currency")
    search_fields = ("reservation__id", "user__email", "stripe_payment_intent_id")
    autocomplete_fields = ("reservation", "user")

    readonly_fields = ("created_at", "updated_at")
```

```dotnetcli
@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "room", "check_in", "check_out", "status", "created_at")
    list_filter = ("status", "room", "check_in", "check_out")
    search_fields = ("user__email", "room__number")
    autocomplete_fields = ("user", "room")

    # np. recepcja może zmieniać status, ale nie usuwać rezerwacji
    def has_delete_permission(self, request, obj=None):
        # tylko superuser może kasować
        return request.user.is_superuser
```

```dotnetcli
@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ("number", "name", "room_type", "capacity", "price_per_night", "is_active")
    list_filter = ("room_type", "is_active")
    search_fields = ("number", "name")
```

```dotnetcli
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Używamy emaila jako loginu w panelu.
    """
    model = CustomUser
    list_display = ("email", "username", "is_active", "is_staff", "is_superuser")
    ordering = ("email",)
    search_fields = ("email", "username")

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Dane osobowe", {"fields": ("username",)}),
        (
            "Uprawnienia",
            {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")},
        ),
        ("Ważne daty", {"fields": ("last_login", "date_joined")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "username", "password1", "password2", "is_staff", "is_superuser"),
            },
        ),
    )

    # żeby admin traktował email jak username
    def get_username(self, obj):
        return obj.email
```
