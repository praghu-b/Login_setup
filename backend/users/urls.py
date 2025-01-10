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
from django.urls import path
from users import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('forgot-password/', views.forgot_password, name='forgot-password'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('test-db/', views.test_db, name='test-db'),
    path('send-signup-otp/', views.send_signup_otp, name='send-signup-otp'),
    path('verify-signup-otp/', views.verify_signup_otp, name='verify-signup-otp'),
    path('send-reset-otp/', views.send_reset_otp, name='send-reset-otp'),
    path('verify-reset-otp/', views.verify_reset_otp, name='verify-reset-otp'),
    path('reset-password/', views.reset_password, name='reset-password'),
    path('send-mobile-otp/', views.send_mobile_otp, name='send-mobile-otp'),
    path('verify-mobile-otp/', views.verify_mobile_otp, name='verify-mobile-otp'),
    path('test-email/', views.test_email, name='test-email'),
    path('update-profile/', views.update_profile, name='update-profile'),
]