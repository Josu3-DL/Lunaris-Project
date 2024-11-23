import * as Tone from "tone";
import Vex from "vexflow";

export function partitureGame(jsonData, DivID) {
  /* global VexFlow */
  console.log(DivID);
  const { Renderer, TickContext, Stave, StaveNote, Accidental, Dot } = Vex.Flow;

  const div = document.getElementById(DivID);
  const renderer = new Renderer(div, Renderer.Backends.SVG);
  renderer.resize(500, 300);
  const context = renderer.getContext();

  // Variables para controlar las notas
  let notaActualIndex = 0;
  let tempo = 60; //Velocidad de reproduccion

  const tickContext = new TickContext();
  const stave = new Stave(10, 10, 10000)
    .addClef(jsonData.clave)
    .addKeySignature(obtenerArmadura(jsonData.tonalidad));
  stave.setContext(context).draw();

  const synth = new Tone.Synth().toDestination(); //Inicializar Tone.js

  function obtenerFrecuenciaNota(notaCompleta) {
    const notaBase = notaCompleta.match(/[A-Ga-g]+/)[0];
    const accidental = notaCompleta.includes("#")
      ? "#"
      : notaCompleta.includes("b")
      ? "b"
      : "";
    const octava = parseInt(notaCompleta.match(/\d+/)[0], 10) || 4; // Asume la octava 4 si no se encuentra
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

    // Ajuste de la frecuencia según la octava
    const octavaDiferencia = octava - 4; // Octava 4 es la base en este caso
    frecuencia = frecuencia * Math.pow(2, octavaDiferencia);

    return frecuencia;
  }

  Tone.Destination.volume.value = 6;

  function reproducirNota(nota, accidental, octava, duracionSegundos) {
    // Concatenar la nota con su accidental y octava para la frecuencia
    const notaCompleta = `${nota}${accidental}${octava ? octava : ""}`;

    // Obtener la frecuencia usando la nota completa
    const frecuencia = obtenerFrecuenciaNota(notaCompleta);

    // Reproducir la nota con la duración especificada
    synth.triggerAttackRelease(frecuencia, duracionSegundos);
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
      default:
        valor = 0;
    }

    if (dotted === "dotted") {
      valor *= 1.5;
    }

    return { valor, esSilencio };
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

  // Función para agregar puntillo a la nota
  function dotted(staveNote) {
    Dot.buildAndAttach([staveNote], { all: true });
    return staveNote;
  }

  // Mapeamos las notas desde jsonData
  const notes = jsonData.notas.map((nota) => {
    const { valor, esSilencio } = obtenerValorDuracion(
      nota.duration,
      nota.dotted
    );
    let staveNote;

    if (esSilencio) {
      staveNote = new StaveNote({
        keys: [obtenerPosicionSilencio(jsonData.clave)],
        duration: nota.duration,
        clef: jsonData.clave,
      });
    } else {
      staveNote = new StaveNote({
        keys: [nota.pitch],
        duration: nota.duration,
        clef: jsonData.clave,
      });

      // Si tiene accidental, lo agregamos
      if (nota.accidental !== "none") {
        staveNote.addModifier(new Accidental(nota.accidental));
      }

      // Si es punteada, aplicamos la función dotted
      if (nota.dotted === "dotted") {
        staveNote = dotted(staveNote);
      }
    }

    staveNote.setContext(context).setStave(stave);
    tickContext.addTickable(staveNote);

    return staveNote;
  });

  tickContext.preFormat().setX(400);
  const visibleNoteGroups = [];

  // Funcionamiento para que las notas vengan automaticamente
  let partituraIniciada = false;

  document.getElementById("add-note").addEventListener("click", (e) => {
    if (!partituraIniciada) {
      partituraIniciada = true;
      startNotes();
    }
  });

  function startNotes() {
    const note = notes.shift(); // Obtener la siguiente nota
    if (!note) {
      console.log("DONE!");
      return; // Termina si no hay más notas
    }

    // Extraer la duración de la nota
    const { valor, esSilencio } = obtenerValorDuracion(
      note.duration,
      note.dotted
    );
    const duracionSegundos = valor * (60 / tempo); // Convertir a segundos basados en el tempo

    // Dibujar la nota
    const group = context.openGroup();
    visibleNoteGroups.push(group);
    note.draw();
    context.closeGroup();
    group.classList.add("scroll");

    const box = group.getBoundingClientRect();
    group.classList.add("scrolling");

    window.setTimeout(() => {
      const index = visibleNoteGroups.indexOf(group);
      if (index === -1) return;
      group.classList.add("too-slow");
      visibleNoteGroups.shift();
    }, 5000);

    // Llama a la siguiente nota después del tiempo correspondiente
    setTimeout(startNotes, duracionSegundos * 1000);
  }

  function avanzarNota() {
    if (notaActualIndex >= jsonData.notas.length) {
      console.log("Se han completado todas las notas.");
      return;
    }

    const currentNote = jsonData.notas[notaActualIndex];

    // Verificar si es un silencio
    if (currentNote.duration.includes("r")) {
      console.log("Silencio detectado. Esperando...");

      // Calcular duración del silencio
      const { valor } = obtenerValorDuracion(
        currentNote.duration,
        currentNote.dotted
      );
      const duracionSegundos = valor * (60 / tempo);

      // No avanzamos hasta que pase el tiempo del silencio
      setTimeout(() => {
        const group = visibleNoteGroups.shift();
        group.classList.add("correct");

        const transformMatrix = window.getComputedStyle(group).transform;
        const x = transformMatrix.split(",")[4].trim();
        group.style.transform = `translate(${x}px, -800px)`;

        notaActualIndex++;
        avanzarNota(); // Continuar con la siguiente nota
      }, duracionSegundos * 1000);

      return;
    }
  }

  const keyboardToNoteMap = {
    a: "C", // C natural
    w: "C#", // C sostenido
    s: "D",
    e: "D#",
    d: "E",
    f: "F",
    t: "F#",
    g: "G",
    y: "G#",
    h: "A",
    u: "A#",
    j: "B",
  };

  // Añade listeners para teclas físicas
  document.addEventListener("keydown", (e) => {
    const keyPressed = e.key.toLowerCase(); // Convertir a minúscula para consistencia
    const note = keyboardToNoteMap[keyPressed];

    if (!note) return; // Ignorar si la tecla no está asignada

    // Encuentra la tecla correspondiente en el DOM y actívala visualmente
    const keyElement = document.getElementById(note);
    if (keyElement) {
      keyElement.classList.add("active");
      setTimeout(() => keyElement.classList.remove("active"), 150); // Remover la clase después de un tiempo
    }

    // Simula un clic para ejecutar la lógica ya existente
    if (notaActualIndex >= jsonData.notas.length) return;

    const currentNote = jsonData.notas[notaActualIndex];
    const baseNote = currentNote.pitch.match(/^[A-Ga-g]+/)[0];
    const octava = currentNote.pitch.match(/\d/);
    const accidental =
      currentNote.accidental === "none" ? "" : currentNote.accidental;
    const expectedNote = `${baseNote}${accidental}`;

    if (note === expectedNote) {
      const group = visibleNoteGroups.shift();
      group.classList.add("correct");

      const transformMatrix = window.getComputedStyle(group).transform;
      const x = transformMatrix.split(",")[4].trim();
      group.style.transform = `translate(${x}px, -800px)`;

      const nota = jsonData.notas[notaActualIndex];
      const { valor } = obtenerValorDuracion(nota.duration, nota.dotted);
      const duracionSegundos = valor * (60 / tempo);

      reproducirNota(
        baseNote,
        accidental,
        octava ? octava[0] : null,
        duracionSegundos
      );

      notaActualIndex++;
      avanzarNota();
    } else {
      const group = visibleNoteGroups.shift();
      group.classList.add("too-slow");
      console.log(
        `Fallo. Se esperaba: ${expectedNote} pero se presionó: ${note}`
      );
      notaActualIndex++;
      avanzarNota();
    }
  });

  // Listeners para clics en las teclas del piano
  document.querySelectorAll(".white-key, .black-key").forEach((key) => {
    key.addEventListener("click", (e) => {
      key.addEventListener("mousedown", () => key.classList.add("active"));
      key.addEventListener("mouseup", () => key.classList.remove("active"));
      key.addEventListener("mouseleave", () => key.classList.remove("active"));

      // Para dispositivos táctiles
      key.addEventListener("touchstart", (e) => {
        e.preventDefault();
        key.classList.add("active");
      });
      key.addEventListener("touchend", () => key.classList.remove("active"));

      if (notaActualIndex >= jsonData.notas.length) return;

      const userInput = e.target.id;
      const currentNote = jsonData.notas[notaActualIndex];
      const baseNote = currentNote.pitch.match(/^[A-Ga-g]+/)[0];
      const octava = currentNote.pitch.match(/\d/);
      const accidental =
        currentNote.accidental === "none" ? "" : currentNote.accidental;
      const expectedNote = `${baseNote}${accidental}`;

      if (userInput === expectedNote) {
        const group = visibleNoteGroups.shift();
        group.classList.add("correct");

        const transformMatrix = window.getComputedStyle(group).transform;
        const x = transformMatrix.split(",")[4].trim();
        group.style.transform = `translate(${x}px, -800px)`;

        const nota = jsonData.notas[notaActualIndex];
        const { valor } = obtenerValorDuracion(nota.duration, nota.dotted);
        const duracionSegundos = valor * (60 / tempo);

        reproducirNota(
          baseNote,
          accidental,
          octava ? octava[0] : null,
          duracionSegundos
        );

        notaActualIndex++;
        avanzarNota();
      } else {
        const group = visibleNoteGroups.shift();
        group.classList.add("too-slow");
        console.log(
          `Fallo. Se esperaba: ${expectedNote} pero se presionó: ${userInput}`
        );
        notaActualIndex++;
        avanzarNota();
      }
    });
  });
}
