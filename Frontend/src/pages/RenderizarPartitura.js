import { DownloadAudio, SendFile } from "../api/auth";
import { generarPartitura } from "./GenerarPartitura";
import { iniciarReproduccion } from "./ReproducirParitura";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const Render_partitura = () => {
  const filehtml = `
      <div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="partitura-container">
                <h2 class="text-center partitura-title">Partitura enviada</h2>
                <div id="output">
                    
                </div>
                <div class="text-center">
                  <button id="btnReproducir" class="btn btn-reproducir">
                      Reproducir Partitura
                  </button>
                  <button id="btnDescargarpdf" class="btn btn-reproducir">
                  Descargar PDF
                  </button>
                  <button id="btnDescargaraudio" class="btn btn-reproducir">
                  Descargar audio
                  </button>
              </div>
            </div>
        </div>
    </div>
</div>
    `;

  document.querySelector("#app").innerHTML = filehtml;

  const btnReproducir = document.getElementById("btnReproducir");

  const outputId = "output";

  const btnDescargar = document.querySelector("#btnDescargarpdf")
  const btnDescargaraudio = document.querySelector("#btnDescargaraudio")

  function descargarPartitura(divId) {
    const partituraDiv = document.getElementById(divId);

    html2canvas(partituraDiv, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });
        
        const imgWidth = 210; // Ancho de A4 en mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save('partitura.pdf');
    });
}

  async function inicializarLineas() {
    try {
      const lineas = await generarPartitura(JSON.parse(localStorage.getItem("PartitureData")), false); // Supongo que esta es tu función principal
      return lineas; // Devuelve las líneas inicializadas
    } catch (error) {
      console.error("Error al inicializar las líneas:", error);
      return null; // Devuelve null en caso de error
    }
  }

  async function main() {
    const lineas = await inicializarLineas();

    if (lineas) {
      console.log("Líneas inicializadas correctamente:", lineas);

      // Puedes usar las líneas después de inicializarlas
      btnReproducir.addEventListener("click", () => {
        const reproducir = iniciarReproduccion(outputId, lineas); // Llama a la función
        if (typeof reproducir === "function") {
          reproducir(); // Ejecuta la reproducción
        } else {
          console.error(
            "La función de reproducción no se generó correctamente."
          );
        }
      });

      btnDescargar.addEventListener("click", () => {
        descargarPartitura(outputId);
      })

      btnDescargaraudio.addEventListener("click", () => {
        const partirtura = JSON.parse(localStorage.getItem("PartitureData"))
        DownloadAudio(partirtura['id']);
      })
    } else {
      console.error("No se pudieron inicializar las líneas.");
    }
  }


  main();
};
