from django.urls import path
from .views import GenerateSyllabusView, UpdateSyllabusView, GenerateContentView, RegenerateModuleContentView, DashboardView

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('dashboard/<str:course_name>/', DashboardView.as_view(), name='course-details'),
    path('generate-syllabus/', GenerateSyllabusView.as_view(), name='generate-syllabus'),
    path('update-syllabus/', UpdateSyllabusView.as_view(), name='update-syllabus'),
    path('generate-content/', GenerateContentView.as_view(), name='generate-content'),
    path('regenerate-module-content/', RegenerateModuleContentView.as_view(), name='regenerate-module-content'),
]
