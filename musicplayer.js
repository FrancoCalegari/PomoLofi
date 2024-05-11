var playlist = JSON.parse(localStorage.getItem("playlist")) || [];

var currentSongIndex = parseInt(localStorage.getItem("currentSongIndex")) || 0;
var playerFrame = document.createElement("iframe");
playerFrame.setAttribute("width", "100%");
playerFrame.setAttribute("height", "200");
playerFrame.setAttribute("frameborder", "0");
playerFrame.setAttribute("allowfullscreen", "true");
document.querySelector(".music-player").appendChild(playerFrame);

function playSong(index) {
  currentSongIndex = index;
  var currentSong = playlist[currentSongIndex];
  if (currentSong) {
    playerFrame.setAttribute("src", currentSong.url);
    document.getElementById("current-song").innerText = "Canción actual: " + currentSongIndex;
    localStorage.setItem("currentSongIndex", currentSongIndex);
  }
}

function togglePlayPause() {
  if (playerFrame.contentWindow.document.querySelector(".html5-video-player")) {
    var playerState = playerFrame.contentWindow.document.querySelector(".html5-video-player").getPlayerState();
    if (playerState === 1) {
      playerFrame.contentWindow.document.querySelector(".html5-video-player").pauseVideo();
      document.getElementById("play-btn").innerText = "▶";
    } else {
      playerFrame.contentWindow.document.querySelector(".html5-video-player").playVideo();
      document.getElementById("play-btn").innerText = "⏸";
    }
  }
}

function playNext() {
  var nextIndex = (currentSongIndex + 1) % playlist.length;
  if (playlist[nextIndex]) {
    currentSongIndex = nextIndex;
    playSong(currentSongIndex);
  }
}

function playPrev() {
  var prevIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  if (playlist[prevIndex]) {
    currentSongIndex = prevIndex;
    playSong(currentSongIndex);
  }
}

function addSong() {
  var songUrlInput = document.getElementById("song-url");
  var songUrl = songUrlInput.value;
  if (songUrl.trim() !== "") {
    playlist.push({ url: songUrl });
    songUrlInput.value = "";
    renderPlaylist();
    savePlaylistToLocalStorage();
  }
}

function removeSong(index) {
  playlist.splice(index, 1);
  renderPlaylist();
  savePlaylistToLocalStorage();
}

function moveSongUp(index) {
  if (index > 0) {
    var temp = playlist[index];
    playlist[index] = playlist[index - 1];
    playlist[index - 1] = temp;
    renderPlaylist();
    savePlaylistToLocalStorage();
  }
}

function moveSongDown(index) {
  if (index < playlist.length - 1) {
    var temp = playlist[index];
    playlist[index] = playlist[index + 1];
    playlist[index + 1] = temp;
    renderPlaylist();
    savePlaylistToLocalStorage();
  }
}

function renderPlaylist() {
  var playlistItems = document.getElementById("playlist-items");
  playlistItems.innerHTML = "";
  for (var i = 0; i < playlist.length; i++) {
    var listItem = document.createElement("li");
    listItem.innerHTML = '<span style="word-break: break-word;">' + playlist[i].url + '</span>' +
                          '<button onclick="removeSong(' + i + ')" class="remove-btn">Eliminar</button>' +
                          '<button onclick="moveSongUp(' + i + ')" class="move-up-btn">↑</button>' +
                          '<button onclick="moveSongDown(' + i + ')" class="move-down-btn">↓</button>';
    playlistItems.appendChild(listItem);
  }
  savePlaylistToLocalStorage();
}

function savePlaylistToLocalStorage() {
  localStorage.setItem("playlist", JSON.stringify(playlist));
}

// Reproduce la primera canción cuando se carga la página
playSong(currentSongIndex);
renderPlaylist();
