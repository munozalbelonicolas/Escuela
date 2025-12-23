// Gallery Display Logic - Uses shared Firebase config
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, query, orderBy, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get the gallery grid element
const galleryGrid = document.getElementById('gallery-grid');

// Determine which level to filter by based on the page
function getPageLevel() {
    const path = window.location.pathname;
    if (path.includes('jardin')) return 'jardin';
    if (path.includes('primaria')) return 'primaria';
    if (path.includes('secundaria')) return 'secundaria';
    return null; // Show all
}

// Load images from Firestore
function loadGallery() {
    const level = getPageLevel();

    let q;
    if (level) {
        // Filter by level OR show "general" images
        q = query(
            collection(db, "gallery"),
            orderBy("timestamp", "desc")
        );
    } else {
        q = query(collection(db, "gallery"), orderBy("timestamp", "desc"));
    }

    onSnapshot(q, (querySnapshot) => {
        // Filter client-side to include level-specific + general photos
        const filteredDocs = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!level || data.level === level || data.level === 'general') {
                filteredDocs.push(data);
            }
        });

        if (filteredDocs.length === 0) {
            galleryGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-gray);">
                    <i class="fas fa-images fa-3x" style="opacity: 0.5;"></i>
                    <p style="margin-top: 15px;">Aún no hay fotos en la galería.</p>
                </div>
            `;
            return;
        }

        galleryGrid.innerHTML = "";

        filteredDocs.forEach((item) => {
            const galleryCard = document.createElement('div');
            galleryCard.className = 'gallery-item';
            galleryCard.innerHTML = `
                <img src="${item.url}" alt="${item.title}" loading="lazy">
                <div class="gallery-overlay">
                    <h4>${item.title}</h4>
                    <p>${item.description || ''}</p>
                </div>
            `;
            galleryGrid.appendChild(galleryCard);
        });
    }, (error) => {
        console.error("Error loading gallery:", error);
        galleryGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #dc2626;">
                <i class="fas fa-exclamation-circle fa-3x"></i>
                <p style="margin-top: 15px;">Error al cargar la galería. Intentá recargar la página.</p>
            </div>
        `;
    });
}

// Initialize
if (galleryGrid) {
    loadGallery();
}
