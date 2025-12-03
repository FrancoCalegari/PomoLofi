let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentSongIndex = parseInt(localStorage.getItem("currentSongIndex")) || 0;
let player;

// Cargar YouTube Iframe API
function onYouTubeIframeAPIReady() {
	player = new YT.Player("yt-player", {
		height: "200",
		width: "100%",
		videoId: playlist[currentSongIndex]
			? getId(playlist[currentSongIndex].url)
			: "",
		events: {
			onReady: onPlayerReady,
			onError: onPlayerError,
		},
	});
}

function onPlayerReady(event) {
	// Si hay canciones, cargar la actual pero NO reproducir automáticamente para evitar bloqueos de autoplay
	if (playlist.length > 0) {
		const videoId = getId(playlist[currentSongIndex].url);
		if (videoId !== "error") {
			event.target.cueVideoById(videoId);
			updateCurrentSongDisplay();
		}
	}
}

function onPlayerError(event) {
	console.error("Error en el reproductor:", event.data);
	// Si falla, intentar con la siguiente
	playNext();
}

function playSong(index) {
	if (index < 0 || index >= playlist.length) return;

	currentSongIndex = index;
	const song = playlist[currentSongIndex];

	if (song && player && song.url) {
		const videoId = getId(song.url);
		if (videoId !== "error") {
			player.loadVideoById(videoId);
			updateCurrentSongDisplay();
			localStorage.setItem("currentSongIndex", currentSongIndex);
			document.getElementById("play-btn").innerText = "⏸";
		}
	}
}

function updateCurrentSongDisplay() {
	const song = playlist[currentSongIndex];
	if (song) {
		const name = song.name || song.url;
		document.getElementById("current-song").innerText = "🎵 " + name;
	} else {
		document.getElementById("current-song").innerText =
			"Sin canción seleccionada";
	}
}

function togglePlayPause() {
	if (!player) return;
	const state = player.getPlayerState();
	if (state === YT.PlayerState.PLAYING) {
		player.pauseVideo();
		document.getElementById("play-btn").innerText = "▶";
	} else {
		player.playVideo();
		document.getElementById("play-btn").innerText = "⏸";
	}
}

function playNext() {
	if (playlist.length === 0) return;
	const nextIndex = (currentSongIndex + 1) % playlist.length;
	playSong(nextIndex);
}

function playPrev() {
	if (playlist.length === 0) return;
	const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
	playSong(prevIndex);
}

function addSong() {
	const urlInput = document.getElementById("song-url");
	const nameInput = document.getElementById("song-name"); // Nuevo input para nombre

	const url = urlInput.value.trim();
	const name = nameInput ? nameInput.value.trim() : ""; // Opcional

	const id = getId(url);

	if (id !== "error") {
		playlist.push({ url, name: name || url }); // Guardar objeto con url y nombre
		urlInput.value = "";
		if (nameInput) nameInput.value = "";

		renderPlaylist();
		savePlaylistToLocalStorage();

		// Si es la primera canción, cargarla
		if (playlist.length === 1) {
			playSong(0);
		}
	} else {
		alert("URL de YouTube no válida.");
	}
}

function getId(url) {
	if (!url) return "error";
	const regExp =
		/^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
	const match = url.match(regExp);
	return match && match[1] ? match[1] : "error";
}

function renderPlaylist() {
	const list = document.getElementById("playlist-items");
	list.innerHTML = "";
	playlist.forEach((song, i) => {
		const li = document.createElement("li");
		li.className = i === currentSongIndex ? "active-song" : "";

		const songName = song.name || song.url;

		li.innerHTML = `
      <div class="song-details" onclick="playSong(${i})">
        <span class="song-index">#${i + 1}</span>
        <span class="song-title" title="${song.url}">${songName}</span>
      </div>
      <div class="song-actions">
        <button onclick="moveSongUp(${i})" title="Subir">↑</button>
        <button onclick="moveSongDown(${i})" title="Bajar">↓</button>
        <button onclick="removeSong(${i})" class="remove-btn" title="Eliminar">✖</button>
      </div>
    `;
		list.appendChild(li);
	});
	savePlaylistToLocalStorage();
}

function removeSong(i) {
	playlist.splice(i, 1);
	if (currentSongIndex >= playlist.length) {
		currentSongIndex = Math.max(0, playlist.length - 1);
	}
	renderPlaylist();
	savePlaylistToLocalStorage();
}

function moveSongUp(i) {
	if (i > 0) {
		[playlist[i], playlist[i - 1]] = [playlist[i - 1], playlist[i]];
		if (currentSongIndex === i) currentSongIndex--;
		else if (currentSongIndex === i - 1) currentSongIndex++;

		renderPlaylist();
		savePlaylistToLocalStorage();
	}
}

function moveSongDown(i) {
	if (i < playlist.length - 1) {
		[playlist[i], playlist[i + 1]] = [playlist[i + 1], playlist[i]];
		if (currentSongIndex === i) currentSongIndex++;
		else if (currentSongIndex === i + 1) currentSongIndex--;

		renderPlaylist();
		savePlaylistToLocalStorage();
	}
}

function savePlaylistToLocalStorage() {
	localStorage.setItem("playlist", JSON.stringify(playlist));
}

// Render inicial
renderPlaylist();
