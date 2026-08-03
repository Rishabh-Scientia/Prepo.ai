/**
 * Prepo.ai — Main Application Logic
 * Handles navigation, quiz configuration, attempt, and results.
 * Pure vanilla JavaScript, no frameworks.
 */

// ═══════════════════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════════════════

const state = {
    currentPage: "home",
    sessionId: null,
    questions: [],         // questions from the API (no correct answers)
    selectedAnswers: {},   // { question_id: selected_option }
    selectedDifficulty: "Medium",
    results: null,         // evaluation results from API
    lastAction: null,      // for retry
};


// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

// Pages that require authentication
const PROTECTED_PAGES = ["config", "attempt", "results"];
// Pages only for logged-out users
const AUTH_PAGES = ["signin", "signup"];

function navigateTo(page) {
    // Route guard: redirect to signin if accessing protected page while logged out
    if (PROTECTED_PAGES.includes(page) && !auth.isLoggedIn()) {
        navigateTo("signin");
        return;
    }

    // Route guard: redirect to home if accessing auth pages while logged in
    if (AUTH_PAGES.includes(page) && auth.isLoggedIn()) {
        navigateTo("home");
        return;
    }

    // Hide all pages
    document.querySelectorAll(".page").forEach((el) => {
        el.classList.add("hidden");
    });

    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (target) {
        target.classList.remove("hidden");
        state.currentPage = page;
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// QUIZ CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

function handleClassLevelChange() {
    const select = document.getElementById("class-level");
    const customInput = document.getElementById("class-level-custom");

    if (select.value === "custom") {
        customInput.classList.remove("hidden");
        customInput.focus();
    } else {
        customInput.classList.add("hidden");
        customInput.value = "";
    }
}

function fillSubject(subject) {
    document.getElementById("subject").value = subject;
}

function selectDifficulty(difficulty) {
    state.selectedDifficulty = difficulty;
    document.querySelectorAll(".diff-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === difficulty);
    });
}

function getClassLevel() {
    const select = document.getElementById("class-level");
    if (select.value === "custom") {
        return document.getElementById("class-level-custom").value.trim();
    }
    return select.value;
}

function validateConfig() {
    const errors = [];
    if (!getClassLevel()) errors.push("Class / Grade / Level is required");
    if (!document.getElementById("subject").value.trim()) errors.push("Subject is required");
    if (!document.getElementById("chapter").value.trim()) errors.push("Chapter / Topic is required");
    if (!document.getElementById("num-questions").value) errors.push("Number of questions is required");
    return errors;
}


// ═══════════════════════════════════════════════════════════════════════════
// GENERATE QUIZ
// ═══════════════════════════════════════════════════════════════════════════

async function generateQuiz() {
    // Validate
    const errors = validateConfig();
    const errorEl = document.getElementById("config-error");

    if (errors.length > 0) {
        errorEl.textContent = errors.join(". ") + ".";
        errorEl.classList.remove("hidden");
        return;
    }
    errorEl.classList.add("hidden");

    // Gather config
    const config = {
        class_level: getClassLevel(),
        subject: document.getElementById("subject").value.trim(),
        chapter: document.getElementById("chapter").value.trim(),
        num_questions: parseInt(document.getElementById("num-questions").value, 10),
        language: document.getElementById("language").value,
        difficulty: state.selectedDifficulty,
    };

    // Show loading
    state.lastAction = () => generateQuiz();
    navigateTo("loading");
    document.getElementById("loading-title").textContent = "Generating your quiz...";
    document.getElementById("loading-subtitle").textContent =
        `Creating ${config.num_questions} ${config.difficulty.toLowerCase()} questions on ${config.subject} — ${config.chapter}`;

    try {
        const data = await api.generateQuiz(config);

        state.sessionId = data.session_id;
        state.questions = data.questions;
        state.selectedAnswers = {};
        state.results = null;

        renderQuizAttempt(config);
        navigateTo("attempt");
    } catch (err) {
        showError(err.message || "Failed to generate quiz. Please try again.");
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// QUIZ ATTEMPT — RENDERING
// ═══════════════════════════════════════════════════════════════════════════

function renderQuizAttempt(config) {
    const container = document.getElementById("questions-container");
    const navGrid = document.getElementById("nav-grid");

    // Set title/meta
    document.getElementById("attempt-title").textContent =
        `${config.subject} — ${config.chapter}`;
    document.getElementById("attempt-meta").textContent =
        `${config.class_level} · ${config.num_questions} Questions · ${config.difficulty} · ${config.language}`;

    // Total counts
    const totalEls = ["total-count", "total-count-bottom"];
    totalEls.forEach((id) => {
        document.getElementById(id).textContent = state.questions.length;
    });

    // Render question cards
    const letters = ["A", "B", "C", "D"];
    container.innerHTML = state.questions
        .map((q, idx) => {
            const diffClass = q.difficulty ? q.difficulty.toLowerCase() : "medium";
            return `
                <div class="question-card" id="card-${q.id}">
                    <div class="q-header">
                        <span class="q-number">Q${idx + 1}</span>
                        <span class="q-difficulty ${diffClass}">${q.difficulty || "medium"}</span>
                    </div>
                    <div class="q-body">
                        <p class="q-text">${escapeHtml(q.question)}</p>
                        <div class="options-list">
                            ${q.options
                                .map(
                                    (opt, oi) => `
                                <button
                                    type="button"
                                    class="option-btn"
                                    id="opt-${q.id}-${oi}"
                                    onclick="selectOption('${q.id}', ${oi})"
                                >
                                    <span class="option-letter">${letters[oi]}</span>
                                    <span class="option-text">${escapeHtml(opt)}</span>
                                </button>
                            `
                                )
                                .join("")}
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");

    // Render navigation grid
    navGrid.innerHTML = state.questions
        .map(
            (q, idx) => `
            <button class="nav-btn" id="nav-${q.id}" onclick="scrollToQuestion('${q.id}')" title="Question ${idx + 1}">
                ${idx + 1}
            </button>
        `
        )
        .join("");

    // Show navigator on desktop
    document.getElementById("question-nav").classList.remove("hidden");

    updateAnsweredCount();
}

function selectOption(questionId, optionIndex) {
    const question = state.questions.find((q) => q.id === questionId);
    if (!question) return;

    const selected = question.options[optionIndex];
    state.selectedAnswers[questionId] = selected;

    // Update UI — highlight selected, unhighlight others
    question.options.forEach((_, oi) => {
        const btn = document.getElementById(`opt-${questionId}-${oi}`);
        btn.classList.toggle("selected", oi === optionIndex);
    });

    // Update nav button
    const navBtn = document.getElementById(`nav-${questionId}`);
    if (navBtn) navBtn.classList.add("answered");

    updateAnsweredCount();
}

function scrollToQuestion(questionId) {
    const card = document.getElementById(`card-${questionId}`);
    if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function updateAnsweredCount() {
    const count = Object.keys(state.selectedAnswers).length;
    const ids = ["answered-count", "answered-count-bottom"];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });
}


// ═══════════════════════════════════════════════════════════════════════════
// SUBMIT QUIZ
// ═══════════════════════════════════════════════════════════════════════════

async function submitQuiz() {
    const answeredCount = Object.keys(state.selectedAnswers).length;
    const totalCount = state.questions.length;

    // Confirm if not all answered
    if (answeredCount < totalCount) {
        const proceed = confirm(
            `You've answered ${answeredCount} of ${totalCount} questions. Unanswered questions will be marked incorrect.\n\nSubmit anyway?`
        );
        if (!proceed) return;
    }

    // Build answers array — include all questions (unanswered get empty string)
    const answers = state.questions.map((q) => ({
        question_id: q.id,
        selected_option: state.selectedAnswers[q.id] || "",
    }));

    // Show loading
    state.lastAction = () => submitQuiz();
    navigateTo("loading");
    document.getElementById("loading-title").textContent = "Evaluating your answers...";
    document.getElementById("loading-subtitle").textContent =
        "Scoring and generating detailed explanations for each question.";

    try {
        const data = await api.evaluateQuiz(state.sessionId, answers);

        state.results = data;
        renderResults(data);
        navigateTo("results");
    } catch (err) {
        showError(err.message || "Failed to evaluate quiz. Please try again.");
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// RESULTS — RENDERING
// ═══════════════════════════════════════════════════════════════════════════

function renderResults(data) {
    const { score, total, results } = data;

    // Score display
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    const scoreDisplay = document.getElementById("score-display");
    scoreDisplay.textContent = `${score} / ${total}`;

    // Color based on percentage
    let scoreClass = "score-poor";
    if (percent >= 80) scoreClass = "score-excellent";
    else if (percent >= 60) scoreClass = "score-good";
    else if (percent >= 40) scoreClass = "score-average";
    scoreDisplay.className = `text-4xl font-bold m-0 ${scoreClass}`;

    const scorePercent = document.getElementById("score-percent");
    scorePercent.textContent = `${percent}% correct`;
    scorePercent.className = `text-sm mt-2 m-0 ${scoreClass}`;

    // Render each result card
    const container = document.getElementById("results-container");
    container.innerHTML = results
        .map((r, idx) => {
            const isCorrect = r.is_correct;
            const cardClass = isCorrect ? "correct" : "incorrect";
            const statusText = isCorrect ? "Correct" : "Incorrect";
            const exp = r.explanation || {};

            return `
                <div class="result-card ${cardClass}" id="result-${r.question_id}">
                    <div class="r-header" onclick="toggleResult('${r.question_id}')">
                        <div class="r-header-left">
                            <span class="q-number">Q${idx + 1}</span>
                            <span class="r-status">${statusText}</span>
                            <span class="r-question-preview">${escapeHtml(truncate(r.question_text, 80))}</span>
                        </div>
                        <span class="r-toggle" id="toggle-${r.question_id}">▼</span>
                    </div>
                    <div class="r-body" id="body-${r.question_id}">
                        <!-- Full question -->
                        <p class="q-text" style="margin-top:14px">${escapeHtml(r.question_text)}</p>

                        <!-- Answer badges -->
                        <div class="result-answer-row">
                            <span class="result-answer-badge ${isCorrect ? "your-answer was-correct" : "your-answer"}">
                                Your answer: ${escapeHtml(r.selected_option || "(no answer)")}
                            </span>
                            ${
                                !isCorrect
                                    ? `<span class="result-answer-badge correct-answer">Correct: ${escapeHtml(r.correct_answer)}</span>`
                                    : ""
                            }
                        </div>

                        <!-- Options review -->
                        <div style="margin-top:12px">
                            ${(r.options || [])
                                .map((opt, oi) => {
                                    const letters = ["A", "B", "C", "D"];
                                    let borderStyle = "border: 1px solid #ebedf0;";
                                    if (opt === r.correct_answer) borderStyle = "border: 1px solid #bbf7d0; background: #f0fdf4;";
                                    else if (opt === r.selected_option && !isCorrect) borderStyle = "border: 1px solid #fecaca; background: #fef2f2;";
                                    return `<div style="padding:8px 12px;border-radius:4px;margin-bottom:4px;font-size:0.875rem;${borderStyle}">
                                        <strong style="color:#6b7280;margin-right:8px;">${letters[oi]}.</strong> ${escapeHtml(opt)}
                                        ${opt === r.correct_answer ? '<span style="color:#16a34a;font-size:0.75rem;margin-left:6px;">✓ Correct</span>' : ""}
                                        ${opt === r.selected_option && !isCorrect ? '<span style="color:#dc2626;font-size:0.75rem;margin-left:6px;">✗ Your answer</span>' : ""}
                                    </div>`;
                                })
                                .join("")}
                        </div>

                        <!-- Explanation -->
                        <div class="explanation-section">
                            <h4>Verdict</h4>
                            <p>${escapeHtml(exp.confirmation || "")}</p>

                            <h4>Core Concept</h4>
                            <p>${escapeHtml(exp.core_concept || "")}</p>

                            <h4>Step-by-Step Reasoning</h4>
                            <p>${escapeHtml(exp.reasoning || "")}</p>

                            <h4>${isCorrect ? "Common Mistake Others Make" : "Why Your Answer Was Wrong"}</h4>
                            <p>${escapeHtml(exp.why_incorrect_option_wrong || "")}</p>
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
}

function toggleResult(questionId) {
    const body = document.getElementById(`body-${questionId}`);
    const toggle = document.getElementById(`toggle-${questionId}`);

    body.classList.toggle("open");
    toggle.classList.toggle("open");
}


// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

function showError(message) {
    document.getElementById("error-message").textContent = message;
    const modal = document.getElementById("error-modal");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

function closeErrorModal() {
    const modal = document.getElementById("error-modal");
    modal.classList.add("hidden");
    modal.style.display = "";
    // Go back to config page
    navigateTo("config");
}

function retryLastAction() {
    closeErrorModal();
    if (state.lastAction) {
        state.lastAction();
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

function escapeHtml(str) {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function truncate(str, maxLen) {
    if (!str) return "";
    return str.length > maxLen ? str.slice(0, maxLen) + "…" : str;
}


// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize auth first, then navigate
    await auth.init();
    navigateTo("home");
});
