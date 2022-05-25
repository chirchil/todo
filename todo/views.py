from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import SerializerTask
from .models import TaskModel
# Create your views here.

def index(request):
    return render(request, 'todo/index.html')


class TodoServiceAPIView(APIView):
    def get(self, request):
        tasks = TaskModel.objects.all()
        return Response({
            tasks.values()
        })  
        
        
    def post(self, request):
        serializer = SerializerTask(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response({
            'post': 'ОК',
            })
        
        
    def put(self, request, *args, **kwargs):
        pk = kwargs.get("pk", None)
        if not pk:
            return Response({
                "error": "Method PUT not allowed"
            })
        try:
            instance = TaskModel.objects.get(pk = pk)
        except:
            return Response({
                "error": "Object does not exists"
            })

        serializer = SerializerTask(data=request.data,instance=instance)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'post': serializer.data,
            })
        
        
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get("pk", None)
        if not pk:
            return Response({
                "error": "Method DELETE not allowed"
            })
        
        try:
            instance = TaskModel.objects.get(pk = pk)
            instance.delete()
        except:
            return Response({
                "error": "Object does not exists"
            })
            
        return Response({
            'post': f"delete task {pk}"
        })