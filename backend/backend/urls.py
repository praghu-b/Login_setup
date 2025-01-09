"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from users import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', views.register_user, name='register'),
    path('api/login/', views.login_user, name='login'),
    path('api/forgot-password/', views.forgot_password, name='forgot-password'),
    path('api/verify-otp/', views.verify_otp, name='verify-otp'),
    path('api/test-db/', views.test_db, name='test-db'),
    path('api/send-signup-otp/', views.send_signup_otp, name='send-signup-otp'),
    path('api/verify-signup-otp/', views.verify_signup_otp, name='verify-signup-otp'),
    path('api/send-reset-otp/', views.send_reset_otp, name='send-reset-otp'),
    path('api/verify-reset-otp/', views.verify_reset_otp, name='verify-reset-otp'),
    path('api/reset-password/', views.reset_password, name='reset-password'),
    path('api/send-mobile-otp/', views.send_mobile_otp, name='send-mobile-otp'),
    path('api/verify-mobile-otp/', views.verify_mobile_otp, name='verify-mobile-otp'),
    path('api/test-email/', views.test_email, name='test-email'),
    path('api/update-profile/', views.update_profile, name='update-profile'),
]