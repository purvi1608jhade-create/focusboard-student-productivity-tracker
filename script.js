
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const priorityInput = document.getElementById("priority");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");

const taskDueDate = document.getElementById("taskDueDate");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const filterButtons = document.querySelectorAll(".filter-btn");
const progressPercent = document.getElementById("progressPercent");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
let currentFilter = "all";
// Load saved tasks, or start with an empty array.
let tasks = [];

try {
    const savedTasks = JSON.parse(
        localStorage.getItem("studentTasks")
    );

    if (Array.isArray(savedTasks)) {
        tasks = savedTasks.filter(task =>
            task &&
            typeof task.id === "string" &&
            typeof task.title === "string" &&
            typeof task.completed === "boolean" &&
            ["Low", "Medium", "High"].includes(task.priority)
        );
    }
} catch (error) {
    tasks = [];
}

// Save tasks in the browser.
function saveTasks() {
    localStorage.setItem("studentTasks", JSON.stringify(tasks));
}

// Display tasks on the page.

function renderTasks() {
    taskList.replaceChildren();

    // Show only tasks matching the selected filter.
    const visibleTasks = tasks.filter(function(task) {
        if (currentFilter === "pending") {
            return !task.completed;
        }

        if (currentFilter === "completed") {
            return task.completed;
        }

        return true;
    });

    visibleTasks.forEach(function(task) {
        const li = document.createElement("li");
        li.className = "task-item";

        if (task.completed) {
            li.classList.add("completed");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.setAttribute(
            "aria-label",
            "Mark " + task.title + " as completed"
        );

        checkbox.addEventListener("change", function() {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const details = document.createElement("div");
        details.className = "task-details";

        const title = document.createElement("span");
        title.className = "task-title";
        title.textContent = task.title;

        
const priority = document.createElement("span");
priority.className = "priority-label";
priority.textContent = task.priority + " Priority";
priority.classList.add(
    "priority-" + task.priority.toLowerCase()
);
details.append(title, priority);

// Display the due date, if one was selected.
if (task.dueDate) {
    const dueDate = document.createElement("span");
    dueDate.className = "due-date";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(task.dueDate + "T00:00:00");

    dueDate.textContent =
        "Due: " + deadline.toLocaleDateString();

    if (!task.completed && deadline < today) {
        dueDate.textContent += " — OVERDUE!";
        dueDate.classList.add("overdue");
    }

    details.appendChild(dueDate);
}


        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.textContent = "Delete";
        deleteButton.setAttribute(
            "aria-label",
            "Delete " + task.title
        );

        deleteButton.addEventListener("click", function() {
            tasks = tasks.filter(function(item) {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks();
        });

        li.append(checkbox, details, deleteButton);
        taskList.appendChild(li);
    });

    // Counters always show totals for ALL tasks.
    const completed = tasks.filter(
        task => task.completed
    ).length;

    totalTasks.textContent = tasks.length;
    completedTasks.textContent = completed;
    pendingTasks.textContent = tasks.length - completed;
// Calculate overall completion percentage.
const percentage = tasks.length === 0
    ? 0
    : Math.round((completed / tasks.length) * 100);

// Update the progress bar and labels.
progressPercent.textContent = percentage + "%";
progressFill.style.width = percentage + "%";

progressText.textContent =
    completed + " of " + tasks.length + " tasks completed";

progressBar.setAttribute("aria-valuenow", percentage);
    // Display the correct empty-state message.
    if (visibleTasks.length === 0) {
        if (tasks.length === 0) {
            emptyMessage.textContent =
                "No tasks yet. Add your first task!";
        } else if (currentFilter === "pending") {
            emptyMessage.textContent =
                "No pending tasks. Great job!";
        } else if (currentFilter === "completed") {
            emptyMessage.textContent =
                "No completed tasks yet.";
        }

        emptyMessage.hidden = false;
    } else {
        emptyMessage.hidden = true;
    }
}

// Add a new task.
taskForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) {
        return;
    }

    const newTask = {
        id: crypto.randomUUID(),
        title: title,
        priority: priorityInput.value,
        dueDate: taskDueDate.value,
        completed: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();

    taskForm.reset();
    priorityInput.value = "Medium";
    taskInput.focus();
});


 // Handle filter button clicks.
filterButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        currentFilter = button.dataset.filter;

        // Highlight the selected button.
        filterButtons.forEach(function(btn) {
            const isActive = btn === button;

            btn.classList.toggle("active", isActive);
            btn.setAttribute("aria-pressed", String(isActive));
        });

        renderTasks();
    });
});

// Show saved tasks when the page opens.
renderTasks();


/* Pomodoro Study Timer */

const timerDisplay = document.getElementById("timerDisplay");
const timerMode = document.getElementById("timerMode");
const startTimerButton = document.getElementById("startTimer");
const pauseTimerButton = document.getElementById("pauseTimer");
const resetTimerButton = document.getElementById("resetTimer");
const switchTimerButton = document.getElementById("switchTimer");

const STUDY_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

let timeLeft = STUDY_TIME;
let isRunning = false;
let isBreak = false;
let timerInterval = null;

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
}


function startCountdown() {
    if (isRunning) return;

    isRunning = true;

    timerInterval = setInterval(function() {
        if (timeLeft > 0) {
            timeLeft--;

            // Count time only during study sessions
            if (!isBreak) {
                studySeconds++;
                updateStudyGoalDisplay();
            }

            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
            timerInterval = null;
            isRunning = false;

            alert(
                isBreak
                    ? "Break finished! Ready to study?"
                    : "Study session finished! Time for a break."
            );
        }
    }, 1000);
}


startTimerButton.addEventListener("click", startCountdown);

pauseTimerButton.addEventListener("click", function() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
});

resetTimerButton.addEventListener("click", function() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;
    timeLeft = isBreak ? BREAK_TIME : STUDY_TIME;
    updateTimerDisplay();
});

switchTimerButton.addEventListener("click", function() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    isBreak = !isBreak;
    timeLeft = isBreak ? BREAK_TIME : STUDY_TIME;

    timerMode.textContent = isBreak ? "Break Time" : "Study Time";
    switchTimerButton.textContent = isBreak
        ? "Switch to Study"
        : "Switch to Break";

    updateTimerDisplay();
});

updateTimerDisplay();

console.log("Pomodoro timer JavaScript loaded!");


/* Dark mode toggle */
const themeToggle = document.getElementById("themeToggle");

// Restore the saved theme
if (localStorage.getItem("focusBoardTheme") === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.textContent = "☀️ Light Mode";
}

themeToggle.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    themeToggle.textContent = isDark
        ? "☀️ Light Mode"
        : "🌙 Dark Mode";

    localStorage.setItem(
        "focusBoardTheme",
        isDark ? "dark" : "light"
    );
});


/* ===== Daily Study Goal and Study-Time Tracking ===== */

const dailyGoalHours = document.getElementById("dailyGoalHours");
const saveStudyGoalButton = document.getElementById("saveStudyGoal");
const studyTimeText = document.getElementById("studyTimeText");
const studyGoalProgress = document.getElementById("studyGoalProgress");
const studyGoalStatus = document.getElementById("studyGoalStatus");

// Get today's date in local time
function getTodayKey() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// Load today's saved study time
let studyDate = getTodayKey();
let studySeconds = Number(
    localStorage.getItem("focusBoardStudyDate") === studyDate
        ? localStorage.getItem("focusBoardStudySeconds") || 0
        : 0
);

// Load the saved daily goal
const savedGoal = localStorage.getItem("focusBoardDailyGoal");

if (savedGoal !== null) {
    dailyGoalHours.value = savedGoal;
}

function updateStudyGoalDisplay() {
    // Reset the daily total when the date changes
    if (studyDate !== getTodayKey()) {
        studyDate = getTodayKey();
        studySeconds = 0;

        localStorage.setItem("focusBoardStudyDate", studyDate);
        localStorage.setItem("focusBoardStudySeconds", "0");
    }

    const goalHours = Number(dailyGoalHours.value) || 2;
    const goalSeconds = goalHours * 60 * 60;
    const minutes = Math.floor(studySeconds / 60);

    const hoursPart = Math.floor(minutes / 60);
    const minutesPart = minutes % 60;

    studyTimeText.textContent = hoursPart > 0
        ? `Studied ${hoursPart} hr ${minutesPart} min today`
        : `Studied ${minutes} minutes today`;

    const percentage = goalSeconds > 0
        ? Math.min(100, Math.floor(studySeconds / goalSeconds * 100))
        : 0;

    studyGoalProgress.style.width = percentage + "%";
    studyGoalStatus.textContent =
        `${percentage}% of your daily goal completed`;

    localStorage.setItem("focusBoardStudyDate", studyDate);
    localStorage.setItem("focusBoardStudySeconds", String(studySeconds));
    // Save today's time for the 7-day history
localStorage.setItem(
    "focusBoardHistory_" + studyDate,
    String(studySeconds)
);

// Refresh the history chart
renderStudyHistory();
}

saveStudyGoalButton.addEventListener("click", function () {
    const goal = Number(dailyGoalHours.value);

    if (!Number.isFinite(goal) || goal < 0.5 || goal > 24) {
        alert("Please enter a daily goal between 0.5 and 24 hours.");
        return;
    }

    localStorage.setItem("focusBoardDailyGoal", String(goal));
    updateStudyGoalDisplay();
});



/* ===== 7-Day Study History ===== */

function renderStudyHistory() {
    const historyContainer = document.getElementById("studyHistory");

    if (!historyContainer) return;

    historyContainer.replaceChildren();

    const days = [];
    const today = new Date();

    // Get the last 7 days, including today
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const key = `${year}-${month}-${day}`;

        const seconds = Number(
            localStorage.getItem("focusBoardHistory_" + key) || 0
        );

        days.push({
            label: date.toLocaleDateString("en-IN", {
                weekday: "short"
            }),
            seconds: seconds
        });
    }

    const maxSeconds = Math.max(
        60,
        ...days.map(day => day.seconds)
    );

    days.forEach(function(day) {
        const column = document.createElement("div");
        column.className = "study-day";

        const barArea = document.createElement("div");
        barArea.className = "study-day-bar-area";

        const minutes = Math.floor(day.seconds / 60);

        const timeLabel = document.createElement("div");
        timeLabel.className = "study-day-time";
        timeLabel.textContent = minutes >= 60
            ? `${Math.floor(minutes / 60)}h ${minutes % 60}m`
            : `${minutes}m`;

        const bar = document.createElement("div");
        bar.className = "study-day-bar";

        const height = day.seconds > 0
            ? Math.max(5, (day.seconds / maxSeconds) * 100)
            : 4;

        bar.style.height = `${height}%`;

        const dayLabel = document.createElement("div");
        dayLabel.className = "study-day-label";
        dayLabel.textContent = day.label;

        barArea.append(timeLabel, bar);
        column.append(barArea, dayLabel);
        historyContainer.appendChild(column);
    });
}
// Initial display after all functions are defined
updateStudyGoalDisplay();