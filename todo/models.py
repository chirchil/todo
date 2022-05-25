from django.db import models

# Create your models here.
class TaskModel(models.Model):
    title = models.CharField(max_length=255)
    is_completed = models.BooleanField(default=False)
    
    