from django.db import models
from django.contrib.auth.models import User
# Create your models here.


from django.db import models
from music21 import converter, note, interval, chord

# Create your models here.
class Partitura(models.Model):
    titulo = models.CharField(max_length=100, null=False, blank=False)
    autor = models.CharField(max_length=100, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    archivo = models.FileField(upload_to='partituras/', null=False, blank=False)
    notas_transpuestas = models.JSONField(null=True, blank=True)
    notas_normales = models.JSONField(null=True, blank=True)
    user = models.ForeignKey(User,  on_delete=models.CASCADE)

    # nuevos campos
    time_signature = models.CharField(max_length=10, null=True, blank=True)
    key_signature = models.CharField(max_length=20, null=True, blank=True)  # se aumenta el max_length para mostrar mayor/menor
    clef = models.CharField(max_length=10, null=True, blank=True)

    # función que se encarga de obtener tanto las notas transpuestas como las notas normales
    def get_notes(self, intervalo_transposicion='M2'):
        # Cargar el archivo MusicXML
        score = converter.parse(self.archivo.path)

        # Obtener la firma de tiempo (time signature)
        time_signatures = score.parts[0].getTimeSignatures()
        if time_signatures:
            time_signature = time_signatures[0]
            # Guardar como numerador/denominador
            self.time_signature = f"{time_signature.numerator}/{time_signature.denominator}"

        # Obtener la firma tonal (key signature)
        key_signature = score.analyze('key')
        if key_signature:
            # Guardar la tonalidad con el nombre musical (mayor/menor)
            self.key_signature = f"{key_signature.tonic.name} {key_signature.mode}"

        # Obtener la clave (clef)
        clefs = score.recurse().getElementsByClass('Clef')
        if clefs:
            self.clef = clefs[0].name  # Mostrar solo el nombre de la clave

        # Proceso de transposición
        intervalo = interval.Interval(intervalo_transposicion)
        transposed_score = score.transpose(intervalo)

        # Extraer las notas normales (incluyendo acordes)
        notas_normales = []
        for element in score.recurse():
            if isinstance(element, note.Note):
                notas_normales.append({
                    'nota': element.nameWithOctave,
                    'duracion': element.quarterLength
                })
            elif isinstance(element, chord.Chord):
                notas_normales.append({
                    'nota': [n.nameWithOctave for n in element.notes],
                    'duracion': element.quarterLength
                })

        # Extraer las notas transpuestas (incluyendo acordes)
        notas_transpuestas = []
        for element in transposed_score.recurse():
            if isinstance(element, note.Note):
                notas_transpuestas.append({
                    'nota': element.nameWithOctave,
                    'duracion': element.quarterLength
                })
            elif isinstance(element, chord.Chord):
                notas_transpuestas.append({
                    'nota': [n.nameWithOctave for n in element.notes],
                    'duracion': element.quarterLength
                })

        # Guardar las notas y la metadata en los campos JSON
        self.notas_transpuestas = notas_transpuestas
        self.notas_normales = notas_normales
        self.save()

        # Aquí se analiza la tonalidad de la partitura
        key = score.analyze('key')
        print(f"La llave: {key}")

    def serialize(self):
        return {
            'titulo': self.titulo,
            'autor': self.autor,
            'descripcion': self.descripcion,
            'time_signature': self.time_signature,
            'key_signature': self.key_signature,
            'clef': self.clef,
            'notas_transpuestas': self.notas_transpuestas,
            'notas_normales': self.notas_normales,
            'usuario': self.user
        }

    def __str__(self):
        return self.titulo