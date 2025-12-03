let timer;
let isRunning = false;
let isWorking = true;
let endTime; // Para calcular el tiempo restante con precisión

// ------------------ SONIDOS ------------------
const workSound = new Audio("./assets/sounds/WorkTimer.mp3");
const breakSound = new Audio("./assets/sounds/RelaxTimer.wav");
workSound.loop = false;
breakSound.loop = false;

// ------------------ PERSISTENCIA CONFIGURACIÓN ------------------
function loadConfig() {
	const config = JSON.parse(localStorage.getItem("pomoConfig")) || {
		workHours: 0,
		workMinutes: 25,
		workSeconds: 0,
		breakHours: 0,
		breakMinutes: 5,
		breakSeconds: 0,
	};
	document.getElementById("workHours").value = config.workHours;
	document.getElementById("workMinutes").value = config.workMinutes;
	document.getElementById("workSeconds").value = config.workSeconds;
	document.getElementById("breakHours").value = config.breakHours;
	document.getElementById("breakMinutes").value = config.breakMinutes;
	document.getElementById("breakSeconds").value = config.breakSeconds;

	// Inicializar display con tiempo de trabajo guardado
	updateTimer(config.workHours, config.workMinutes, config.workSeconds);
}

function saveConfig() {
	const config = {
		workHours: parseInt(document.getElementById("workHours").value) || 0,
		workMinutes: parseInt(document.getElementById("workMinutes").value) || 0,
		workSeconds: parseInt(document.getElementById("workSeconds").value) || 0,
		breakHours: parseInt(document.getElementById("breakHours").value) || 0,
		breakMinutes: parseInt(document.getElementById("breakMinutes").value) || 0,
		breakSeconds: parseInt(document.getElementById("breakSeconds").value) || 0,
	};
	localStorage.setItem("pomoConfig", JSON.stringify(config));
}

// Guardar config al cambiar inputs
document.querySelectorAll(".settings input").forEach((input) => {
	input.addEventListener("change", saveConfig);
});

// ------------------ POPUP ------------------
function showPopup(message) {
	const popup = document.getElementById("popup");
	const popupMessage = document.getElementById("popup-message");
	popupMessage.textContent = message;
	popup.classList.add("show");
	setTimeout(() => popup.classList.remove("show"), 4000);
}

// ------------------ TIMER LOGIC ------------------
function updateTimer(hours, minutes, seconds) {
	const hoursDisplay = document.getElementById("hours");
	const minutesDisplay = document.getElementById("minutes");
	const secondsDisplay = document.getElementById("seconds");
	hoursDisplay.textContent = hours.toString().padStart(2, "0");
	minutesDisplay.textContent = minutes.toString().padStart(2, "0");
	secondsDisplay.textContent = seconds.toString().padStart(2, "0");
}

function updateTitle() {
	const title = document.getElementById("title");
	title.textContent = isWorking
		? "PomoLofi - Trabajando"
		: "PomoLofi - Descansando";
	document.title = isWorking ? "PomoLofi - Work" : "PomoLofi - Break";
}

function getWorkTime() {
	return {
		h: parseInt(document.getElementById("workHours").value) || 0,
		m: parseInt(document.getElementById("workMinutes").value) || 0,
		s: parseInt(document.getElementById("workSeconds").value) || 0,
	};
}

function getBreakTime() {
	return {
		h: parseInt(document.getElementById("breakHours").value) || 0,
		m: parseInt(document.getElementById("breakMinutes").value) || 0,
		s: parseInt(document.getElementById("breakSeconds").value) || 0,
	};
}

function startTimerCycle(durationSeconds) {
	if (isRunning) return;
	isRunning = true;

	const now = Date.now();
	endTime = now + durationSeconds * 1000;

	timer = setInterval(() => {
		const timeLeft = Math.ceil((endTime - Date.now()) / 1000);

		if (timeLeft <= 0) {
			clearInterval(timer);
			isRunning = false;
			handleTimerComplete();
			return;
		}

		const h = Math.floor(timeLeft / 3600);
		const m = Math.floor((timeLeft % 3600) / 60);
		const s = timeLeft % 60;
		updateTimer(h, m, s);
	}, 200); // Check más frecuente para suavidad, pero updateTimer solo cambia si cambia el segundo visualmente
}

function handleTimerComplete() {
	// Detener cualquier intervalo previo por seguridad
	stopTimer();

	if (isWorking) {
		// FINALIZÓ TRABAJO -> INICIAR DESCANSO
		isWorking = false;
		updateTitle();

		// Reproducir sonido de descanso (ignorar errores de autoplay)
		breakSound.play().catch((e) => console.warn("Audio play failed:", e));

		showPopup("¡Tiempo de trabajo terminado! 💤 Hora de descansar");

		const t = getBreakTime();
		const totalSeconds = t.h * 3600 + t.m * 60 + t.s;

		// Iniciar automáticamente el descanso
		startTimerCycle(totalSeconds);
	} else {
		// FINALIZÓ DESCANSO -> INICIAR TRABAJO
		isWorking = true;
		updateTitle();

		// Reproducir sonido de trabajo
		workSound.play().catch((e) => console.warn("Audio play failed:", e));

		showPopup("¡Descanso terminado! 🚀 Hora de trabajar");

		const t = getWorkTime();
		const totalSeconds = t.h * 3600 + t.m * 60 + t.s;

		// Iniciar automáticamente el trabajo
		startTimerCycle(totalSeconds);
	}
}

function stopTimer() {
	if (isRunning) {
		clearInterval(timer);
		isRunning = false;
	}
}

function resetTimer() {
	stopTimer();
	isWorking = true;
	updateTitle();
	loadConfig(); // Recarga los valores guardados y actualiza el display
}

// ------------------ EVENT LISTENERS ------------------
document.getElementById("start").addEventListener("click", function () {
	if (isRunning) return;

	// Si estamos "pausados" (hay valores en pantalla), calculamos cuánto falta
	// Pero para simplificar, si se da Start, se inicia con el tiempo configurado O se retoma?
	// La implementación simple es: Start inicia el ciclo actual (Trabajo o Descanso)
	// Si queremos "Resume", necesitaríamos guardar el tiempo restante al hacer Stop.
	// Por ahora, asumiremos que Start inicia el ciclo desde el principio o desde donde se quedó visualmente?
	// Para hacerlo robusto y simple: Start inicia/reinicia el ciclo actual con los valores de los inputs.

	// MEJORA: Calcular segundos actuales en pantalla para "Resume"
	const hDisplay = parseInt(document.getElementById("hours").textContent);
	const mDisplay = parseInt(document.getElementById("minutes").textContent);
	const sDisplay = parseInt(document.getElementById("seconds").textContent);
	const currentSeconds = hDisplay * 3600 + mDisplay * 60 + sDisplay;

	if (currentSeconds > 0) {
		startTimerCycle(currentSeconds);
	} else {
		// Si está en 0, iniciamos ciclo nuevo según estado
		const t = isWorking ? getWorkTime() : getBreakTime();
		startTimerCycle(t.h * 3600 + t.m * 60 + t.s);
	}
});

document.getElementById("stop").addEventListener("click", stopTimer);
document.getElementById("reset").addEventListener("click", resetTimer);

// Inicialización
loadConfig();
updateTitle();

// ------------------ PERFILES ------------------
const MAX_SLOTS = 7;
let profiles =
	JSON.parse(localStorage.getItem("pomoProfiles")) ||
	Array(MAX_SLOTS).fill(null);
let currentProfileIndex = -1;

function renderProfiles() {
	const container = document.getElementById("profileSlots");
	container.innerHTML = "";

	profiles.forEach((profile, index) => {
		const slot = document.createElement("div");
		slot.className = `profile-slot ${profile ? "" : "empty"} ${
			index === currentProfileIndex ? "active" : ""
		}`;

		// Contenido del slot (Nombre)
		const textSpan = document.createElement("span");
		textSpan.textContent = profile
			? `${index + 1}. ${profile.name}`
			: `${index + 1}. Vacío`;
		textSpan.onclick = () => loadProfile(index);
		textSpan.style.flexGrow = "1"; // Ocupar espacio disponible

		slot.appendChild(textSpan);

		// Botón de eliminar (solo si hay perfil)
		if (profile) {
			const deleteBtn = document.createElement("button");
			deleteBtn.textContent = "✖";
			deleteBtn.className = "delete-profile-btn";
			deleteBtn.title = "Borrar memoria";
			deleteBtn.onclick = (e) => {
				e.stopPropagation(); // Evitar cargar el perfil al borrar
				deleteProfile(index);
			};
			slot.appendChild(deleteBtn);
		} else {
			// Si está vacío, el click en todo el slot carga (selecciona)
			slot.onclick = () => loadProfile(index);
		}

		container.appendChild(slot);
	});
}

function deleteProfile(index) {
	showConfirm(
		`¿Seguro que quieres borrar el perfil del Slot ${index + 1}?`,
		() => {
			profiles[index] = null;
			localStorage.setItem("pomoProfiles", JSON.stringify(profiles));

			if (currentProfileIndex === index) {
				currentProfileIndex = -1;
				document.getElementById("profileName").value = "";
				updateProfileIndicator(""); // Limpiar indicador
			}

			renderProfiles();
			showPopup(`🗑️ Slot ${index + 1} borrado`);
		}
	);
}

// ------------------ POPUP CONFIRMACIÓN ------------------
function showConfirm(message, onConfirm) {
	const popup = document.getElementById("popup-confirm");
	const msgElement = document.getElementById("confirm-message");
	const yesBtn = document.getElementById("confirm-yes");
	const noBtn = document.getElementById("confirm-no");

	msgElement.textContent = message;
	popup.classList.add("show");

	// Limpiar eventos anteriores para evitar múltiples llamadas
	const newYesBtn = yesBtn.cloneNode(true);
	const newNoBtn = noBtn.cloneNode(true);
	yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);
	noBtn.parentNode.replaceChild(newNoBtn, noBtn);

	newYesBtn.addEventListener("click", () => {
		popup.classList.remove("show");
		if (onConfirm) onConfirm();
	});

	newNoBtn.addEventListener("click", () => {
		popup.classList.remove("show");
	});
}

function saveProfile() {
	const nameInput = document.getElementById("profileName");
	const name = nameInput.value.trim();

	if (!name) {
		showPopup("⚠️ Ingresa un nombre para el perfil");
		return;
	}

	// Buscar primer slot vacío o usar el seleccionado
	let targetIndex = currentProfileIndex;
	if (targetIndex === -1) {
		// Si no hay ninguno seleccionado, buscar el primero vacío
		targetIndex = profiles.findIndex((p) => p === null);
		if (targetIndex === -1) {
			// Si están todos llenos, pedir seleccionar uno para sobrescribir (o usar el último por defecto, pero mejor pedir interacción)
			// Para simplificar UX: si no hay selección, sobrescribir el 1 o pedir click
			showPopup("⚠️ Selecciona un slot para guardar");
			return;
		}
	}

	const config = {
		workHours: document.getElementById("workHours").value,
		workMinutes: document.getElementById("workMinutes").value,
		workSeconds: document.getElementById("workSeconds").value,
		breakHours: document.getElementById("breakHours").value,
		breakMinutes: document.getElementById("breakMinutes").value,
		breakSeconds: document.getElementById("breakSeconds").value,
	};

	profiles[targetIndex] = { name, config };
	localStorage.setItem("pomoProfiles", JSON.stringify(profiles));

	currentProfileIndex = targetIndex;
	renderProfiles();
	showPopup(`✅ Perfil "${name}" guardado en Slot ${targetIndex + 1}`);
	updateProfileIndicator(name);
}

function loadProfile(index) {
	const profile = profiles[index];
	if (!profile) {
		// Si está vacío, permitir seleccionarlo para guardar ahí
		currentProfileIndex = index;
		renderProfiles();
		document.getElementById("profileName").value = "";
		showPopup(`Slot ${index + 1} seleccionado (Vacío)`);
		return;
	}

	// Guardar la config del perfil en localStorage como la config actual
	localStorage.setItem("pomoConfig", JSON.stringify(profile.config));

	// Cargar desde localStorage usando la función centralizada
	loadConfig();

	currentProfileIndex = index;
	document.getElementById("profileName").value = profile.name;
	renderProfiles();
	showPopup(`📂 Perfil "${profile.name}" cargado`);
	updateProfileIndicator(profile.name);
}

function updateProfileIndicator(name) {
	// Mostrar nombre del perfil en la UI principal si se desea
	// Por ahora lo mostramos en el título o creamos un elemento nuevo
	// El usuario pidió "en el pomodoro mostrar que memoria se esta usando"
	let indicator = document.getElementById("profile-indicator");
	if (!indicator) {
		indicator = document.createElement("div");
		indicator.id = "profile-indicator";
		indicator.style.fontSize = "1rem";
		indicator.style.marginTop = "0";
		indicator.style.marginBottom = "10px";
		indicator.style.opacity = "0.8";
		indicator.style.textAlign = "center";

		const title = document.getElementById("title");
		title.parentNode.insertBefore(indicator, title.nextSibling);
	}
	indicator.textContent = `Perfil: ${name}`;
}

function exportProfiles() {
	const dataStr =
		"data:text/json;charset=utf-8," +
		encodeURIComponent(JSON.stringify(profiles));
	const downloadAnchorNode = document.createElement("a");
	downloadAnchorNode.setAttribute("href", dataStr);
	downloadAnchorNode.setAttribute("download", "pomolofi_profiles.txt");
	document.body.appendChild(downloadAnchorNode); // required for firefox
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

function importProfiles(event) {
	const file = event.target.files[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = function (e) {
		try {
			const imported = JSON.parse(e.target.result);
			if (Array.isArray(imported) && imported.length <= MAX_SLOTS) {
				profiles = imported;
				// Rellenar si faltan slots hasta MAX_SLOTS
				while (profiles.length < MAX_SLOTS) profiles.push(null);

				localStorage.setItem("pomoProfiles", JSON.stringify(profiles));
				renderProfiles();
				showPopup("✅ Perfiles importados correctamente");
			} else {
				showPopup("❌ Archivo inválido");
			}
		} catch (error) {
			showPopup("❌ Error al leer el archivo");
			console.error(error);
		}
	};
	reader.readAsText(file);
	// Reset input
	event.target.value = "";
}

// Event Listeners Perfiles
document
	.getElementById("saveProfileBtn")
	.addEventListener("click", saveProfile);
document
	.getElementById("exportProfilesBtn")
	.addEventListener("click", exportProfiles);
document
	.getElementById("importProfilesBtn")
	.addEventListener("click", () =>
		document.getElementById("importFile").click()
	);
document
	.getElementById("importFile")
	.addEventListener("change", importProfiles);

// Inicializar UI de perfiles
renderProfiles();
