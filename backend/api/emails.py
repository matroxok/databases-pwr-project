from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes

import os
from dotenv import load_dotenv

def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)

    reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

    subject = "Password reset"
    message = (
        f"Cześć,\n\n"
        f"Aby zresetować hasło, kliknij w poniższy link:\n{reset_link}\n\n"
        f"Jeśli to nie Ty inicjowałeś/aś reset hasła, zignoruj tę wiadomość."
    )

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
    print("Email sent.")