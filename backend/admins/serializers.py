from rest_framework import serializers

class SyllabusInputSerializer(serializers.Serializer):
    course_name = serializers.CharField(max_length=255)
    domain = serializers.CharField(max_length=255)
    level = serializers.CharField(max_length=50)
    tone = serializers.CharField(max_length=50)
    duration = serializers.CharField(max_length=50)
