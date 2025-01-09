from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
from django.contrib.auth.hashers import check_password
from django.core.mail import send_mail, get_connection
from django.core.mail.backends.smtp import EmailBackend
from datetime import datetime, timedelta
from django.conf import settings
from .models import CustomUser
from pymongo.errors import ConnectionFailure, OperationFailure
from .mongodb import users_collection, admins_collection, db
import logging
import random
from django.core.cache import cache
import json
from bson import ObjectId
from django.contrib.auth.hashers import make_password

# Set up logging
logger = logging.getLogger(__name__)

def send_email_otp(email, otp):
    """Send OTP via email"""
    try:
        send_mail(
            'Verification OTP',
            f'Your OTP is: {otp}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        logger.error(f"Error sending email OTP: {str(e)}")
        return False

def send_sms_otp(phone, otp):
    """Send OTP via SMS"""
    try:
        # Implement your SMS sending logic here
        # For now, we'll just log it
        logger.info(f"SMS OTP {otp} would be sent to {phone}")
        return True
    except Exception as e:
        logger.error(f"Error sending SMS OTP: {str(e)}")
        return False

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(subject, message, to_email):
    try:
        # Create a new connection for each email
        connection = get_connection(
            backend='django.core.mail.backends.smtp.EmailBackend',
            host=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_HOST_USER,
            password=settings.EMAIL_HOST_PASSWORD,
            use_tls=settings.EMAIL_USE_TLS
        )

        # Send email
        sent = send_mail(
            subject,
            message,
            settings.EMAIL_HOST_USER,
            [to_email],
            fail_silently=False,
            connection=connection
        )

        if sent == 1:
            logger.info(f"Email sent successfully to {to_email}")
            return True
        else:
            logger.error(f"Failed to send email to {to_email}")
            return False

    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {str(e)}")
        if settings.DEBUG:
            print(f"Would send email:\nTo: {to_email}\nSubject: {subject}\nMessage: {message}")
        return False

@api_view(['POST'])
def send_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = data.get('email') or data.get('phone')
            type = data.get('type')
            
            if not identifier:
                return JsonResponse({'error': f'Missing {type}'}, status=400)
            
            otp = generate_otp()
            # Store OTP in cache with 1-minute expiration
            cache.set(f'otp_{type}_{identifier}', otp, timeout=60)
            
            # Send OTP via email or SMS based on type
            if type == 'email':
                if not send_email_otp(identifier, otp):
                    return JsonResponse({'error': 'Failed to send email OTP'}, status=500)
            else:
                if not send_sms_otp(identifier, otp):
                    return JsonResponse({'error': 'Failed to send SMS OTP'}, status=500)
                
            return JsonResponse({'message': 'OTP sent successfully'})
        except Exception as e:
            logger.error(f"Error in send_otp: {str(e)}")
            return JsonResponse({'error': 'Internal server error'}, status=500)

@api_view(['POST'])
def verify_otp(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            identifier = data.get('email') or data.get('phone')
            type = data.get('type')
            user_otp = data.get('otp')
            
            if not all([identifier, type, user_otp]):
                return JsonResponse({'error': 'Missing required fields'}, status=400)
            
            stored_otp = cache.get(f'otp_{type}_{identifier}')
            
            if not stored_otp:
                return JsonResponse({'error': 'OTP expired'}, status=400)
                
            if stored_otp != user_otp:
                return JsonResponse({'error': 'Invalid OTP'}, status=400)
                
            # Clear the OTP after successful verification
            cache.delete(f'otp_{type}_{identifier}')
            
            return JsonResponse({'message': 'OTP verified successfully'})
        except Exception as e:
            logger.error(f"Error in verify_otp: {str(e)}")
            return JsonResponse({'error': 'Internal server error'}, status=500)

@api_view(['POST'])
def register_user(request):
    try:
        logger.info("Registration request data: %s", request.data)
        name = request.data.get('name')
        email = request.data.get('email')
        mobile_number = request.data.get('mobile_number')
        password = request.data.get('password')
        user_type = request.data.get('user_type', 'user')
        
        logger.info("Processing registration for user_type: %s", user_type)
        
        # Validate required fields
        if not all([name, email, mobile_number, password]):
            missing = [field for field in ['name', 'email', 'mobile_number', 'password'] 
                      if not request.data.get(field)]
            return Response(
                {'error': f'Missing required fields: {", ".join(missing)}'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if email already exists
        existing_user = CustomUser.get_user_by_email(email, 'user')
        existing_admin = CustomUser.get_user_by_email(email, 'admin')
        
        if existing_user or existing_admin:
            return Response(
                {'error': 'Email already registered'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create user/admin
        result = CustomUser.create_user(name, email, mobile_number, password, user_type)
        logger.info("User created with ID: %s", result.inserted_id)
        
        return Response(
            {
                'message': f'{user_type.capitalize()} registered successfully',
                'user_type': user_type,
                'id': str(result.inserted_id)
            }, 
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        logger.error("Registration error: %s", str(e), exc_info=True)
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )

@api_view(['POST'])
def login_user(request):
    try:
        logger.info("Login request data: %s", request.data)
        email = request.data.get('email')
        password = request.data.get('password')
        user_type = request.data.get('user_type', 'user')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        user = CustomUser.get_user_by_email(email, user_type)
        logger.info("Found user: %s", bool(user))
        
        if not user:
            return Response(
                {'error': 'Invalid credentials'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify password using Django's check_password
        if check_password(password, user['password']):
            response_data = {
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'user_type': user_type,
                'mobile_number': user.get('mobile_number', '')
            }
            logger.info("Login successful for user: %s", email)
            return Response(response_data)
        
        logger.warning("Invalid password for user: %s", email)
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error("Login error: %s", str(e), exc_info=True)
        return Response(
            {'error': 'Login failed'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email')
    user = CustomUser.get_user_by_email(email)
    
    if not user:
        return Response(
            {'error': 'Email not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    otp = CustomUser.generate_otp(email)
    
    # Send OTP via email
    send_mail(
        'Password Reset OTP',
        f'Your OTP for password reset is: {otp}',
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )
    return Response({'message': 'OTP sent to your email'})

@api_view(['GET'])
def test_db(request):
    try:
        # Test both collections
        users_count = users_collection.count_documents({})
        admins_count = admins_collection.count_documents({})
        
        return Response({
            'status': 'success',
            'message': 'MongoDB Atlas connection successful',
            'users_count': users_count,
            'admins_count': admins_count
        })
    except (ConnectionFailure, OperationFailure) as e:
        logger.error(f"MongoDB connection error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'Database connection failed'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response({
            'status': 'error',
            'message': 'An unexpected error occurred'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def send_signup_otp(request):
    try:
        data = request.data
        email = data.get('email')
        verification_type = data.get('type')

        if not email or not verification_type:
            return Response(
                {'error': 'Email and type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        if settings.DEBUG:
            print(f"Generated OTP for {email}: {otp}")

        # Store OTP temporarily
        temp_otps_collection = db["temp_otps"]
        temp_otps_collection.update_one(
            {
                "email": email,
                "type": verification_type
            },
            {
                "$set": {
                    "otp": otp,
                    "valid_until": datetime.now() + timedelta(minutes=1),
                    "type": verification_type
                }
            },
            upsert=True
        )

        # Send OTP via email
        send_mail(
            f'{verification_type.capitalize()} Verification OTP',
            f'Your OTP for {verification_type} verification is: {otp}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        return Response({
            'message': f'OTP sent successfully to your {verification_type}'
        })

    except Exception as e:
        logger.error(f"Error sending signup OTP: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to send OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def verify_signup_otp(request):
    try:
        data = request.data
        email = data.get('email')
        otp = data.get('otp')
        verification_type = data.get('type')

        if not all([email, otp, verification_type]):
            return Response(
                {'error': 'Email, OTP and type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get stored OTP from temporary collection
        temp_otps_collection = db["temp_otps"]
        stored_data = temp_otps_collection.find_one({
            "email": email,
            "type": verification_type
        })

        if not stored_data:
            return Response(
                {'error': 'No OTP found for this email'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if stored_data['otp'] != otp:
            return Response(
                {'error': 'Invalid OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if stored_data['valid_until'] < datetime.now():
            # Remove expired OTP
            temp_otps_collection.delete_one({"email": email, "type": verification_type})
            return Response(
                {'error': 'OTP has expired'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove the used OTP
        temp_otps_collection.delete_one({"email": email, "type": verification_type})

        return Response({
            'message': f'{verification_type.capitalize()} verified successfully'
        })

    except Exception as e:
        logger.error(f"Error verifying signup OTP: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to verify OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def send_reset_otp(request):
    try:
        data = request.data
        email = data.get('email')
        verification_type = data.get('type')

        if not email or not verification_type:
            return Response(
                {'error': 'Email and type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate and store OTP
        otp = str(random.randint(100000, 999999))
        otp_valid_until = datetime.now() + timedelta(minutes=1)

        # Store OTP first
        temp_otps_collection = db["temp_otps"]
        temp_otps_collection.update_one(
            {
                "email": email,
                "type": verification_type
            },
            {
                "$set": {
                    "otp": otp,
                    "valid_until": otp_valid_until,
                    "type": verification_type
                }
            },
            upsert=True
        )

        # Send email
        email_sent = send_otp_email(
            'Password Reset OTP',
            f'Your OTP for password reset is: {otp}',
            email
        )

        if not email_sent:
            # If email fails, delete the stored OTP
            temp_otps_collection.delete_one({
                "email": email,
                "type": verification_type
            })
            return Response(
                {'error': 'Failed to send OTP email'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        return Response({
            'message': 'OTP sent successfully to your email'
        })

    except Exception as e:
        logger.error(f"Error in send_reset_otp: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to process request'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def verify_reset_otp(request):
    try:
        data = request.data
        email = data.get('email')
        otp = data.get('otp')
        verification_type = data.get('type')

        if not all([email, otp, verification_type]):
            return Response(
                {'error': 'Email, OTP and type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify OTP
        temp_otps_collection = db["temp_otps"]
        stored_data = temp_otps_collection.find_one({
            "email": email,
            "type": verification_type
        })

        if not stored_data:
            return Response(
                {'error': 'No OTP found for this email'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if stored_data['otp'] != otp:
            return Response(
                {'error': 'Invalid OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if stored_data['valid_until'] < datetime.now():
            # Remove expired OTP
            temp_otps_collection.delete_one({
                "email": email,
                "type": verification_type
            })
            return Response(
                {'error': 'OTP has expired'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove the used OTP
        temp_otps_collection.delete_one({
            "email": email,
            "type": verification_type
        })

        return Response({
            'message': 'OTP verified successfully'
        })

    except Exception as e:
        logger.error(f"Error verifying reset OTP: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to verify OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def send_mobile_otp(request):
    try:
        data = request.data
        mobile_number = data.get('mobile_number')
        email = data.get('email')  # We'll use this to send OTP for testing
        verification_type = data.get('type')

        if not mobile_number or not email or not verification_type:
            return Response(
                {'error': 'Mobile number, email and type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Generate OTP
        otp = str(random.randint(100000, 999999))
        otp_valid_until = datetime.now() + timedelta(minutes=1)

        # Store OTP temporarily with both mobile and email
        temp_otps_collection = db["temp_otps"]
        temp_otps_collection.update_one(
            {
                "mobile_number": mobile_number,
                "email": email,
                "type": verification_type
            },
            {
                "$set": {
                    "otp": otp,
                    "valid_until": otp_valid_until,
                    "type": verification_type
                }
            },
            upsert=True
        )

        # For testing purposes, send OTP via email
        send_mail(
            'Mobile Number Verification',
            f'Your OTP for mobile number verification is: {otp}',
            settings.EMAIL_HOST_USER,
            [email],
            fail_silently=False,
        )

        return Response({
            'message': 'OTP sent successfully to your email (for mobile verification)'
        })

    except Exception as e:
        logger.error(f"Error sending mobile OTP: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to send OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def verify_mobile_otp(request):
    try:
        data = request.data
        mobile_number = data.get('mobile_number')
        otp = data.get('otp')
        verification_type = data.get('type')

        if not all([mobile_number, otp, verification_type]):
            return Response(
                {'error': 'Mobile number, OTP and type are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get stored OTP from temporary collection
        temp_otps_collection = db["temp_otps"]
        stored_data = temp_otps_collection.find_one({
            "mobile_number": mobile_number,
            "type": verification_type
        })

        if not stored_data:
            return Response(
                {'error': 'No OTP found for this mobile number'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if stored_data['otp'] != otp:
            return Response(
                {'error': 'Invalid OTP'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        if stored_data['valid_until'] < datetime.now():
            # Remove expired OTP
            temp_otps_collection.delete_one({
                "mobile_number": mobile_number,
                "type": verification_type
            })
            return Response(
                {'error': 'OTP has expired'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove the used OTP
        temp_otps_collection.delete_one({
            "mobile_number": mobile_number,
            "type": verification_type
        })

        return Response({
            'message': 'Mobile number verified successfully'
        })

    except Exception as e:
        logger.error(f"Error verifying mobile OTP: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to verify OTP'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def reset_password(request):
    try:
        data = request.data
        email = data.get('email')
        new_password = data.get('new_password')

        if not email or not new_password:
            return Response(
                {'error': 'Email and new password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if user exists
        user = CustomUser.get_user_by_email(email, 'user')
        admin = CustomUser.get_user_by_email(email, 'admin')

        if not user and not admin:
            return Response(
                {'error': 'Email not registered'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update password in appropriate collection
        if user:
            CustomUser.update_password(email, new_password, 'user')
        else:
            CustomUser.update_password(email, new_password, 'admin')

        # Clear any remaining OTPs for this email
        temp_otps_collection = db["temp_otps"]
        temp_otps_collection.delete_many({
            "email": email,
            "type": "reset"
        })

        return Response({
            'message': 'Password reset successful'
        })

    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to reset password'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def test_email(request):
    try:
        send_mail(
            'Test Email',
            'This is a test email.',
            settings.EMAIL_HOST_USER,
            [settings.EMAIL_HOST_USER],  # Send to yourself
            fail_silently=False,
        )
        return Response({'message': 'Test email sent successfully'})
    except Exception as e:
        logger.error(f"Email test error: {str(e)}")
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
def update_profile(request):
    try:
        user_id = request.data.get('user_id')
        field = request.data.get('field')
        value = request.data.get('value')

        if not all([user_id, field, value]):
            return Response(
                {'error': 'Missing required fields'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get user collection based on user type
        user = users_collection.find_one({'_id': ObjectId(user_id)})
        collection = users_collection if user else admins_collection

        # Update the field
        if field == 'password':
            value = make_password(value)

        result = collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {field: value}}
        )

        if result.modified_count == 1:
            return Response({'success': True, 'message': f'{field} updated successfully'})
        else:
            return Response(
                {'error': 'Failed to update profile'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Failed to update profile'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )