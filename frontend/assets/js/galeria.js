// Configuración de Firebase (completar con tus datos)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Configuración de Cloudinary
const cloudinaryCloudName = "YOUR_CLOUD_NAME";
const cloudinaryUploadPreset = "YOUR_UPLOAD_PRESET";

let uploadedImageUrl = "";

// Elementos del DOM
const galleryGrid = document.getElementById('gallery-grid');
const openUploadBtn = document.getElementById('open-upload');
const closeUploadBtn = document.getElementById('close-modal');
const uploadModal = document.getElementById('upload-modal');
const cloudUploadBtn = document.getElementById('cloudinary-upload');
const uploadForm = document.getElementById('upload-form');
const saveBtn = document.getElementById('save-metadata');
const statusMsg = document.getElementById('upload-status');

// Modal Logic
openUploadBtn.addEventListener('click', () => uploadModal.style.display = 'flex');
closeUploadBtn.addEventListener('click', () => uploadModal.style.display = 'none');
window.addEventListener('click', (e) => { if (e.target === uploadModal) uploadModal.style.display = 'none'; });

// Cloudinary Widget
const myWidget = cloudinary.createUploadWidget({
    cloudName: cloudinaryCloudName,
    uploadPreset: cloudinaryUploadPreset,
    sources: ['local', 'url'],
    multiple: false,
    clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
    maxFileSize: 5000000, // 5MB
}, (error, result) => {
    if (!error && result && result.event === "success") {
        console.log('Done! Here is the image info: ', result.info);
        uploadedImageUrl = result.info.secure_url;
        statusMsg.innerHTML = `<span style="color: green;"><i class="fas fa-check"></i> Imagen lista para publicar</span>`;
        saveBtn.disabled = false;
        cloudUploadBtn.innerHTML = `<i class="fas fa-image"></i> Imagen seleccionada`;
    }
});

cloudUploadBtn.addEventListener('click', () => myWidget.open(), false);

// Guardar en Firestore
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!uploadedImageUrl) return;

    const title = document.getElementById('img-title').value;
    const description = document.getElementById('img-desc').value;

    try {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Publicando...`;

        await addDoc(collection(db, "gallery"), {
            url: uploadedImageUrl,
            title: title,
            description: description,
            timestamp: new Date()
        });

        // Limpiar
        uploadForm.reset();
        uploadedImageUrl = "";
        saveBtn.disabled = true;
        saveBtn.innerHTML = `Publicar en Galería`;
        cloudUploadBtn.innerHTML = `<i class="fas fa-image"></i> Seleccionar Imagen`;
        statusMsg.innerHTML = "";
        uploadModal.style.display = 'none';

        alert("¡Imagen publicada con éxito!");

    } catch (error) {
        console.error("Error al guardar:", error);
        alert("Error al publicar la imagen en la base de datos.");
        saveBtn.disabled = false;
        saveBtn.innerHTML = `Publicar en Galería`;
    }
});

// Cargar Imágenes en tiempo real
const q = query(collection(db, "gallery"), orderBy("timestamp", "desc"));

onSnapshot(q, (querySnapshot) => {
    galleryGrid.innerHTML = "";
    
    if (querySnapshot.empty) {
        galleryGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-gray);">
                <i class="fas fa-images fa-3x" style="opacity: 0.5;"></i>
                <p style="margin-top: 15px;">Aún no hay fotos en la galería.</p>
            </div>
        `;
        return;
    }

    querySnapshot.forEach((doc) => {
        const item = doc.data();
        const galleryCard = `
            <div class="gallery-item">
                <img src="${item.url}" alt="${item.title}">
                <div class="gallery-overlay">
                    <h4>${item.title}</h4>
                    <p>${item.description || ''}</p>
                </div>
            </div>
        `;
        galleryGrid.innerHTML += galleryCard;
    });
});
