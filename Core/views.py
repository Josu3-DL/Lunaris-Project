from django.shortcuts import render
from .serializers import UserSerializer,LoginSerializer,PartitureSetrializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status,viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics
from .models import Partitura
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny 

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
    permission_classes = [AllowAny] # esto es para que pueda acceder sin necesidad de estar autenticado
    authentication_classes = [BasicAuthentication]

    def perform_create(self, serializer):
        partitura = serializer.save()
        partitura.get_notes()  # Ejecuta el procesamiento de notas después de crear la partitura

    def perform_update(self, serializer):
        partitura = serializer.save()
        partitura.get_notes()  # Ejecuta el procesamiento de notas después de actualizar la partitura
    
    def generar_notas(self, request, pk=None):
        try:
            partitura = self.get_object()
            intervalo = request.data.get("invervalo", "M2")
            partitura.get_notes(intervalo_transposicion=intervalo)
            return Response({'status': "Nota creada exitosamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Create your views here.
def index(request):
    return render(request,'index.html')