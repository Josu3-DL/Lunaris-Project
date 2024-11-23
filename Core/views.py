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
from music21 import converter, tempo
from midi2audio import FluidSynth
from django.conf import settings

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
            valid_extensions = ['.xml', '.mxl', '.musicxml', '.mid']
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
            valid_extensions = ['.xml', '.mxl', '.musicxml', '.mid']
            file_extension = os.path.splitext(archivo.name)[1].lower()
        
        partitura = serializer.save(user = user)
        partitura.get_notes()  # Ejecuta el procesamiento de notas después de actualizar la partitura

  
    @action(detail=True, methods=['post'], url_path='convertir_audio')
    def convertir_audio(self, request, pk=None):
        try:
            # Obtener la partitura desde el objeto
            partitura = self.get_object()

            # Verificar si la partitura tiene un archivo asociado
            if not partitura.archivo:
                return Response({'error': 'No se encontró un archivo asociado a la partitura'}, status=status.HTTP_400_BAD_REQUEST)

            input_file = partitura.archivo.path  # Asegúrate de que 'archivo' es un campo FileField

            # Parsear el archivo MusicXML
            try:
                score = converter.parse(input_file)
            except Exception as e:
                return Response({'error': f'Error al procesar el archivo MusicXML: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

            # Establecer un tempo por defecto
            default_tempo = tempo.MetronomeMark(number=90)
            score.insert(0, default_tempo)

              # Crear la carpeta de destino si no existe
            audio_dir = os.path.join(settings.MEDIA_ROOT, 'audio')
            os.makedirs(audio_dir, exist_ok=True)

            # Guardar el archivo MIDI
            midi_file = os.path.join(audio_dir, 'output.mid')
            score.write('midi', fp=midi_file)

            # Verificar si el archivo MIDI se generó correctamente
            if not os.path.exists(midi_file):
                return Response({'error': 'El archivo MIDI no fue generado correctamente.'}, status=status.HTTP_400_BAD_REQUEST)

            # Convertir MIDI a WAV usando FluidSynth
            soundfont = 'Core\static\Core\soundfont\MS_Basic.sf3'  # Ruta al archivo SoundFont
            if not os.path.exists(soundfont):
                return Response({'error': 'El archivo SoundFont no se encuentra en la ruta especificada.'}, status=status.HTTP_400_BAD_REQUEST)

            audio_file_wav =  os.path.join(audio_dir, f'{partitura.titulo}.wav')
            fs = FluidSynth(soundfont)
            fs.midi_to_audio(midi_file, audio_file_wav)

            # Verificar si el archivo de audio se generó correctamente
            if not os.path.exists(audio_file_wav):
                return Response({'error': 'El archivo de audio WAV no fue generado correctamente.'}, status=status.HTTP_400_BAD_REQUEST)

            # Leer el archivo de audio y enviarlo como respuesta
            with open(audio_file_wav, 'rb') as audio_file:
                response = HttpResponse(audio_file, content_type='audio/wav')
                response['Content-Disposition'] = f'attachment; filename="{partitura.titulo}.wav"'
                return response

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
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