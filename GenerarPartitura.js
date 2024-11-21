const synth = new Tone.Synth().toDestination();
Tone.Destination.volume.value = 6;
Tone.Transport.bpm.value = 60; // Ajusta el tempo global (por ejemplo, 60 BPM)

// Obtener el tempo de Tone.js (bpm)
const tempo = Tone.Transport.bpm.value;

function calcularDuracionEnSegundos(notas) {
  return notas.reduce((total, nota) => {
    const { valor } = obtenerValorDuracion(nota.duracion, nota.dotted);
    const duracionSegundos = valor * (60 / tempo);
    return total + duracionSegundos;
  }, 0);
}

function obtenerValorDuracion(duracion, dotted) {
  let valor = 0;
  let esSilencio = false;

  if (duracion.endsWith("r")) {
    esSilencio = true;
    duracion = duracion.slice(0, -1);
  }

  switch (duracion) {
    case "w":
      valor = 4;
      break;
    case "h":
      valor = 2;
      break;
    case "q":
      valor = 1;
      break;
    case "8":
      valor = 0.5;
      break;
    case "16":
      valor = 0.25;
      break;
    case "32":
      valor = 0.125;
      break;
    case "64":
      valor = 0.0625;
      break;
    default:
      valor = 0;
  }

  if (dotted === "dotted") {
    valor *= 1.5;
  }

  return { valor, esSilencio };
}

function generarPartitura(jsonData, NotasTranspuestas) {
  return new Promise((resolve) => {
    const lineas = {};
    /* global VexFlow */
    VexFlow.loadFonts("Bravura", "Academico").then(() => {
      VexFlow.setFonts("Bravura", "Academico");

      // Elegir las notas a usar según la configuración
      const notasUsadas = NotasTranspuestas
        ? jsonData.notas_transpuestas
        : jsonData.notas_normales;

      const outputDiv = document.getElementById("output");
      const containerWidth = outputDiv.offsetWidth;
      const numCompases = dividirEnCompases(
        notasUsadas, // Adaptación aquí
        parseInt(jsonData.time_signature.split("/")[0]) // Adaptación aquí
      ).length;
      const containerHeight =
        calcularSaltosDeLinea(numCompases, containerWidth) * 150;

      const { Factory, Accidental, Dot } = VexFlow;

      //Variables para controlar el lugar de construccion de compases
      let lugarX = 0,
        lugarY = 0,
        lineaActual = 1;
      let totalLineas = 1; // Inicializamos con una línea

      function calcularSaltosDeLinea(numCompases, containerWidth) {
        const anchoTotal =
          numCompases * calcularAnchoPorCompas(numCompases, containerWidth);
        const anchoPantalla = window.innerWidth * 0.8;
        let numLineas = 1; // Empezamos con una línea

        // Si el ancho total excede el 80% de la ventana, necesitamos saltos de línea
        if (anchoTotal > anchoPantalla) {
          // Calculamos cuántos compases caben por línea
          const compasesPorLinea = Math.floor(
            anchoPantalla / calcularAnchoPorCompas(numCompases, containerWidth)
          );

          // Calculamos el número de líneas necesarias
          numLineas = Math.ceil(numCompases / compasesPorLinea);
        }

        return numLineas;
      }

      function calcularAnchoPorCompas(totalCompases, anchoTotal) {
        const margen = 0; // Espaciado mínimo entre compases

        const anchoMinimo = Math.max(anchoTotal * 0.15, 50);

        const anchoCompas = Math.max(
          (anchoTotal - margen * totalCompases) / totalCompases,
          anchoMinimo
        ); // Mínimo 100px por compás
        return anchoCompas;
      }

      function obtenerArmadura(tonalidad) {
        const armaduras = {
          C: "C",
          G: "G",
          D: "D",
          A: "A",
          E: "E",
          B: "B",
          "F#": "F#",
          "C#": "C#",
          F: "F",
          Bb: "Bb",
          Eb: "Eb",
          Ab: "Ab",
          Db: "Db",
          Gb: "Gb",
          Cb: "Cb",
        };

        const relativasMayores = {
          "E minor": "G",
          "B minor": "D",
          "F# minor": "A",
          "C# minor": "E",
          "G minor": "Bb",
          "D minor": "F",
          "A minor": "C",
          "C minor": "Eb",
          "G# minor": "B",
        };

        if (tonalidad.endsWith("minor") && relativasMayores[tonalidad]) {
          tonalidad = relativasMayores[tonalidad];
        }

        if (tonalidad.endsWith("major")) {
          return tonalidad.replace(" major", "");
        }

        return armaduras[tonalidad] || "C";
      }

      function accidentalPermitido(tonalidad, nota, accidental) {
        const sostenidos = {
          G: ["F"],
          D: ["F", "C"],
          A: ["F", "C", "G"],
          E: ["F", "C", "G", "D"],
          B: ["F", "C", "G", "D", "A"],
          "F#": ["F", "C", "G", "D", "A", "E"],
          "C#": ["F", "C", "G", "D", "A", "E", "B"],
        };
        const bemoles = {
          F: ["B"],
          Bb: ["B", "E"],
          Eb: ["B", "E", "A"],
          Ab: ["B", "E", "A", "D"],
          Db: ["B", "E", "A", "D", "G"],
          Gb: ["B", "E", "A", "D", "G", "C"],
          Cb: ["B", "E", "A", "D", "G", "C", "F"],
        };

        const notasSostenidas = sostenidos[tonalidad] || [];
        const notasBemoles = bemoles[tonalidad] || [];

        if (accidental === "#") {
          // No permitir sostenido si ya está afectada por sostenido
          return !notasSostenidas.includes(nota);
        }

        if (accidental === "b") {
          // No permitir bemol si ya está afectada por bemol
          return !notasBemoles.includes(nota);
        }

        // Si no hay accidental, permitir siempre
        return true;
      }

      function dividirEnCompases(notas, tiemposPorCompas) {
        let compases = [];
        let compasActual = [];
        let tiemposActuales = 0;

        notas.forEach((nota) => {
          const { valor: valorNota, esSilencio } = obtenerValorDuracion(
            nota.duracion, // Adaptación aquí
            nota.dotted // Adaptación aquí
          );

          if (tiemposActuales + valorNota <= tiemposPorCompas) {
            compasActual.push(nota);
            tiemposActuales += valorNota;
          } else {
            compases.push(compasActual);
            compasActual = [nota];
            tiemposActuales = valorNota;
          }
        });

        if (compasActual.length > 0) compases.push(compasActual);
        return compases;
      }

      function dotted(staveNote) {
        Dot.buildAndAttach([staveNote], { all: true });
        return staveNote;
      }

      function obtenerPosicionSilencio(clave) {
        switch (clave) {
          case "bass":
            return "D/3";
          case "treble":
            return "B/4";
          case "alto":
            return "C/4";
          default:
            return "B/4";
        }
      }

      const vf = new Factory({
        renderer: {
          elementId: "output",
          width: containerWidth - 20,
          height: containerHeight,
        },
      });

      const tiemposPorCompas = parseInt(jsonData.time_signature.split("/")[0]);
      const notasPorCompas = dividirEnCompases(
        notasUsadas,
        tiemposPorCompas
      );
      const totalCompases = notasPorCompas.length;

      const ancho = calcularAnchoPorCompas(totalCompases, containerWidth);

      const armadura = obtenerArmadura(jsonData.key_signature);

      notasPorCompas.forEach((compasNotas, index) => {
        let system;

        if (lugarX >= window.innerWidth * 0.8) {
          lugarY += 150;
          lugarX = 0;
          lineaActual++;
        }

        // Registrar la línea actual en el diccionario
        if (!lineas[lineaActual]) {
          lineas[lineaActual] = {
            notas: [],
            tiempoTotal: 0,
          };
        }

        if (index === 0) {
          const anchoDinamico = window.innerWidth * 0.07;
          system = vf.System({
            x: lugarX,
            y: lugarY,
            width: ancho + anchoDinamico,
          });
          lugarX += anchoDinamico;
        } else {
          system = vf.System({
            x: lugarX,
            y: lugarY,
            width: ancho,
          });
        }
        lugarX += ancho;

        const notes = compasNotas.map((nota) => {
          const { esSilencio } = obtenerValorDuracion(
            nota.duracion,
            nota.dotted
          );
          let staveNote;

          if (esSilencio) {
            staveNote = vf.StaveNote({
              keys: [obtenerPosicionSilencio(jsonData.clef)],
              duration: nota.duracion,
              clef: jsonData.clef,
            });
          } else {
            const [pitch, octave] = nota.nota.split("/");
            const accidentalValido = accidentalPermitido(
              armadura,
              pitch,
              nota.accidental
            );

            staveNote = vf.StaveNote({
              keys: [nota.nota],
              duration: nota.duracion,
              clef: jsonData.clef,
            });

            if (
              accidentalValido &&
              nota.accidental &&
              nota.accidental !== "none"
            ) {
              staveNote.addModifier(new Accidental(nota.accidental));
            }

            if (nota.dotted === "dotted") {
              staveNote = dotted(staveNote);
            }

            if (index === 0) {
              staveNote.setXShift(10); // Desplazar ligeramente las notas del primer compás
            }
          }

          // Agregar nota al registro de la línea actual
          lineas[lineaActual].notas.push(nota);

          return staveNote;
        });

        const voice = vf.Voice().addTickables(notes);
        voice.setStrict(false);

        if (index === 0) {
          const stave = system.addStave({ voices: [voice] });
          stave.addClef(jsonData.clef);
          stave.addKeySignature(armadura);
          stave.addTimeSignature(jsonData.time_signature);
        } else {
          system.addStave({ voices: [voice] });
        }
      });

      Object.keys(lineas).forEach((linea) => {
        const tiempoTotal = calcularDuracionEnSegundos(lineas[linea].notas);
        lineas[linea].tiempoTotal = tiempoTotal;
      });

      vf.draw();

      resolve(lineas);
    });
  });
}

export { generarPartitura };
