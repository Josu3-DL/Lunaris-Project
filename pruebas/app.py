from music21 import converter, note, interval

# Cargar el archivo MusicXML
score = converter.parse('playthatsheet-Paspie.musicxml')

# Obtener la clave (clef), la firma de tiempo y la firma tonal
clefs = score.recurse().getElementsByClass('Clef')
time_signatures = score.parts[0].getTimeSignatures()
key_signature = score.analyze('key')

# Imprimir las claves
if clefs:
    clef_name = clefs[0].name
    print(f'Clave: {clef_name}')
else:
    print('No se encontraron claves')

# Imprimir la firma de tiempo de manera más amigable
if time_signatures:
    time_signature = time_signatures[0]
    print(f'Firma de tiempo: {time_signature.numerator}/{time_signature.denominator}')
else:
    print('No se encontró firma de tiempo')

# Imprimir la firma tonal (key signature)
print(f'Firma tonal: {key_signature}')

# Intervalo de transposición
intervalo = interval.Interval('M2')
transposed_score = score.transpose(intervalo)

# Extraer las notas originales
notes = []
for element in score.recurse():
    if isinstance(element, note.Note):
        notes.append(element)

# Extraer las notas transpuestas
transposed_notes = []
for element in transposed_score.recurse():
    if isinstance(element, note.Note):
        transposed_notes.append(element)

# Imprimir las notas originales
for n in notes:
    print(f'Nota: {n.nameWithOctave}, Duración: {n.quarterLength}')

# Imprimir las notas transpuestas
for n in transposed_notes:
    print(f'Nota transpuesta: {n.nameWithOctave}, Duración: {n.quarterLength}')

# Analizar la tonalidad
key = score.analyze('key')
print(f'Llave analizada: {key}')
