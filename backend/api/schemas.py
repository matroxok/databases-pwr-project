from pydantic import BaseModel, EmailStr
 
 
class SignInSchema(BaseModel):
    email: str
    password: str

class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: str

class RequestResetPasswordSchema(BaseModel):
    email: EmailStr

class ResetPasswordConfirmSchema(BaseModel):
    uid: str
    token: str
    new_password: str

class MessageSchema(BaseModel):
    detail: str
