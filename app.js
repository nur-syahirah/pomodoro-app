// Pomodoro config
const FOCUS_DURATION = 25 * 60; // 25 min in seconds
const BREAK_DURATION = 5 * 60; //  5 min in seconds
const MAX_SESSIONS = 4; //  Number of focus blocks

// Audio elements
const bells = new Audio("resources/audio/bell.mp3");
const backgroundAudio = document.getElementById("background-audio");
backgroundAudio.volume = 1;
const clickSound = new Audio('resources/audio/button.mp3');
clickSound.volume = 0.25;

// Button elements
const startBtn = document.querySelector(".btn-start");
const pauseBtn = document.querySelector(".btn-pause");
const resetBtn = document.querySelector(".btn-reset");

// Timer display elements
const session = document.querySelector(".minutes");
const seconds = document.querySelector(".seconds");

// Dynamic state
let cycleCount = 0; // number of completed focus sessions
let isBreak = false;

let myInterval;
let totalSeconds;
let isRunning = false;
let hasStarted = false; // To know if we are resuming or starting fresh

// Grab the message element
const messageEl = document.querySelector('.app-message');

// Declare default message at file scope
const DEFAULT_MSG = `
This is a Pomodoro focus technique. You will be focusing for 4 cycles of 25 minutes followed by a 5-minute break.
Ready to conquer the world? PRESS LEGGO! 
P.S. You may need to adjust your volume to a higher setting. 

Any other matters to attend? Press the pause or reset button.
Do remember though, if you snooze, you lose~
`.trim();

// Helper to update the UI
function setMessage(text) {
  messageEl.textContent = text;
}

// Message templates for each cycle
const focusMessages = [
  'Leggo! First lap! Lets do this!',
  '2nd lap! Almost halfwayyy! LEGGO!',
  '3rd lap! Keep pushing—almost there!',
  '4th lap! Final stretch! YAYYY! You got this!'
];

const breakMessages = [
  'Well done! You deserve the break! Go stand up, stretch, look outside the window, listen to your favourite music, reach out to your loved ones, whatever floats your boat!',
  'YOU ARE GREAT! Mid way thru! Go walk around the room, get some fresh air, get a lil snackie!',
  'Break time! Almost done—rest, breathe, refocus!'
];

document.addEventListener("DOMContentLoaded", () => {
  const hour = new Date().getHours();
  let theme;

  if (hour >= 6 && hour < 19) theme = "morning";
  else theme = "night";

  document.body.classList.add(theme);
  setMessage(DEFAULT_MSG);

});

function updateDisplay() {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  session.textContent = mins < 10 ? "0" + mins : mins;
  seconds.textContent = secs < 10 ? "0" + secs : secs;
}

const appTimer = () => {
  if (isRunning) return; // To prevent starting a new timer if one is already running

  isRunning = true;
  startBtn.disabled = true;

  // Show pause and reset buttons and hide start button
  startBtn.classList.add("hidden");
  pauseBtn.classList.remove("hidden");
  resetBtn.classList.remove("hidden");

  // Determine duration
  if (!hasStarted) {
    totalSeconds = isBreak ? BREAK_DURATION : FOCUS_DURATION;
    hasStarted = true;
  }

  // Set the message for this phase
  if (!isBreak) {
    // focus phase: cycleCount goes 0→1 after end, so index = cycleCount
    setMessage(focusMessages[cycleCount]);
  } else {
    // break phase: cycleCount already incremented after focus, so break index = cycleCount - 1
    setMessage(breakMessages[cycleCount - 1] || 'Enjoy your break!');
  }

  updateDisplay();

  if (!isBreak) backgroundAudio.play();
  else {
    backgroundAudio.pause();
    backgroundAudio.currentTime = 0;
  }

  myInterval = setInterval(updateSeconds, 1000);
};
const updateSeconds = () => {
  totalSeconds--;

  if (totalSeconds >= 0) {
    updateDisplay();
    return;
  }

  // time’s up!
  clearInterval(myInterval);
  isRunning = false;
  hasStarted = false;

  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;

  bells.currentTime = 0;
  bells.play();

  // once the bell finishes, switch to next phase
  bells.addEventListener('ended', () => {
    if (!isBreak) {

      // just finished a focus session
      cycleCount += 1;

      if (cycleCount < MAX_SESSIONS) {
        isBreak = true;   // now do a break
        appTimer();       // auto-start the 5 min break

      } else {
        // all 4 pomodoros done
        alert('All 4 Pomodoro sessions complete! Great work!');
        resetTimer();
      }

    } else {
      // just finished a break
      isBreak = false;    // now do a focus session
      appTimer();         // auto-start next 25 min
    }
  }, { once: true });
};

const resetTimer = () => {
  clearInterval(myInterval);
  isRunning = false;
  hasStarted = false;
  isBreak = false;
  cycleCount = 0;

  backgroundAudio.pause();
  backgroundAudio.currentTime = 0;

  startBtn.disabled = false;
  session.textContent = "25";
  seconds.textContent = "00";

  startBtn.disabled = false;
  startBtn.classList.remove("hidden");

  pauseBtn.classList.add("hidden");
  resetBtn.classList.add("hidden");

  setMessage(DEFAULT_MSG);

};

const pauseTimer = () => {
  if (!isRunning) return;

  clearInterval(myInterval);
  isRunning = false;

  // Stop focus audio
  backgroundAudio.pause();

  // Show/hide buttons
  startBtn.disabled = false;
  startBtn.classList.remove('hidden');
  pauseBtn.classList.add('hidden');
};

startBtn.addEventListener('click', () => {
  clickSound.currentTime = 0;  // rewind
  clickSound.play();
  appTimer();
});

pauseBtn.addEventListener('click', () => {
  clickSound.currentTime = 0;
  clickSound.play();
  pauseTimer();
});

resetBtn.addEventListener('click', () => {
  clickSound.currentTime = 0;
  clickSound.play();
  resetTimer();
});
