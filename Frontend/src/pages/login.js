import { startLogin } from "../api/auth";
import { router } from "../router/router";

export const login = () => {
    const loginElements = `
	<section class="contact-section">
	<section class="contact-section h-100">
        <div class="container-fluid h-100">
            <div class="row h-100">
                <div class="col-lg-12 p-0 h-100">
                    <div class="contact-warp d-flex flex-column align-items-center justify-content-center h-100">
                        <div class="section-title mb-0">
                            <h2 class="mb-3">Iniciar sesión</h2>
                        </div>
                        <form class="contact-from d-flex flex-column align-items-center " id='loginForm'>
                            
                            <div class="w-100 mb-3">
                                <label>
                                    Nombre de usuario
                                    <span class="text-danger">*</span> 
                                </label>
                                <input type="text" placeholder="Ingresa tu nombre de usuario" id='username'>
                            </div>
                            <div class="w-100">
                                <label>
                                    Contraseña
                                    <span class="text-danger">*</span> 
                                </label>
                                <input type="password" placeholder="Ingresa tu contraseña" id='password'>
                            </div>
                            <button type='button' class="site-btn">Iniciar sesión</button>                                
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
`
    const app = document.querySelector('#app') 
    app.innerHTML = loginElements

    const form = app.querySelector('#loginForm')
    const loginButton = app.querySelector('.site-btn')
        loginButton.addEventListener('click', () => {
        const username = form.querySelector('#username').value;
        const password = form.querySelector('#password').value;
        startLogin(username, password)
    })
}

