from ninja import NinjaAPI
from ninja.security import django_auth
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from api.models import CustomUser as User
from api import schemas
from ninja.errors import HttpError


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
    
# @api.post("/auth/reset-password")
# def reset_password(request, payload: schemas.ResetPasswordSchema):