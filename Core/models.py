from django.db import models
from music21 import converter, note, interval

# Create your models here.
class Partitura(models.Model):
    titulo = models.CharField(max_length=100, null=False, blank=False)
    autor = models.CharField(max_length=100, null=True, blank=True)
    descripcion = models.TextField(null=True, blank=True)
    archivo = models.FileField(upload_to='partituras/', null=False, blank=False)
    notas_transpuestas = models.JSONField(null=True, blank=True)
    notas_normales = models.JSONField(null=True, blank=True)

    # funcion que se encarga de obtener tanto las notas transpuestas como las notas normales
    def get_notes(self, intervalo_transposicion='M2'):
        # CARGAR EL ARCHIVO MUSICXML
        score = converter.parse(self.archivo.path)
        
        intervalo = interval.Interval(intervalo_transposicion)
        transpored_score = score.transpose(intervalo)

        # aqui extraemos las notas normales
        notas_normales = []
        for element in score.recurse():
            if isinstance(element, note.Note):
                notas_normales.append({
                    'nota': element.nameWithOctave,
                    'duracion': element.quarterLength
                })
        
        # aqui extraemos las notas transpuestas
        notas_transpuestas = []

        for element in transpored_score.recurse():
            if isinstance(element, note.Note):
                notas_transpuestas.append({
                    'nota': element.nameWithOctave,
                    'duracion': element.quarterLength
                })

        # guardamos las notas en los campos JSON
        self.notas_transpuestas = notas_transpuestas
        self.notas_normales = notas_normales
        self.save()

        # aqui analizamos la tonalidad de la partitura
        key = score.analyze('key')
        print(f"La llave: {key}")

    # definiendo serializador para los json de notas transpuestas y notas normales
    def serialize(self):
        return {
            'notas_transupuestas': self.notas_transupuestas,
            'notas_normales': self.notas_normales
        }
    

    def __str__(self):
        return self.archivo.name