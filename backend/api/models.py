from django.db import models
from django.contrib.auth.models import AbstractUser

from backend import settings

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
 
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
 
    def __str__(self):
        return self.email
    

class Room(models.Model):
    ROOM_TYPES = (
        ("single", "single"),
        ("double", "Double"),
        ("suite", "Suite"),
        ("family", "Family"),
    )

    id = models.CharField(unique=True, primary_key=True)
    number = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100, blank=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES)
    capacity = models.PositiveIntegerField(default=1)
    price_per_night = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["number"]

    def __str__(self):
        return f"{self.number} ({self.get_room_type_display()})"
    
class Reservation(models.Model):
    STATUS_CHOICES = (
        ("pending", "Oczekująca"),
        ("confirmed", "Potwierdzona"),
        ("cancelled", "Anulowana"),
        ("completed", "Zakończona"),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reservations",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,          # PROTECT
        related_name="reservations",
    )

    check_in = models.DateField()
    check_out = models.DateField()
    guests_count = models.PositiveIntegerField(default=1)

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        # tu możesz później dodać np. unikalność w danym czasie, jeśli zrobisz walidację na konflikty

    def __str__(self):
        return f"Rezerwacja #{self.id} – {self.user.email} – pokój {self.room.number}"

    @property
    def nights(self):
        # liczba nocy (przykładowa pomocnicza właściwość)
        return (self.check_out - self.check_in).days

class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = (
        ("stripe", "Stripe (online)"),
        ("cash", "Gotówka / Kasa fiskalna"),
    )

    STATUS_CHOICES = (
        ("pending", "Oczekująca"),
        ("succeeded", "Zakończona powodzeniem"),
        ("failed", "Nieudana"),
        ("refunded", "Zwrócona"),
        ("cancelled", "Anulowana"),
    )

    reservation = models.ForeignKey(
        "Reservation",            # string, żeby nie przejmować się kolejnością definicji klas
        on_delete=models.CASCADE,
        related_name="payments",  # reservation.payments.all()
    )

    # opcjonalnie: jeśli chcesz łatwo filtrować po użytkowniku
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="payments",
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)  # kwota brutto
    currency = models.CharField(max_length=3, default="PLN")

    method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    # Stripe – identyfikatory do powiązania z płatnością
    stripe_payment_intent_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="ID PaymentIntenta w Stripe (dla płatności online)",
    )
    stripe_charge_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="ID charge'a w Stripe (jeśli używane)",
    )
    stripe_session_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="ID Checkout Session (jeśli używasz Stripe Checkout)",
    )

    # Płatność w lokalu – numer paragonu / dokumentu z kasy
    receipt_number = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Numer paragonu z kasy fiskalnej (dla płatności w lokalu)",
    )

    paid_at = models.DateTimeField(blank=True, null=True)  # kiedy faktycznie opłacono
    created_at = models.DateTimeField(auto_now_add=True)   # kiedy utworzono rekord płatności
    updated_at = models.DateTimeField(auto_now=True)       # ostatnia aktualizacja

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Płatność #{self.id} – {self.amount} {self.currency} – {self.get_method_display()}"

    @property
    def is_successful(self) -> bool:
        return self.status == "succeeded"

