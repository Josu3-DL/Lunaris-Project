export const submit_file = () => {
    document.querySelector('#app').innerHTML = `
    <section class="contact-section">
        <section class="contact-section h-100">
            <div class="container-fluid h-100">
                <div class="row h-100">
                    <div class="col-lg-12 p-0 h-100">
                        <div class="contact-warp d-flex flex-column align-items-center justify-content-center h-100">
                            <div class="section-title mb-0">
                                <h3 class="mb-3">Subir Archivo</h3>
                            </div>
                            <form class="contact-from d-flex flex-column align-items-center">
                                <div class="piano-container" onclick="document.getElementById('submit_file').click()">
                                    <input type="file" class="form-control-file" id="submit_file" style="display: none;">
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </section>
    `;
};
