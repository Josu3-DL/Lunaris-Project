
export const home = () => {
    document.querySelector('#app').innerHTML = `
	<section class="contact-section">
		<div class="container-fluid">
			<div class="row">
				<div class="col-lg-12 p-0">
					<div class="contact-warp d-flex flex-column align-items-center">
						<div class="section-title mb-0">
							<h2 class="mb-3">Iniciar sesión</h2>
						</div>
						<form class="contact-from d-flex flex-column align-items-center">
							
							<div class="col-md-12">
								<label>
									Nombre de usuario
									<span class="text-danger">*</span> 
								</label>
								<input type="text" placeholder="Ingresa tu nombre de usuario">
							</div>
							<div class="col-md-12">
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
