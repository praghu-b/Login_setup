from django.urls import path
from . import views

urlpatterns = [
    path('fetch-all-courses/', views.fetch_all_courses, name='fetch_all_courses'),
    path('<str:courseId>/fetch-syllabus/', views.fetch_syllabus, name='fetch_course'),
    path('enroll/', views.enroll_user_in_course, name='enroll_user_in_course'),
    path('<str:userId>/enrolled-courses/', views.fetch_user_enrolled_courses, name='fetch_enrolled_courses'),
]