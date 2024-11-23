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

export const SendFile = async(titulo, autor, descripcion, archivo) => {
    try {
        const { data } = await lunarisaApi.post('/api/partiture/', { titulo: "Mi Partitura", autor: "Anonimo", descripcion: "Sin descripcion", archivo })
        console.log(data)
    } catch (error) {
        console.log(error)
    }
}