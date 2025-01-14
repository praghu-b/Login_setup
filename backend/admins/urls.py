from django.urls import path
from .views import GenerateSyllabusView, UpdateSyllabusView, GenerateContentView, RegenerateModuleContentView, DashboardView, save_syllabus, save_generated_content

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('generate-syllabus/', GenerateSyllabusView.as_view(), name='generate-syllabus'),
    path('update-syllabus/', UpdateSyllabusView.as_view(), name='update-syllabus'),
    path('generate-content/', GenerateContentView.as_view(), name='generate-content'),  # New endpoint for generating content
    path('regenerate-module-content/', RegenerateModuleContentView.as_view(), name='regenerate-module-content'),  # New endpoint for regenerating module content
    path('save-syllabus/', save_syllabus, name='save-syllabus'),  # Add save-syllabus endpoint
    path('save-course/', save_generated_content, name='save-course'),  # Add save-course endpoint
    path('<str:adminId>/courses/', DashboardView.as_view(), name='admin-courses')  # Updated path
]