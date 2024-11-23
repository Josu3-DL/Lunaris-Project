from music21 import converter,tempo
from midi2audio import FluidSynth

# Parsear archivo MusicXML
input_file = 'HimnoNacional.musicxml'
score = converter.parse(input_file)


# Establecer un tempo por defecto (por ejemplo, 120 BPM)
default_tempo = tempo.MetronomeMark(number=90)
score.insert(0, default_tempo)  # Insertar el tempo al inicio de la partitura

# Guardar el archivo PDF
pdf_file = 'output.pdf'
try:
    score.write('pdf', fp=pdf_file)
    print(f"PDF generado: {pdf_file}")
except Exception as e:
    print(f"Error al generar el PDF: {e}")

# Guardar archivo MIDI
midi_file = 'output.mid'
score.write('midi', fp=midi_file)


# Convertir MIDI a WAV usando FluidSynth
soundfont = '../pruebas/MS_Basi c.sf3'  # Ruta al archivo SoundFont
audio_file_wav = 'output.wav'
fs = FluidSynth(soundfont)
fs.midi_to_audio(midi_file, audio_file_wav)

print(f"Audio generado: {audio_file_wav}")