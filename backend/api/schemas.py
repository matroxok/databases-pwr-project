from pydantic import BaseModel
 
 
class SignInSchema(BaseModel):
    email: str
    password: str

class ChangePasswordSchema(BaseModel):
    old_password: str
    new_password: str

class ResetPasswordSchema(BaseModel):
    email: str
    token: str
    new_password: str