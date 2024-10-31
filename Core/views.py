from django.shortcuts import render
from .serializers import UserSerializer,LoginSerializer,PartitureSetrializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status,viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics
from .models import Partitura

class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            tokens = serializer.create(serializer.validated_data)
            return Response(tokens, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserViewsets(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class PartitureViewsets(viewsets.ModelViewSet):
    queryset = Partitura.objects.all()
    serializer_class = PartitureSetrializer


# Create your views here.
def index(request):
    return render(request,'index.html')