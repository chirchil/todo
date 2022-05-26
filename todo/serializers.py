from django.contrib.auth.models import User, Group
from rest_framework import serializers

from .models import TaskModel


class SerializerTask(serializers.Serializer):
    title = serializers.CharField(max_length=255)
    is_completed = serializers.BooleanField(default=False)



    def create(self, validated_data):
        return TaskModel.objects.create(**validated_data)


    def update(self, instance, validated_data):
        print(f"instance {instance}")
        instance.title = validated_data.get("title", instance.title)
        instance.is_completed = validated_data.get("is_completed", instance.is_completed)
        instance.save()
        return instance
