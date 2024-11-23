const synth = new Tone.Synth().toDestination();
Tone.Destination.volume.value = 6;
Tone.Transport.bpm.value = 90;

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

export function iniciarReproduccion(outputId, lineas) {
  const validation = document.getElementById(outputId);
  if (!validation) {
    console.error(`No se encontró ningún elemento con id="${outputId}"`);
    return;
  }

  const alturaLinea = 150; // Altura entre líneas
  const tiempoRetrasoNotas = 2; // Tiempo de retraso antes de iniciar reproducción
  let lineaActual = 1; // Línea actual en el diccionario

  const output = document.getElementById(outputId);
  output.style.position = "relative";

  const lineaAnimada = document.createElement("div");
  lineaAnimada.style.position = "absolute";
  lineaAnimada.style.width = "2px";
  lineaAnimada.style.height = `${alturaLinea}px`;
  lineaAnimada.style.backgroundColor = "blue";
  lineaAnimada.style.visibility = "hidden";
  lineaAnimada.style.left = "0px";
  lineaAnimada.style.top = "0px";
  output.appendChild(lineaAnimada);

  function obtenerFrecuenciaNota(notaCompleta) {
    const notaBase = notaCompleta.match(/[A-Ga-g]+/)[0];
    const accidental = notaCompleta.includes("#")
      ? "#"
      : notaCompleta.includes("b")
      ? "b"
      : "";
    const octava = parseInt(notaCompleta.match(/\d+/)[0], 10) || 4;
    const notas = {
      C: 261.63,
      "C#": 277.18,
      D: 293.66,
      "D#": 311.13,
      E: 329.63,
      F: 349.23,
      "F#": 369.99,
      G: 392.0,
      "G#": 415.3,
      A: 440.0,
      "A#": 466.16,
      B: 493.88,
    };

    let frecuencia = notas[`${notaBase}${accidental}`] || notas[notaBase];
    const octavaDiferencia = octava - 4;
    return frecuencia * Math.pow(2, octavaDiferencia);
  }

  function reproducirNota(nota, accidental, octava, duracionSegundos) {
    const notaCompleta = `${nota}${accidental}${octava ? octava : ""}`;
    const frecuencia = obtenerFrecuenciaNota(notaCompleta);
    synth.triggerAttackRelease(frecuencia, duracionSegundos);
  }

  function calcularTiempoPara20px(tempo, outputWidth) {
    const distanciaTotal = outputWidth - 40; // Distancia total de la línea
    const tiempoPorBeat = 60 / tempo; // Tiempo en segundos por beat
    const velocidadLinea = distanciaTotal / tiempoPorBeat; // Píxeles por segundo
    return 20 / velocidadLinea; // Tiempo para recorrer 20 píxeles
  }

  function reproducirNotasConTransport(linea) {
    let tiempoAcumulado = 0;
    linea.notas.forEach((nota) => {
      const { valor, esSilencio } = obtenerValorDuracion(
        nota["duracion"],
        nota["dotted"]
      );
      const tempo = Tone.Transport.bpm.value;
      const duracionSegundos = valor * (60 / tempo);

      if (esSilencio) {
        // Añadir un retraso para simular el silencio
        setTimeout(() => {
          console.log(`Silencio por ${duracionSegundos} segundos`);
        }, tiempoAcumulado * 1000);
      } else {
        const baseNote = nota.nota.match(/^[A-Ga-g]+/)[0];
        const octava = nota.nota.match(/\d/);
        const accidental = nota.accidental === "none" ? "" : nota["accidental"];

        setTimeout(() => {
          reproducirNota(
            baseNote,
            accidental,
            octava ? octava[0] : null,
            duracionSegundos
          );
        }, tiempoAcumulado * 1000);
      }

      tiempoAcumulado += duracionSegundos;
    });
  }

  function detenerSonidos() {
    synth.triggerRelease();
    Tone.Transport.stop();
    console.log("Sonidos detenidos.");
  }

  function animarLinea() {
    const distanciaFinal = output.offsetWidth - 40;
    const tiempoLinea = lineas[lineaActual].tiempoTotal;
    const tiempo20px = calcularTiempoPara20px(
      Tone.Transport.bpm.value,
      output.offsetWidth
    );

    const desplazamientoInicial = lineaActual === 1 ? 110 : 0;
    let tiempoLineaModificado = tiempoLinea - tiempo20px; // Restamos el tiempo de 20px

    const intervalo = setInterval(() => {
      const progreso = Tone.Transport.seconds / tiempoLineaModificado;
      const posicionX =
        desplazamientoInicial +
        progreso * (distanciaFinal - desplazamientoInicial);
      lineaAnimada.style.left = `${posicionX}px`;

      if (progreso >= 1) {
        clearInterval(intervalo);
        lineaActual++;

        if (lineaActual <= Object.keys(lineas).length) {
          lineaAnimada.style.left = "0px";
          lineaAnimada.style.top = `${(lineaActual - 1) * alturaLinea}px`;
          Tone.Transport.seconds = 0;
          reproducirNotasConTransport(lineas[lineaActual]);
          animarLinea();
        } else {
          detenerSonidos();
          lineaAnimada.style.visibility = "hidden";
        }
      }
    }, 16);
  }

  // Función principal para iniciar la reproducción
  function reproducir() {
    Tone.start();
    lineaActual = 1;
    lineaAnimada.style.visibility = "visible";
    lineaAnimada.style.left = "0px";
    lineaAnimada.style.top = "0px";

    animarLinea();

    setTimeout(() => {
      reproducirNotasConTransport(lineas[lineaActual]);
      Tone.Transport.start();
    }, tiempoRetrasoNotas * 1000);
  }

  // Retorna la función de reproducción para que se pueda llamar desde cualquier lugar
  return reproducir;
}
