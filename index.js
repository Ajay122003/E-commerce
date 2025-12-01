// ===== AOS Initialization =====
AOS.init({ once: true });



// ===== Gallery Section =====
const galleryImages = [
  "image/gallary1.jpg",
  "image/gallary2.jpg",
  "image/gallary3.jpg",
  "image/gallary4.jpg",
  "image/gallary5.jpg",
  "image/gallary7.jpg",
  "image/gallary8.jpg",
  "image/gallary9.jpg",
  "image/gallary10.jpg",
  "image/gallary11.jpg"
];

function chunkArray(arr, chunkSize) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += chunkSize) chunks.push(arr.slice(i, i + chunkSize));
  return chunks;
}

const galleryContainer = document.getElementById("galleryInner");
if (galleryContainer) {
  const slides = chunkArray(galleryImages, 3);
  galleryContainer.innerHTML = slides
    .map((group, index) => `
      <div class="carousel-item ${index === 0 ? 'active' : ''}">
        <div class="row justify-content-center">
          ${group.map(img => `
            <div class="col-md-4 mb-3">
              <img src="${img}" class="d-block w-100 rounded" alt="Gallery image">
            </div>
          `).join('')}
        </div>
      </div>
    `)
    .join('');
}


