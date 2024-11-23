import { SendFile } from "../api/auth";
import { router } from "../router/router";

export const submit_file = () => {
    const filehtml = `
      <section class="contact-section">
          <section class="contact-section h-100">
              <div class="container-fluid h-100">
                  <div class="row h-100">
                      <div class="col-lg-12 p-0 h-100">
                          <div class="contact-warp d-flex flex-column align-items-center justify-content-center h-100">
                              <div class="section-title mb-0">
                                  <h3 class="mb-3">Subir Archivo</h3>
                              </div>
                              <form id="fileForm" enctype="multipart/form-data" class="contact-from d-flex flex-column align-items-center">
                                  <div class="piano-container">
                                      <input type="file" class="form-control-file" id="submit_file" style="display: none;">
                                  </div>
                                  <!-- Nuevos campos para otros datos -->
                                  <button type="submit">Subir Archivo</button>
                              </form>
                          </div>
                      </div>
                  </div>
              </div>
          </section>
      </section>
    `;
  
    document.querySelector("#app").innerHTML = filehtml;
    
    const fileForm = document.querySelector("#fileForm");
    const fileInput = document.querySelector("#submit_file");
  
    // Abre el explorador de archivos cuando se hace clic en el contenedor piano-container
    document.querySelector(".piano-container").addEventListener("click", () => {
      fileInput.click();
    });
  
    fileForm.addEventListener("submit", (event) => {
      event.preventDefault();
  
      // Verifica si un archivo ha sido seleccionado
      if (!fileInput.files[0]) {
        alert("Por favor, selecciona un archivo.");
        return;
      }
  
      // Captura los otros datos del formulario
      const titulo = "Mi partitura"
      const autor = "Anonimo"
      const descripcion = "Desconocido"
  
      // Crea el FormData y añade los datos
      const formData = new FormData();
      formData.append('archivo', fileInput.files[0]);   // Añadir el archivo
      formData.append('titulo', titulo);             // Añadir el título
      formData.append('autor', autor);               // Añadir el autor
      formData.append('descripcion', descripcion);   // Añadir la descripción
  
      // Verifica el contenido de formData
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      SendFile(formData);  // Envía el FormData
      router.navigate("/render")
    });
  };
  