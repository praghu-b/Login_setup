from datetime import datetime, timedelta
import random
from .mongodb import users_collection, admins_collection
from django.contrib.auth.hashers import make_password

class CustomUser:
    @staticmethod
    def create_user(name, email, mobile_number, password, user_type='user'):
        user = {
            "name": name,
            "email": email,
            "mobile_number": mobile_number,
            "password": make_password(password),
            "created_at": datetime.now(),
            "otp": None,
            "otp_valid_until": None
        }
        
        # Choose collection based on user type
        collection = admins_collection if user_type == 'admin' else users_collection
        return collection.insert_one(user)

    @staticmethod
    def get_user_by_email(email, user_type='user'):
        collection = admins_collection if user_type == 'admin' else users_collection
        return collection.find_one({"email": email})

    @staticmethod
    def generate_otp(email, user_type='user'):
        collection = admins_collection if user_type == 'admin' else users_collection
        otp = str(random.randint(100000, 999999))
        otp_valid_until = datetime.now() + timedelta(minutes=10)
        
        collection.update_one(
            {"email": email},
            {
                "$set": {
                    "otp": otp,
                    "otp_valid_until": otp_valid_until
                }
            }
        )
        return otp

    @staticmethod
    def update_password(email, new_password, user_type='user'):
        collection = admins_collection if user_type == 'admin' else users_collection
        return collection.update_one(
            {"email": email},
            {
                "$set": {
                    "password": make_password(new_password),
                    "otp": None,
                    "otp_valid_until": None
                }
            }
        )