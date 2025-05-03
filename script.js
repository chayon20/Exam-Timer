// --- DOM Elements ---
const hoursInput = document.getElementById('hours');
const minutesInput = document.getElementById('minutes');
const secondsInput = document.getElementById('seconds');
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const statusDiv = document.getElementById('status');
const alarmSound = document.getElementById('alarmSound');
const dateDisplay = document.getElementById('date-display');
const hourHand = document.getElementById('hourHand');
const minuteHand = document.getElementById('minuteHand');
const secondHand = document.getElementById('secondHand');

// --- Timer State ---
let timerInterval = null;
let totalSeconds = 0;
let remainingSeconds = 0;
let isPaused = false;

// --- Event Listeners ---
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// --- Core Timer Functions ---
function startTimer() {
    if (timerInterval !== null && !isPaused) return; // Prevent multiple starts

    if (isPaused) {
        resumeTimer();
    } else {
        const hours = parseInt(hoursInput.value) || 0;
        const minutes = parseInt(minutesInput.value) || 0;
        const seconds = parseInt(secondsInput.value) || 0;
        totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

        if (totalSeconds <= 0) {
            alert("Please set a duration greater than 0 seconds.");
            return;
        }
        remainingSeconds = totalSeconds;
        updateTimerDisplay();
        startCountdown();
    }

    toggleInputFields(true); // Disable time inputs
    startBtn.disabled = true;
    startBtn.textContent = "Start"; // Reset text in case it was 'Resume'
    pauseBtn.disabled = false;
    resetBtn.disabled = false;
    isPaused = false;
    statusDiv.textContent = "Running...";
    display.classList.remove('time-up');
}

function startCountdown() {
    clearInterval(timerInterval); // Clear any residual interval
    timerInterval = setInterval(() => {
        remainingSeconds--;
        updateTimerDisplay();
        if (remainingSeconds <= 0) {
            timesUp();
        }
    }, 1000);
}

function pauseTimer() {
    if (timerInterval !== null && !isPaused) {
        clearInterval(timerInterval);
        isPaused = true;
        startBtn.disabled = false; // Re-enable start to act as Resume
        startBtn.textContent = "Resume"; // Indicate resume action
        pauseBtn.disabled = true;
        statusDiv.textContent = "Paused";
    }
}

function resumeTimer() {
    if (isPaused) {
        isPaused = false;
        startBtn.disabled = true;
        startBtn.textContent = "Start"; // Change back button text
        pauseBtn.disabled = false;
        statusDiv.textContent = "Running...";
        startCountdown(); // Restart the interval
    }
}

function resetTimer() {
    clearInterval(timerInterval); // Stop countdown
    timerInterval = null;
    isPaused = false;
    totalSeconds = 0;
    remainingSeconds = 0;

    // Reset display to show the current input values formatted
    const h = parseInt(hoursInput.value) || 0;
    const m = parseInt(minutesInput.value) || 0;
    const s = parseInt(secondsInput.value) || 0;
    display.textContent = formatTime(h, m, s);

    toggleInputFields(false); // Re-enable time inputs
    startBtn.disabled = false;
    startBtn.textContent = "Start";
    pauseBtn.disabled = true;
    resetBtn.disabled = true; // Disable reset until timer starts
    statusDiv.textContent = "";
    display.classList.remove('time-up'); // Remove time's up styling

    // Stop and reset alarm sound if it was playing
    alarmSound.pause();
    alarmSound.currentTime = 0;
}

function updateTimerDisplay() {
    const h = Math.floor(remainingSeconds / 3600);
    const m = Math.floor((remainingSeconds % 3600) / 60);
    const s = remainingSeconds % 60;
    display.textContent = formatTime(h, m, s);
}

function formatTime(hours, minutes, seconds) {
    const hStr = String(hours).padStart(2, '0');
    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    return `${hStr}:${mStr}:${sStr}`;
}

function toggleInputFields(disable) {
    hoursInput.disabled = disable;
    minutesInput.disabled = disable;
    secondsInput.disabled = disable;
}

function timesUp() {
    clearInterval(timerInterval);
    timerInterval = null;
    isPaused = false; // Reset paused state
    statusDiv.textContent = "Time's Up!";
    display.textContent = "00:00:00";
    display.classList.add('time-up'); // Add visual alert class

    // Attempt to play alarm sound
    alarmSound.play().catch(error => {
        // Handle browsers blocking autoplay
        console.warn("Alarm sound autoplay prevented:", error);
        statusDiv.textContent = "Time's Up! (Enable sound autoplay if needed)";
    });

    // Update button states for restarting
    startBtn.disabled = false;
    startBtn.textContent = "Start";
    pauseBtn.disabled = true;
    resetBtn.disabled = false; // Allow reset after time's up
    toggleInputFields(false); // Re-enable time inputs
}


// --- Analog Clock and Date Functions ---

function updateClockAndDate() {
    const now = new Date();

    // Update Analog Clock
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // Calculate degrees (adjusting for smooth movement)
    const secondsDegrees = seconds * 6; // 360/60 = 6
    const minutesDegrees = minutes * 6 + seconds * 0.1; // 6 deg/min + 0.1 deg/sec
    const hoursDegrees = (hours % 12) * 30 + minutes * 0.5; // 30 deg/hr + 0.5 deg/min

    // Apply rotation (translateX ensures base stays centered)
    secondHand.style.transform = `translateX(-50%) rotate(${secondsDegrees}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minutesDegrees}deg)`;
    hourHand.style.transform = `translateX(-50%) rotate(${hoursDegrees}deg)`;

    // Update Date Display
    // Using Intl.DateTimeFormat for better control and locale support
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    try {
        // Using 'en-US' as an example, replace with desired locale or undefined for default
        dateDisplay.textContent = new Intl.DateTimeFormat('en-US', options).format(now);
    } catch (e) {
        // Fallback for older browsers or locale issues
        dateDisplay.textContent = now.toDateString();
        console.error("Could not format date using Intl:", e);
    }
}

// --- Initial Setup ---
function initialize() {
    // Set initial timer display based on default inputs
    const initialH = parseInt(hoursInput.value) || 0;
    const initialM = parseInt(minutesInput.value) || 0;
    const initialS = parseInt(secondsInput.value) || 0;
    display.textContent = formatTime(initialH, initialM, initialS);

    // Set initial clock and date immediately
    updateClockAndDate();

    // Start the interval to update clock/date every second
    setInterval(updateClockAndDate, 1000);
}

// Run initialization function once the script is loaded
initialize();