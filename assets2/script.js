const shows = [
    {
        title: "Abbott Elementary",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BYjU5YTdlZTItNWM5Yi00OGM1LTk1NGItNjY5MGU3Y2JkOWIwXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        links: [
            { part: "Season 1", url: "https://drive.google.com/drive/folders/13dLvT0_1TkcRmVmF6tZlm80xqeoWhxZp" },
            { part: "Season 2", url: "https://drive.google.com/drive/folders/1gAtljQ6SnEWUS8HXW-y5jtbcKILcUnFU" }
        ]
    },
    {
        title: "Arcane",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BYjA2NzhlMDItNWRmZC00MzRjLWE3ZjAtZjBlZDAwOWY2ODdjXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg",
        links: [
            { part: "Season 1", url: "https://drive.google.com/drive/folders/1TKueC2iWAFibt1ih645ZWfQljYODJzs1" },
            { part: "Season 2", url: "https://drive.google.com/drive/folders/1DteIHGPT-Ef8UfjO8wXG3dJivygYJVM_" }
        ]
    },
    {
        title: "Breaking Bad",
        imageUrl: "https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_.jpg",
        link: "https://drive.google.com/drive/folders/1IY6qairkXpK2RXE0UVtqwm5ZjeiGYk3N"
    }
    
];

shows.forEach(show => {
    if (show.imageUrl) {
        show.imageUrl = show.imageUrl.replace("httpss://", "https://").replace("https.", "https://");
    }
});
shows.sort((a, b) => a.title.localeCompare(b.title));

const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const modalOverlay = document.getElementById('modal-overlay');
const modalButtons = document.getElementById('modal-buttons');
const modalTitle = document.getElementById('modal-title');

function renderGallery(filter = "") {
    gallery.innerHTML = shows
        .filter(show => show.title.toLowerCase().includes(filter.toLowerCase()))
        .map((show, index) => `
            <div class="movie-card" onclick="handleCardClick(${shows.indexOf(show)})">
                <div class="poster-placeholder">
                    <img src="${show.imageUrl}" alt="${show.title}">
                </div>
                <div class="movie-details">
                    <div class="movie-title">${show.title}</div>
                </div>
            </div>
        `).join('');
}

function handleCardClick(index) {
    const show = shows[index];
    if (show.links) {
        openModal(show);
    } else if (show.link) {
        window.open(show.link, '_blank');
    }
}

function openModal(show) {
    modalTitle.textContent = show.title;
    modalButtons.innerHTML = show.links.map(link => `
        <a href="${link.url}" target="_blank" class="modal-button">${link.part}</a>
    `).join('');
    modalOverlay.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
}

searchInput.addEventListener('input', (e) => renderGallery(e.target.value));
document.getElementById('modal-close').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if(e.target === modalOverlay) closeModal(); });

renderGallery();