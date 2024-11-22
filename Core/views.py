from .serializers import UserSerializer,LoginSerializer,PartitureSerializer
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status,viewsets
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics
import os
from rest_framework.exceptions import ValidationError
from .models import Partitura
from rest_framework.authentication import BasicAuthentication
from rest_framework.permissions import IsAuthenticated, AllowAny 
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404,HttpResponse,render

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
    serializer_class = PartitureSerializer
    permission_classes = [IsAuthenticated] 
    authentication_classes = [BasicAuthentication]

    def perform_create(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionError('Usuario no autenticado')
        
        # Validar el archivo antes de guardarlo
        archivo = self.request.FILES.get('archivo')  # Asegúrate de que 'archivo' sea el nombre correcto del campo en el formulario
        if archivo:
            # Validar la extensión del archivo
            valid_extensions = ['.xml', '.mxl', '.musicxml', '.midi']
            file_extension = os.path.splitext(archivo.name)[1].lower()

            if file_extension not in valid_extensions:
                raise ValidationError("El archivo debe ser uno de los siguientes tipos: .xml, .mxl, .musicxml, .midi")
        
        partitura = serializer.save(user = user)
        partitura.get_notes()  # Ejecuta el procesamiento de notas después de crear la partitura

    def perform_update(self, serializer):
        user = self.request.user
        if not user.is_authenticated:
            raise PermissionError('Usuario no autenticado')
        
         # Validar el archivo antes de guardarlo
        archivo = self.request.FILES.get('archivo')  # Asegúrate de que 'archivo' sea el nombre correcto del campo en el formulario
        if archivo:
            # Validar la extensión del archivo
            valid_extensions = ['.xml', '.mxl', '.musicxml', '.midi']
            file_extension = os.path.splitext(archivo.name)[1].lower()
        
        partitura = serializer.save(user = user)
        partitura.get_notes()  # Ejecuta el procesamiento de notas después de actualizar la partitura

    @action(detail=True, methods=['post'],url_path='generar_notas')
    def generar_notas(self, request, pk=None):
        try:
            partitura = self.get_object()
            intervalo = request.data.get("intervalo", "M2")
            partitura.get_notes(intervalo_transposicion=intervalo)
            return Response({'status': "Nota creada exitosamente"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'],url_path='metadata')
    def obtener_metadata(self, request, pk=None):
        try:
            partitura = self.get_object()
            serializer = self.get_serializer(partitura)
            return Response(serializer, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

# Create your views here.
def index(request):
    return render(request,'index.html')