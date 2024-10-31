export const login = () => {
    document.querySelector('#app').innerHTML = `
	<section class="contact-section">
	<section class="contact-section h-100">
        <div class="container-fluid h-100">
            <div class="row h-100">
                <div class="col-lg-12 p-0 h-100">
                    <div class="contact-warp d-flex flex-column align-items-center justify-content-center h-100">
                        <div class="section-title mb-0">
                            <h2 class="mb-3">Iniciar sesión</h2>
                        </div>
                        <form class="contact-from d-flex flex-column align-items-center ">
                            
                            <div class="w-100 mb-3">
                                <label>
                                    Nombre de usuario
                                    <span class="text-danger">*</span> 
                                </label>
                                <input type="text" placeholder="Ingresa tu nombre de usuario">
                            </div>
                            <div class="w-100">
                                <label>
                                    Contraseña
                                    <span class="text-danger">*</span> 
                                </label>
                                <input type="password" placeholder="Ingresa tu contraseña">
                            </div>
                            <button class="site-btn">Iniciar sesión</button>                                
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>
`
}