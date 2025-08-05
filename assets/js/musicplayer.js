let playlist = JSON.parse(localStorage.getItem("playlist")) || [];
let currentSongIndex = parseInt(localStorage.getItem("currentSongIndex")) || 0;
let player;

// Cargar YouTube Iframe API
function onYouTubeIframeAPIReady() {
  player = new YT.Player('yt-player', {
    height: '200',
    width: '100%',
    videoId: getId(playlist[currentSongIndex]?.url || '') || '',
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady() {
  playSong(currentSongIndex);
}

function playSong(index) {
  currentSongIndex = index;
  const song = playlist[currentSongIndex];
  if (song && player && song.url) {
    const videoId = getId(song.url);
    if (videoId !== 'error') {
      player.loadVideoById(videoId);
      document.getElementById("current-song").innerText = "Canción actual: " + song.url;
      localStorage.setItem("currentSongIndex", currentSongIndex);
    }
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
  const nextIndex = (currentSongIndex + 1) % playlist.length;
  playSong(nextIndex);
}

function playPrev() {
  const prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  playSong(prevIndex);
}

function addSong() {
  const input = document.getElementById("song-url");
  const url = input.value.trim();
  const id = getId(url);
  if (id !== 'error') {
    playlist.push({ url });
    input.value = "";
    renderPlaylist();
    savePlaylistToLocalStorage();
  } else {
    alert("URL de YouTube no válida.");
  }
}

function getId(url) {
  const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]{11}).*/;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : 'error';
}

function renderPlaylist() {
  const list = document.getElementById("playlist-items");
  list.innerHTML = "";
  playlist.forEach((song, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${song.url}</span>
      <button onclick="removeSong(${i})">Eliminar</button>
      <button onclick="moveSongUp(${i})">↑</button>
      <button onclick="moveSongDown(${i})">↓</button>
    `;
    list.appendChild(li);
  });
  savePlaylistToLocalStorage();
}

function removeSong(i) {
  playlist.splice(i, 1);
  renderPlaylist();
  savePlaylistToLocalStorage();
}

function moveSongUp(i) {
  if (i > 0) {
    [playlist[i], playlist[i - 1]] = [playlist[i - 1], playlist[i]];
    renderPlaylist();
    savePlaylistToLocalStorage();
  }
}

function moveSongDown(i) {
  if (i < playlist.length - 1) {
    [playlist[i], playlist[i + 1]] = [playlist[i + 1], playlist[i]];
    renderPlaylist();
    savePlaylistToLocalStorage();
  }
}

function savePlaylistToLocalStorage() {
  localStorage.setItem("playlist", JSON.stringify(playlist));
}
