// EmailJS Integration Handler
emailjs.init("iKJonrc9eOTBISLpT");

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const statusDiv = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const serviceId = this.getAttribute('data-service-id');
            const templateId = this.getAttribute('data-template-id');

            if (!serviceId || !templateId) {
                console.error('EmailJS service ID or template ID missing on the form attributes (data-service-id, data-template-id)');
                return;
            }

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Enviando...</span> <i class="fas fa-circle-notch fa-spin"></i>';
            }
            
            if (statusDiv) {
                statusDiv.innerText = "Enviando mensaje...";
                statusDiv.className = "form-status info";
            }

            emailjs.sendForm(serviceId, templateId, this)
                .then(function () {
                    if (statusDiv) {
                        statusDiv.innerText = "✅ ¡Mensaje enviado con éxito! Nos contactaremos pronto.";
                        statusDiv.className = "form-status success";
                    }
                    contactForm.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>Enviar Consulta</span> <i class="fas fa-paper-plane"></i>';
                    }
                }, function (error) {
                    if (statusDiv) {
                        statusDiv.innerText = "❌ Falló el envío: " + (error.text || JSON.stringify(error));
                        statusDiv.className = "form-status error";
                    }
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<span>Enviar Consulta</span> <i class="fas fa-paper-plane"></i>';
                    }
                });
        });
    }
});
