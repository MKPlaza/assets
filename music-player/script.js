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
            album: document.getElementById("album"),
            notification: document.getElementById("notification")
        };

        let state = {
            player: null,
            isPlaying: false,
            isDragging: false,
            showingLyrics: false,
            isMuted: false,
            isLooping: false,
            searchTimeout: null,
            lyricsSyncInterval: null,
            currentTrack: {
                title: "Not Playing",
                artist: "Select a song to start",
                artwork: `${CONFIG.BASE_URL}/empty-art.png`
            }
        };

        const colorThief = new ColorThief();
        let currentColor = { r: 115, g: 98, b: 86 };
        let targetColor = { r: 115, g: 98, b: 86 };
        let animationId = null;

        function showNotification(message, type = 'info') {
            elements.notification.textContent = message;
            elements.notification.className = `notification show ${type}`;
            setTimeout(() => {
                elements.notification.classList.remove('show');
            }, 3000);
        }

        function formatTime(seconds) {
            if (!seconds || isNaN(seconds)) return "0:00";
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
            return `${minutes}:${secs}`;
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Color Animation
        function applyColors(color) {
            if (!color || !Array.isArray(color) || color.length < 3) return;
            
            targetColor = { r: color[0], g: color[1], b: color[2] };
            
            if (animationId) cancelAnimationFrame(animationId);
            animateColors();
        }

        function animateColors() {
            const speed = 0.08;
            const dr = (targetColor.r - currentColor.r) * speed;
            const dg = (targetColor.g - currentColor.g) * speed;
            const db = (targetColor.b - currentColor.b) * speed;

            currentColor.r += dr;
            currentColor.g += dg;
            currentColor.b += db;

            const r = Math.round(currentColor.r);
            const g = Math.round(currentColor.g);
            const b = Math.round(currentColor.b);

            const darkenAmount = 40;
            const endR = Math.max(0, r - darkenAmount);
            const endG = Math.max(0, g - darkenAmount);
            const endB = Math.max(0, b - darkenAmount);

            document.documentElement.style.setProperty("--bg-start", `rgb(${r}, ${g}, ${b})`);
            document.documentElement.style.setProperty("--bg-end", `rgb(${endR}, ${endG}, ${endB})`);

            const tolerance = 1;
            if (
                Math.abs(targetColor.r - currentColor.r) > tolerance ||
                Math.abs(targetColor.g - currentColor.g) > tolerance ||
                Math.abs(targetColor.b - currentColor.b) > tolerance
            ) {
                animationId = requestAnimationFrame(animateColors);
            }
        }

        // YouTube Player Setup
        function loadYouTubeAPI() {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = function() {
            state.player = new YT.Player("ytPlayer", {
                height: "360",
                width: "640",
                videoId: "",
                host: 'https://www.youtube-nocookie.com',
                playerVars: {
                    playsinline: 1,
                    enablejsapi: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    controls: 0
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                    onError: onPlayerError
                }
            });
        };

        function onPlayerReady(event) {
            console.log("YouTube player ready");
            showNotification("Player ready!", "success");
            setupEventListeners();
            startProgressUpdater();
        }

        function onPlayerStateChange(event) {
            const playerState = event.data;
            
            switch (playerState) {
                case YT.PlayerState.PLAYING:
                    state.isPlaying = true;
                    elements.playPauseBtn.className = "fa-solid fa-pause control-btn primary";
                    break;
                case YT.PlayerState.PAUSED:
                    state.isPlaying = false;
                    elements.playPauseBtn.className = "fa-solid fa-play control-btn primary";
                    break;
                case YT.PlayerState.ENDED:
                    state.isPlaying = false;
                    elements.playPauseBtn.className = "fa-solid fa-play control-btn primary";
                    if (state.isLooping) {
                        state.player.seekTo(0);
                        state.player.playVideo();
                    }
                    break;
                case YT.PlayerState.BUFFERING:
                    showNotification("Buffering...");
                    break;
            }
        }

        function onPlayerError(event) {
            console.error("YouTube player error:", event.data);
            showNotification("Playback error occurred", "error");
        }

        const debouncedSearch = debounce((query) => {
            if (query.length > 1) {
                searchSongs(query);
            } else {
                hideSearchResults();
            }
        }, 300);

        function setupSearchListeners() {
            elements.searchInput.addEventListener("input", (e) => {
                debouncedSearch(e.target.value.trim());
            });

            elements.searchInput.addEventListener("keypress", (e) => {
                if (e.key === "Enter") {
                    const query = elements.searchInput.value.trim();
                    if (query.length > 1) {
                        searchSongs(query);
                    }
                }
            });

            document.addEventListener("click", (e) => {
                if (!elements.searchResults.contains(e.target) && e.target !== elements.searchInput) {
                    hideSearchResults();
                }
            });
        }

        async function searchSongs(query) {
            try {
                elements.searchResults.innerHTML = '<div class="loading">Searching...</div>';
                showSearchResults();

                const url = `${CONFIG.SEARCH_EP}${encodeURIComponent(query)}&media=music&limit=12`;
                const response = await fetch(url);
                
                if (!response.ok) throw new Error("Search failed");
                
                const data = await response.json();
                displaySearchResults(data.results || []);
            } catch (error) {
                console.error("Search error:", error);
                elements.searchResults.innerHTML = '<div class="error">Search failed. Please try again.</div>';
            }
        }

        function displaySearchResults(results) {
            if (!results.length) {
                elements.searchResults.innerHTML = '<div class="loading">No results found</div>';
                return;
            }

            elements.searchResults.innerHTML = "";

            results.forEach((item, index) => {
                if (!item.trackName || !item.artistName) return;

                const resultElement = document.createElement("div");
                resultElement.className = "result-item";
                resultElement.setAttribute("role", "option");
                resultElement.setAttribute("tabindex", "0");
                resultElement.innerHTML = `
                    <div class="result-img">
                        <img src="${item.artworkUrl100 || `${CONFIG.BASE_URL}/empty-art.png`}" 
                             alt="${item.trackName}" 
                             crossorigin="anonymous"
                             loading="lazy">
                    </div>
                    <div class="result-info">
                        <div class="result-title">${escapeHtml(item.trackName)}</div>
                        <div class="result-artist">${escapeHtml(item.artistName)}</div>
                    </div>
                `;

                const clickHandler = () => {
                    playSong(item.trackName, item.artistName, item.artworkUrl100);
                    hideSearchResults();
                    elements.searchInput.value = "";
                };

                resultElement.addEventListener("click", clickHandler);
                resultElement.addEventListener("keypress", (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        clickHandler();
                    }
                });

                elements.searchResults.appendChild(resultElement);
            });
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showSearchResults() {
            elements.searchResults.classList.add("active");
        }

        function hideSearchResults() {
            elements.searchResults.classList.remove("active");
        }

        async function playSong(title, artist, artwork) {
            try {
                elements.trackTitle.textContent = title;
                elements.artistName.textContent = artist;

                const highResArtwork = artwork ? artwork.replace("100x100", "600x600") : `${CONFIG.BASE_URL}/empty-art.png`;
                
                elements.albumCover.crossOrigin = "anonymous";
                elements.albumCover.src = highResArtwork;
                
                elements.albumCover.onload = () => {
                    try {
                        const dominantColor = colorThief.getColor(elements.albumCover);
                        applyColors(dominantColor);
                    } catch (e) {
                        console.warn("Color extraction failed:", e);
                    }
                };

                // Update current track
                state.currentTrack = { title, artist, artwork };

                // Load lyrics if in lyrics view
                if (state.showingLyrics) {
                    await fetchLyrics(artist, title);
                }

                // Search and play YouTube video
                const searchQuery = `${title} ${artist}`;
                await searchAndPlayYouTube(searchQuery);
                
                showNotification(`Now playing: ${title}`);
            } catch (error) {
                console.error("Error playing song:", error);
                showNotification("Failed to play song", "error");
            }
        }

        async function searchAndPlayYouTube(query) {
            try {
                const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&key=${CONFIG.YT_KEY}&maxResults=1`;
                
                const response = await fetch(searchUrl);
                if (!response.ok) throw new Error("YouTube search failed");
                
                const data = await response.json();
                
                if (data.items && data.items.length > 0) {
                    const videoId = data.items[0].id.videoId;
                    loadVideo(videoId);
                } else {
                    throw new Error("No YouTube results found");
                }
            } catch (error) {
                console.error("YouTube search error:", error);
                showNotification("Could not find video", "error");
            }
        }

        function loadVideo(videoId) {
            if (state.player && state.player.loadVideoById) {
                state.player.loadVideoById(videoId);
                state.player.playVideo();
                
                if (state.isMuted) {
                    state.player.mute();
                }
            }
        }

        async function fetchLyrics(artist, title) {
            try {
                elements.lyricsContent.textContent = "Loading lyrics...";

                const cleanArtist = encodeURIComponent(artist.trim());
                const cleanTitle = encodeURIComponent(title.trim());
                const url = `${CONFIG.LYRIC_EP}?artist_name=${cleanArtist}&track_name=${cleanTitle}`;

                const response = await fetch(url);
                if (!response.ok) throw new Error("Lyrics not found");

                const data = await response.json();
                displayLyrics(data);
            } catch (error) {
                console.error("Lyrics error:", error);
                elements.lyricsContent.textContent = "No lyrics available.";
            }
        }

        function displayLyrics(data) {
            if (data.syncedLyrics) {
                displaySyncedLyrics(data.syncedLyrics);
            } else if (data.plainLyrics) {
                elements.lyricsContent.innerHTML = data.plainLyrics.replace(/\n/g, "<br>");
            } else {
                elements.lyricsContent.textContent = "No lyrics available.";
            }
        }

        function displaySyncedLyrics(syncedLyrics) {
            const lines = syncedLyrics.trim().split("\n").map(line => {
                const match = line.match(/^\[(\d+):(\d+\.\d+)](.*)$/);
                if (match) {
                    const time = parseInt(match[1], 10) * 60 + parseFloat(match[2]);
                    const text = match[3].trim();
                    return { time, text };
                }
                return null;
            }).filter(Boolean);

            elements.lyricsContent.innerHTML = lines.map((line, index) => 
                `<div class="lyric-line" data-time="${line.time}" id="lyric-${index}">${escapeHtml(line.text)}</div>`
            ).join("");

            startLyricsSync(lines);
        }

        function startLyricsSync(lines) {
            if (state.lyricsSyncInterval) {
                clearInterval(state.lyricsSyncInterval);
            }

            state.lyricsSyncInterval = setInterval(() => {
                if (!state.player || !state.player.getCurrentTime) return;

                const currentTime = state.player.getCurrentTime();
                let activeIndex = -1;

                for (let i = 0; i < lines.length; i++) {
                    if (currentTime >= lines[i].time) {
                        activeIndex = i;
                    } else {
                        break;
                    }
                }

                document.querySelectorAll(".lyric-line").forEach((el, i) => {
                    el.classList.remove("active", "prev", "next");

                    if (i === activeIndex) {
                        el.classList.add("active");
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                    } else if (i === activeIndex - 1) {
                        el.classList.add("prev");
                    } else if (i === activeIndex + 1) {
                        el.classList.add("next");
                    }
                });
            }, 500);
        }

        function togglePlayback() {
            if (!state.player) return;

            if (state.isPlaying) {
                state.player.pauseVideo();
            } else {
                state.player.playVideo();
            }
        }

        function toggleMute() {
            if (!state.player) return;

            if (state.isMuted) {
                state.player.unMute();
                elements.volumeBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i><span>Volume</span>';
                state.isMuted = false;
            } else {
                state.player.mute();
                elements.volumeBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i><span>Muted</span>';
                state.isMuted = true;
            }
        }

        function toggleLoop() {
            state.isLooping = !state.isLooping;
            elements.loopToggle.className = state.isLooping 
                ? "fa-solid fa-repeat-1 control-btn active" 
                : "fa-solid fa-repeat control-btn";
            
            showNotification(state.isLooping ? "Loop enabled" : "Loop disabled");
        }

        function toggleLyrics() {
            state.showingLyrics = !state.showingLyrics;

            if (state.showingLyrics) {
                elements.playerInfo.style.display = "none";
                elements.album.style.display = "none";
                elements.lyricsInfo.style.display = "flex";
                elements.lyricsToggle.innerHTML = '<i class="fa-solid fa-music"></i><span>Player</span>';
                fetchLyrics(state.currentTrack.artist, state.currentTrack.title);
            } else {
                elements.playerInfo.style.display = "flex";
                elements.album.style.display = "flex";
                elements.lyricsInfo.style.display = "none";
                elements.lyricsToggle.innerHTML = '<i class="fa-solid fa-align-left"></i><span>Lyrics</span>';
                
                if (state.lyricsSyncInterval) {
                    clearInterval(state.lyricsSyncInterval);
                }
            }
        }

        function skipTime(seconds) {
            if (!state.player || !state.player.getCurrentTime) return;

            const currentTime = state.player.getCurrentTime();
            const duration = state.player.getDuration();
            const newTime = Math.max(0, Math.min(currentTime + seconds, duration));

            state.player.seekTo(newTime, true);
        }

        function setupSeekBar() {
            elements.seekBar.addEventListener("mousedown", startSeek);
            elements.seekBar.addEventListener("keydown", (e) => {
                if (e.key === "ArrowLeft") skipTime(-5);
                if (e.key === "ArrowRight") skipTime(5);
            });
            
            document.addEventListener("mousemove", dragSeek);
            document.addEventListener("mouseup", endSeek);
        }

        function startSeek(e) {
            state.isDragging = true;
            elements.seekBar.classList.add("active");
            updateSeekPosition(e);
        }

        function dragSeek(e) {
            if (state.isDragging) {
                updateSeekPosition(e);
            }
        }

        function endSeek() {
            if (state.isDragging) {
                state.isDragging = false;
                elements.seekBar.classList.remove("active");
            }
        }

        function updateSeekPosition(e) {
            if (!state.player || !state.player.getDuration) return;

            const rect = elements.seekBar.getBoundingClientRect();
            const position = (e.clientX - rect.left) / rect.width;
            const percent = Math.min(Math.max(position, 0), 1);

            elements.progressBar.style.width = percent * 100 + "%";

            const duration = state.player.getDuration();
            state.player.seekTo(percent * duration, true);
        }

        function updateProgress() {
            if (!state.player || !state.player.getDuration || state.isDragging) return;

            try {
                const duration = state.player.getDuration() || 0;
                const currentTime = state.player.getCurrentTime() || 0;
                const percent = (currentTime / duration) * 100;

                elements.progressBar.style.width = percent + "%";
                elements.currentTimeSpan.textContent = formatTime(currentTime);
                elements.remainingTimeSpan.textContent = "-" + formatTime(duration - currentTime);
            } catch (error) {
                console.error("Progress update error:", error);
            }
        }

        function startProgressUpdater() {
            setInterval(updateProgress, 500);
        }

        function setupEventListeners() {
            elements.playPauseBtn.addEventListener("click", togglePlayback);
            elements.volumeBtn.addEventListener("click", toggleMute);
            elements.loopToggle.addEventListener("click", toggleLoop);
            elements.lyricsToggle.addEventListener("click", toggleLyrics);

            document.getElementById("backward10").addEventListener("click", () => skipTime(-10));
            document.getElementById("backward5").addEventListener("click", () => skipTime(-5));
            document.getElementById("forward5").addEventListener("click", () => skipTime(5));
            document.getElementById("forward10").addEventListener("click", () => skipTime(10));

            document.addEventListener("keydown", handleKeyboardShortcuts);
        }

        function handleKeyboardShortcuts(e) {
            if (e.target === elements.searchInput) return;

            switch (e.code) {
                case "Space":
                    e.preventDefault();
                    togglePlayback();
                    break;
                case "KeyM":
                    toggleMute();
                    break;
                case "KeyL":
                    toggleLoop();
                    break;
                case "KeyY":
                    toggleLyrics();
                    break;
                case "ArrowLeft":
                    skipTime(-5);
                    break;
                case "ArrowRight":
                    skipTime(5);
                    break;
            }
        }

        function init() {
            console.log("Initializing Enhanced Music Player...");
            
            loadYouTubeAPI();
            
            setupSearchListeners();
            
            setupSeekBar();
            
            if (elements.albumCover.complete) {
                try {
                    const dominantColor = colorThief.getColor(elements.albumCover);
                    applyColors(dominantColor);
                } catch (e) {
                    console.warn("Initial color extraction failed:", e);
                }
            }
            
            console.log("Enhanced Music Player initialized!");
        }

        document.addEventListener("DOMContentLoaded", init);

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => console.log('SW registered'))
                    .catch(error => console.log('SW registration failed'));
            });
        }
