import { router } from "../router/router"
import { lunarisaApi } from "./lunarisApi"
import Swal from 'sweetalert2'


const saveToken = (tokens) => {
    localStorage.setItem('access', tokens.access)
    localStorage.setItem('refresh',tokens. refresh)
}

export const startLogin = async(username, password) => {
    console.log(username);
    console.log(password);
    try {
       const {data} = await lunarisaApi.post('/api/login/', { username_or_email: username, password });
       saveToken(data);
       router.navigate("/");

    } catch (error) {
        console.log(error);
        const errorMessage = Object.values(error.response.data).flat()[0];
        Swal.fire({
            title: 'Error de inicio de sesión',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Ok'
          })
    }
}

export const startRegister = async(email, username, password) => {
    console.log(username);
    console.log(password);
    try {
       const {data} = await lunarisaApi.post('/api/user/', { email, username, password });
       console.log(data);

       Swal.fire({
        title: 'Registro ',
        text: "Usuario Creado. Porfavor iniciar sesion",
        icon: 'success',
        confirmButtonText: 'Ok'
      })

      setTimeout(() => {
          router.navigate("/login");
      }, 1000);

    } catch (error) {
        console.log(error);
    }
}

export const SendFile = async (formData) => {
    try {
        const response = await lunarisaApi.post('/api/partiture/', formData, {
            headers: { 
                'Content-Type': 'multipart/form-data'  // Opcional, axios lo configura automáticamente
            }
        });
        console.log(response.data);
        localStorage.setItem("PartitureData", JSON.stringify(response.data));
        console.log("Archivo enviado correctamente");
    } catch (error) {
        console.error("Error al enviar el archivo:", error);
    }
};

export const DownloadAudio = async (id) => {
    try {
        const response = await lunarisaApi.post(`api/partiture/${id}/convertir_audio/`, null, {
            responseType: "blob"
        })
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a")

        link.href = url;
        link.download = `partitura_${id}.wav`;
        link.click();
        window.URL.revokeObjectURL(url)

        Swal.fire({
            title: 'Descarga completa ',
            text: "Escuchar audio",
            icon: 'success',
            confirmButtonText: 'Ok'
          })
    
    } catch (error) {
        console.log("Error", error)
    }
}