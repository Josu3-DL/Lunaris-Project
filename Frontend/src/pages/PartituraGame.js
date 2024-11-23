import { partitureGame } from "./PracticarPartitura";

export const Practicar = () => {
  const filehtml = `
     <div class="score-container">
        <div id="output"></div>
    </div>

    <div id="controls">
        <button id='add-note'>Iniciar Partitura</button>

        <div class="piano">
            <div class="key-container">
                <div class="white-key" id="C"></div>
                <div class="black-key" id="C#"></div>
            </div>
            <div class="key-container">
                <div class="white-key" id="D"></div>
                <div class="black-key" id="D#"></div>
            </div>
            <div class="key-container">
                <div class="white-key" id="E"></div>
            </div>
            <div class="key-container">
                <div class="white-key" id="F"></div>
                <div class="black-key" id="F#"></div>
            </div>
            <div class="key-container">
                <div class="white-key" id="G"></div>
                <div class="black-key" id="G#"></div>
            </div>
            <div class="key-container">
                <div class="white-key" id="A"></div>
                <div class="black-key" id="A#"></div>
            </div>
            <div class="key-container">
                <div class="white-key" id="B"></div>
            </div>
        </div>
    </div>
    </div>
    `;
};

document.querySelector("#app").innerHTML = filehtml;

const btnReproducir = document.getElementById("add-note");

document.addEventListener("DOMContentLoaded", () => {
    partitureGame(JSON.parse(localStorage.getItem("PartitureData")), "output");

})


