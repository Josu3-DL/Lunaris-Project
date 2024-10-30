from music21 import converter, note

# Cargar el archivo MusicXML
score = converter.parse('playthatsheet-Paspie.musicxml')

interval = 'M2'  # Intervalo de transposición, por ejemplo, una segunda mayor
transposed_score = score.transpose(interval)

# Extraer las notas de todas las páginas
notes = []
for element in score.recurse():
    if isinstance(element, note.Note):
        notes.append(element)

transposed_notes = []
for element in transposed_score.recurse():
    if isinstance(element, note.Note):
        transposed_notes.append(element)

# Imprimir las notas
for n in notes:
    print(f'Nota: {n.nameWithOctave}, Duración: {n.quarterLength}')


for n in transposed_notes:
    print(f'Nota transpuesta: {n.nameWithOctave}, Duración: {n.quarterLength}')

key = score.analyze('key')
print(key)