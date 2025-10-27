// ===== AOS Initialization =====
AOS.init({ once: true });

// ===== Player Section =====
const players = [
  { name: "Aadhi", role: "Defender", image: "image/Aathi.jpg", badge: "Captain" ,more: ["Strong defense", "Fast reaction", "Team leader"]},
  { name: "Ashva", role: "Allround", image: "image/Ashva.jpg", badge: "Vice-Captain" },
  { name: "Karthi", role: "Raider", image: "image/karthi.jpg" },
  { name: "Suresh", role: "Defender", image: "image/suresh.jpg" },
  { name: "Dharshan", role: "Defender", image: "image/dharshan.jpg" },
  { name: "Santhosh", role: "Allround", image: "image/Santhosh.jpg" },
  { name: "Viswa", role: "Raider", image: "image/Viswa.jpg" },
  { name: "Sanjey", role: "Allround", image: "image/Sanjey.jpg" },
  { name: "Sabari", role: "Allround", image: "image/Sabari.jpg" },
  { name: "Vishnu", role: "Allround", image: "image/vishnu.jpg" },
  { name: "Vishal", role: "Raider", image: "" },
  { name: "Raja", role: "Allround", image: "" },
  { name: "Sankar", role: "Allround", image: "" },
  { name: "Ajay", role: "Allround", image: "" }
];

function renderPlayers(filter = "all") {
  const grid = document.getElementById("playersGrid");
  if (!grid) return;

  grid.innerHTML = players
    .filter(p => filter === "all" || p.role === filter)
    .map(p => {
      const idx = players.findIndex(player => player.name === p.name); // Original index
      return `
        <div class="col-6 col-md-4 col-lg-3 mb-4 player-card" data-role="${p.role}" data-aos="fade-up">
          <div class="card shadow-sm position-relative">
            ${p.badge ? `<span class="badge bg-warning text-dark card-badge">${p.badge}</span>` : ""}
            <img src="${p.image}" class="card-img-top" alt="${p.name}">
            <div class="card-body text-center">
              <h5 class="card-title mb-1">${p.name}</h5>
              <p class="mb-1">Role: ${p.role.replace("Allround", "All-Rounder")}</p>
              <button class="btn btn-sm btn-outline-primary" onclick="openPlayerModal(${idx})">View Profile</button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}


function filterPlayers() {
  const value = document.getElementById("roleFilter")?.value;
  renderPlayers(value);
}

function openPlayerModal(id) {
  const p = players[id];
  if (!p) return;

  document.getElementById('playerModalName').innerText = p.name;
  document.getElementById('playerModalRole').innerText = p.role;
  document.getElementById('playerModalImg').src = p.image;
  document.getElementById('playerModalStats').innerText = p.stats || "No stats available";

  const list = document.getElementById('playerModalMore');
  list.innerHTML = '';
  (p.more || []).forEach(x => {
    const li = document.createElement('li');
    li.innerText = x;
    list.appendChild(li);
  });

  const modal = new bootstrap.Modal(document.getElementById('playerModal'));
  modal.show();
}

// Initial render
renderPlayers();

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


