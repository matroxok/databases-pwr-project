from ninja import Schema
from datetime import date
from typing import Optional
from decimal import Decimal
from pydantic import EmailStr
from pydantic import ConfigDict

class SignInSchema(Schema):
    email: str
    password: str

class ChangePasswordSchema(Schema):
    old_password: str
    new_password: str

class RequestResetPasswordSchema(Schema):
    email: EmailStr

class ResetPasswordConfirmSchema(Schema):
    uid: str
    token: str
    new_password: str

class MessageSchema(Schema):
    detail: str


class RoomOut(Schema):
    model_config = ConfigDict(from_attributes=True)
    id: str
    number: str
    image: Optional[str] = None
    name: Optional[str] = None
    room_type: str
    capacity: int
    beds: int
    price_per_night: Decimal
    description: Optional[str] = None
    is_active: bool
    


class CreateReservationSchema(Schema):
    room_id: str
    check_in: date
    check_out: date
    guests_count: int = 1
    notes: Optional[str] = None


class ReservationOut(Schema):
    id: int
    room_id: str
    check_in: date
    check_out: date
    guests_count: int
    status: str
    notes: Optional[str] = None
    created_at: str

class UpdateReservationSchema(Schema):
    check_in: date
    check_out: date
    guests_count: int
    notes: Optional[str] = ""