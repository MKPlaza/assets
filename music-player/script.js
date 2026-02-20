const CONFIG = {
    YT_KEY: "AIzaSyAf62uxazE_nFYZhq1St7jPjSL9l7-mzV8",
    LYRIC_EP: "https://lrclib.net/api/get",
    SEARCH_EP: "https://itunes.apple.com/search?term=",
    BASE_URL: "https://music-player-eight-omega.vercel.app"
};

const elements = {
    searchInput: document.getElementById("searchInput"),
    searchResults: document.getElementById("searchResults"),
    trackTitle: document.getElementById("trackTitle"),
    artistName: document.getElementById("artistName"),
    albumCover: document.getElementById("albumCover"),
    playPauseBtn: document.getElementById("playPause"),
    volumeBtn: document.getElementById("volumeBtn"),
    seekBar: document.getElementById("seekbar"),
    progressBar: document.getElementById("progress"),
    currentTimeSpan: document.getElementById("currentTime"),
    remainingTimeSpan: document.getElementById("remainingTime"),
    lyricsToggle: document.getElementById("lyricsToggle"),
    playerInfo: document.getElementById("playerInfo"),
    lyricsInfo: document.getElementById("lyricsInfo"),
    lyricsContent: document.getElementById("lyricsContent"),
    loopToggle: document.getElementById("loopToggle"),
    notification: document.getElementById("notification")
};

let state = {
    player: null, isPlaying: false, isDragging: false, showingLyrics: false,
    isMuted: false, isLooping: false, lyricsSyncInterval: null,
    currentTrack: { title: "Not Playing", artist: "Select a song", artwork: "" }
};

const colorThief = new ColorThief();

// YouTube API initialization
function loadYouTubeAPI() {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
}

window.onYouTubeIframeAPIReady = function() {
    state.player = new YT.Player("ytPlayer", {
        events: {
            'onStateChange': onPlayerStateChange,
            'onReady': () => setInterval(updateProgress, 500)
        }
    });
};

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        state.isPlaying = true;
        elements.playPauseBtn.className = "fa-solid fa-pause control-btn primary";
    } else {
        state.isPlaying = false;
        elements.playPauseBtn.className = "fa-solid fa-play control-btn primary";
        if (event.data === YT.PlayerState.ENDED && state.isLooping) {
            state.player.seekTo(0);
            state.player.playVideo();
        }
    }
}

// Music Logic
async function searchSongs(query) {
    const response = await fetch(`${CONFIG.SEARCH_EP}${encodeURIComponent(query)}&media=music&limit=12`);
    const data = await response.json();
    displayResults(data.results);
}

function displayResults(results) {
    elements.searchResults.innerHTML = results.map(item => `
        <div class="result-item" onclick="playSong('${item.trackName.replace(/'/g, "\\'")}', '${item.artistName.replace(/'/g, "\\'")}', '${item.artworkUrl100}')">
            <img src="${item.artworkUrl100}" width="40" style="border-radius:4px; margin-right:10px;">
            <div>
                <div style="font-weight:600">${item.trackName}</div>
                <div style="font-size:12px; color:gray">${item.artistName}</div>
            </div>
        </div>
    `).join('');
    elements.searchResults.classList.add('active');
}

async function playSong(title, artist, artwork) {
    state.currentTrack = { title, artist, artwork };
    elements.trackTitle.textContent = title;
    elements.artistName.textContent = artist;
    elements.albumCover.src = artwork.replace("100x100", "600x600");
    
    elements.searchResults.classList.remove('active');
    
    const ytResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(title + " " + artist)}&type=video&key=${CONFIG.YT_KEY}&maxResults=1`);
    const ytData = await ytResponse.json();
    if (ytData.items.length > 0) {
        state.player.loadVideoById(ytData.items[0].id.videoId);
    }
}

function updateProgress() {
    if (!state.player || !state.player.getDuration || state.isDragging) return;
    const dur = state.player.getDuration();
    const cur = state.player.getCurrentTime();
    elements.progressBar.style.width = (cur / dur * 100) + "%";
    elements.currentTimeSpan.textContent = formatTime(cur);
    elements.remainingTimeSpan.textContent = "-" + formatTime(dur - cur);
}

function formatTime(s) {
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// Events
elements.playPauseBtn.onclick = () => state.isPlaying ? state.player.pauseVideo() : state.player.playVideo();
elements.searchInput.oninput = (e) => e.target.value.length > 2 && searchSongs(e.target.value);
elements.lyricsToggle.onclick = () => {
    state.showingLyrics = !state.showingLyrics;
    elements.playerInfo.style.display = state.showingLyrics ? "none" : "flex";
    elements.lyricsInfo.style.display = state.showingLyrics ? "flex" : "none";
};

document.addEventListener("DOMContentLoaded", loadYouTubeAPI);