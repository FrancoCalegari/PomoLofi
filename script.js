let timer;
let isRunning = false;
let isWorking = true;

function updateTimer(hours, minutes, seconds) {
  const hoursDisplay = document.getElementById('hours');
  const minutesDisplay = document.getElementById('minutes');
  const secondsDisplay = document.getElementById('seconds');

  hoursDisplay.textContent = hours.toString().padStart(2, '0');
  minutesDisplay.textContent = minutes.toString().padStart(2, '0');
  secondsDisplay.textContent = seconds.toString().padStart(2, '0');
}

function updateTitle() {
  const title = document.getElementById('title');
  title.textContent = isWorking ? "Pomodoro Timer - Trabajando" : "Pomodoro Timer - Descansando";
}

function startTimer(workHours, workMinutes, workSeconds, breakHours, breakMinutes, breakSeconds) {
  if (!isRunning) {
    isRunning = true;
    let totalWorkSeconds = workHours * 3600 + workMinutes * 60 + workSeconds;
    let workHoursLeft = Math.floor(totalWorkSeconds / 3600);
    let workMinutesLeft = Math.floor((totalWorkSeconds % 3600) / 60);
    let workSecondsLeft = totalWorkSeconds % 60;

    timer = setInterval(() => {
      if (workHoursLeft === 0 && workMinutesLeft === 0 && workSecondsLeft === 0) {
        clearInterval(timer);
        isRunning = false;
        isWorking = false;
        updateTitle();
        alert("¡Tiempo de trabajo terminado! ¡Hora de descansar!");
        startBreak(breakHours, breakMinutes, breakSeconds);
        return;
      }
      if (workSecondsLeft === 0) {
        if (workMinutesLeft === 0 && workHoursLeft === 0) {
          clearInterval(timer);
          isRunning = false;
          return;
        }
        if (workMinutesLeft > 0) {
          workMinutesLeft--;
        } else {
          workHoursLeft--;
          workMinutesLeft = 59;
        }
        workSecondsLeft = 59;
      } else {
        workSecondsLeft--;
      }
      updateTimer(workHoursLeft, workMinutesLeft, workSecondsLeft);
    }, 1000);
  }
}

function startBreak(breakHours, breakMinutes, breakSeconds) {
  let totalBreakSeconds = breakHours * 3600 + breakMinutes * 60 + breakSeconds;
  let breakHoursLeft = Math.floor(totalBreakSeconds / 3600);
  let breakMinutesLeft = Math.floor((totalBreakSeconds % 3600) / 60);
  let breakSecondsLeft = totalBreakSeconds % 60;

  timer = setInterval(() => {
    if (breakHoursLeft === 0 && breakMinutesLeft === 0 && breakSecondsLeft === 0) {
      clearInterval(timer);
      isRunning = false;
      isWorking = true;
      updateTitle();
      alert("¡Tiempo de descanso terminado! ¡Hora de trabajar de nuevo!");
      startTimer(parseInt(document.getElementById('workHours').value),
                 parseInt(document.getElementById('workMinutes').value),
                 parseInt(document.getElementById('workSeconds').value),
                 parseInt(document.getElementById('breakHours').value),
                 parseInt(document.getElementById('breakMinutes').value),
                 parseInt(document.getElementById('breakSeconds').value));
      return;
    }
    if (breakSecondsLeft === 0) {
      if (breakMinutesLeft === 0 && breakHoursLeft === 0) {
        clearInterval(timer);
        isRunning = false;
        return;
      }
      if (breakMinutesLeft > 0) {
        breakMinutesLeft--;
      } else {
        breakHoursLeft--;
        breakMinutesLeft = 59;
      }
      breakSecondsLeft = 59;
    } else {
      breakSecondsLeft--;
    }
    updateTimer(breakHoursLeft, breakMinutesLeft, breakSecondsLeft);
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  isRunning = false;
}

function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  document.getElementById('workHours').value = "0";
  document.getElementById('workMinutes').value = "25";
  document.getElementById('workSeconds').value = "0";
  document.getElementById('breakHours').value = "0";
  document.getElementById('breakMinutes').value = "5";
  document.getElementById('breakSeconds').value = "0";
  updateTimer(0, 25, 0);
}

document.getElementById('start').addEventListener('click', function() {
  let workHours = parseInt(document.getElementById('workHours').value);
  let workMinutes = parseInt(document.getElementById('workMinutes').value);
  let workSeconds = parseInt(document.getElementById('workSeconds').value);
  let breakHours = parseInt(document.getElementById('breakHours').value);
  let breakMinutes = parseInt(document.getElementById('breakMinutes').value);
  let breakSeconds = parseInt(document.getElementById('breakSeconds').value);
  startTimer(workHours, workMinutes, workSeconds, breakHours, breakMinutes, breakSeconds);
});
document.getElementById('stop').addEventListener('click', stopTimer);
document.getElementById('reset').addEventListener('click', resetTimer);

updateTimer(0, 25, 0);
updateTitle(); // Iniciar el temporizador con valores predeterminados y título adecuado
