import { startRegister } from "../api/auth";
import Swal from 'sweetalert2'


export const register = () => {
    const registerElements = `
	<section class="contact-section h-100">
        <div class="container-fluid h-100">
            <div class="row h-100">
                <div class="col-lg-12 p-0 h-100">
                    <div class="contact-warp d-flex flex-column align-items-center justify-content-center h-100">
                        <div class="section-title mb-0">
                            <h2 class="mb-3">Crear tu cuenta</h2>
                        </div>
                        <form class="contact-from d-flex flex-column align-items-center " id='registerForm'>
                            
                            <div class="w-100 mb-3">
                                <label>
                                    Nombre de usuario
                                    <span class="text-danger">*</span> 
                                </label>
                                <input type="text" placeholder="Ingresa tu nombre de usuario" name = "username" id='username'>
                            </div>

                            <div class="w-100 mb-3">
                                <label>
                                    Correo Electronico
                                    <span class="text-danger">*</span> 
                                </label>
                                <input type="email" placeholder="Ingresa tu Correo" name = "email" id='email'>
                            </div>

                            <div class="w-100">
                                <label>
                                    Contraseña
                                    <span class="text-danger">*</span> 
                                </label>
                                <input type="password" placeholder="Ingresa tu contraseña" name = "password" id='password'>
                            </div>
                            <button type='button' class="site-btn">Crear cuenta</button>                                
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
`
const app = document.querySelector('#app')
app.innerHTML = registerElements;

const form = app.querySelector('#registerForm')
const loginButton = app.querySelector('.site-btn')
    loginButton.addEventListener('click', () => {

    const username = form.querySelector('#username').value;
    const password = form.querySelector('#password').value;
    const email = form.querySelector('#email').value;
    startRegister(email, username, password);
    
})


}
