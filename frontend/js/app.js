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
    activeProfileTab: "history", // "history" | "teacher"
    isStudentMode: false,
    studentName: "",
    pendingSharedQuizId: null,
    sharedQuizData: null,
};


// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════

// Pages that require authentication
const PROTECTED_PAGES = ["config", "attempt", "results", "profile"];
// Pages only for logged-out users
const AUTH_PAGES = ["signin", "signup"];

function navigateTo(page) {
    const isLoggedIn = (typeof auth !== "undefined" && auth && typeof auth.isLoggedIn === "function") ? auth.isLoggedIn() : false;

    // Student mode bypasses auth route guard for attempt & results
    if (state.isStudentMode && (page === "attempt" || page === "results" || page === "loading")) {
        // Allow student
    } else {
        // Route guard: redirect to signin if accessing protected page while logged out
        if (PROTECTED_PAGES.includes(page) && !isLoggedIn) {
            navigateTo("signin");
            return;
        }

        // Route guard: redirect to home if accessing auth pages while logged in
        if (AUTH_PAGES.includes(page) && isLoggedIn) {
            navigateTo("home");
            return;
        }
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

        // Trigger profile loader if navigating to profile
        if (page === "profile") {
            loadUserProfile();
        }
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

    // If in Student Mode, call student submission endpoint
    if (state.isStudentMode) {
        state.lastAction = () => submitQuiz();
        navigateTo("loading");
        document.getElementById("loading-title").textContent = "Submitting your test...";
        document.getElementById("loading-subtitle").textContent = "Evaluating answers and saving your score.";

        try {
            const data = await api.submitSharedQuiz(state.pendingSharedQuizId, state.studentName, answers);
            state.results = {
                score: data.score,
                total: data.total,
                results: data.evaluation_results,
            };
            renderResults(state.results);
            navigateTo("results");
        } catch (err) {
            showError(err.message || "Failed to submit test.");
        }
        return;
    }

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


async function loadUserProfile() {
    const user = auth.getCurrentUser();
    if (!user) return;

    // Render User Details
    const displayName = auth.getDisplayName();
    document.getElementById("profile-name").textContent = displayName;
    document.getElementById("profile-email").textContent = user.email || "";
    document.getElementById("profile-avatar").textContent = displayName.charAt(0).toUpperCase();

    if (state.activeProfileTab === "teacher") {
        loadTeacherSharedQuizzes();
    } else {
        loadUserProfileHistory();
    }
}

function switchProfileTab(tab) {
    state.activeProfileTab = tab;

    const btnHistory = document.getElementById("tab-btn-history");
    const btnTeacher = document.getElementById("tab-btn-teacher");

    if (tab === "teacher") {
        btnHistory.className = "text-sm font-semibold px-3 py-1.5 rounded-card bg-surface-200 text-gray-700 hover:bg-surface-300 transition-colors";
        btnTeacher.className = "text-sm font-semibold px-3 py-1.5 rounded-card bg-primary-600 text-white transition-colors";
        loadTeacherSharedQuizzes();
    } else {
        btnHistory.className = "text-sm font-semibold px-3 py-1.5 rounded-card bg-primary-600 text-white transition-colors";
        btnTeacher.className = "text-sm font-semibold px-3 py-1.5 rounded-card bg-surface-200 text-gray-700 hover:bg-surface-300 transition-colors";
        loadUserProfileHistory();
    }
}

async function loadUserProfileHistory() {
    const container = document.getElementById("profile-attempts-container");
    if (!container) return;
    container.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Loading your quiz history...</p>`;

    try {
        const data = await api.getUserAttempts();
        const attempts = data.attempts || [];

        document.getElementById("profile-total-attempts").textContent = attempts.length;

        if (attempts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-base text-gray-600 font-medium mb-1">No quizzes attempted yet</p>
                    <p class="text-sm text-gray-400 mb-4">Start your first quiz to track your score and view detailed explanations!</p>
                    <button onclick="navigateTo('config')" class="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-4 py-2 rounded-card transition-colors">
                        Take a Quiz Now →
                    </button>
                </div>
            `;
            return;
        }

        // Render Attempt Cards
        container.innerHTML = attempts
            .map((att) => {
                const percent = att.total > 0 ? Math.round((att.score / att.total) * 100) : 0;
                let badgeClass = "bg-red-50 text-danger border-red-200";
                if (percent >= 80) badgeClass = "bg-green-50 text-success border-green-200";
                else if (percent >= 60) badgeClass = "bg-blue-50 text-primary-600 border-blue-200";
                else if (percent >= 40) badgeClass = "bg-amber-50 text-warn border-amber-200";

                const dateStr = att.created_at
                    ? new Date(att.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                      })
                    : "";

                return `
                    <div class="border border-surface-200 rounded-card p-4 hover:border-primary-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-base font-semibold text-gray-900 truncate">${escapeHtml(att.subject)} — ${escapeHtml(att.chapter)}</span>
                            </div>
                            <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span class="tag">${escapeHtml(att.class_level)}</span>
                                <span>·</span>
                                <span>${att.total} Questions</span>
                                <span>·</span>
                                <span>${escapeHtml(att.difficulty)}</span>
                                ${dateStr ? `<span>·</span><span>${dateStr}</span>` : ""}
                            </div>
                        </div>
                        <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            <div class="border px-3 py-1 rounded-card text-center ${badgeClass}">
                                <span class="text-sm font-bold block leading-tight">${att.score} / ${att.total}</span>
                                <span class="text-[10px] font-medium opacity-80">${percent}%</span>
                            </div>
                            <button
                                type="button"
                                onclick="viewPastResponse('${att.id}')"
                                class="bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 text-xs font-semibold px-3 py-2 rounded-card transition-colors shrink-0"
                            >
                                View Response
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");
    } catch (err) {
        container.innerHTML = `
            <p class="text-sm text-danger text-center py-4">Failed to load quiz history. Please refresh or try again.</p>
        `;
    }
}

async function viewPastResponse(attemptId) {
    state.lastAction = () => viewPastResponse(attemptId);
    navigateTo("loading");
    document.getElementById("loading-title").textContent = "Loading quiz response...";
    document.getElementById("loading-subtitle").textContent = "Fetching your saved score and step-by-step explanations.";

    try {
        const attempt = await api.getAttemptById(attemptId);
        if (!attempt || !attempt.evaluation_results) {
            throw new Error("Could not find saved details for this quiz attempt.");
        }

        const data = {
            score: attempt.score,
            total: attempt.total,
            results: attempt.evaluation_results,
        };

        state.results = data;
        renderResults(data);
        navigateTo("results");
    } catch (err) {
        showError(err.message || "Failed to load past quiz response.");
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// TEACHER DASHBOARD & SHARED QUIZZES
// ═══════════════════════════════════════════════════════════════════════════

async function shareCurrentQuiz() {
    if (!state.sessionId && !state.pendingSharedQuizId) {
        showError("No active quiz session found to share.");
        return;
    }

    if (!auth.isLoggedIn()) {
        showError("You must be signed in to share quizzes with students.");
        return;
    }

    try {
        let quizId = state.pendingSharedQuizId;
        if (!quizId && state.sessionId) {
            const data = await api.shareQuiz(state.sessionId);
            quizId = data.shared_quiz_id;
        }

        const shareUrl = `${window.location.origin}${window.location.pathname}?quiz_id=${quizId}`;
        document.getElementById("share-url-input").value = shareUrl;
        document.getElementById("share-copied-msg").classList.add("hidden");

        const modal = document.getElementById("share-modal");
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    } catch (err) {
        showError(err.message || "Failed to generate share link.");
    }
}

function closeShareModal() {
    const modal = document.getElementById("share-modal");
    modal.classList.add("hidden");
    modal.style.display = "";
}

function copyShareUrl() {
    const input = document.getElementById("share-url-input");
    input.select();
    navigator.clipboard.writeText(input.value);

    const msg = document.getElementById("share-copied-msg");
    msg.classList.remove("hidden");
    setTimeout(() => msg.classList.add("hidden"), 3000);
}

async function loadTeacherSharedQuizzes() {
    const container = document.getElementById("profile-attempts-container");
    container.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Loading your shared quizzes...</p>`;

    try {
        const data = await api.getTeacherSharedQuizzes();
        const quizzes = data.shared_quizzes || [];

        if (quizzes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-base text-gray-600 font-medium mb-1">No shared quizzes yet</p>
                    <p class="text-sm text-gray-400 mb-4">Generate any quiz and click "Share Quiz" to share it with your students!</p>
                    <button onclick="navigateTo('config')" class="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-4 py-2 rounded-card transition-colors">
                        Create & Share Quiz →
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = quizzes
            .map((q) => {
                const dateStr = q.created_at
                    ? new Date(q.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                      })
                    : "";

                const shareUrl = `${window.location.origin}${window.location.pathname}?quiz_id=${q.id}`;

                return `
                    <div class="border border-surface-200 rounded-card p-4 hover:border-primary-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-base font-semibold text-gray-900 truncate">${escapeHtml(q.subject)} — ${escapeHtml(q.chapter)}</span>
                            </div>
                            <div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                <span class="tag">${escapeHtml(q.class_level)}</span>
                                <span>·</span>
                                <span>${escapeHtml(q.difficulty)}</span>
                                <span>·</span>
                                <span>${escapeHtml(q.language)}</span>
                                ${dateStr ? `<span>·</span><span>${dateStr}</span>` : ""}
                            </div>
                        </div>
                        <div class="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            <div class="bg-primary-50 border border-primary-200 text-primary-700 px-3 py-1 rounded-card text-center">
                                <span class="text-sm font-bold block leading-tight">${q.submission_count || 0}</span>
                                <span class="text-[10px] font-medium uppercase">Students</span>
                            </div>
                            <button
                                type="button"
                                onclick="copyDirectShareUrl('${shareUrl}')"
                                class="bg-surface-100 hover:bg-surface-200 text-gray-700 border border-surface-300 text-xs font-medium px-3 py-2 rounded-card transition-colors shrink-0"
                            >
                                Copy Link
                            </button>
                            <button
                                type="button"
                                onclick="viewQuizLeaderboard('${q.id}')"
                                class="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-3 py-2 rounded-card transition-colors shrink-0"
                            >
                                View Responses
                            </button>
                        </div>
                    </div>
                `;
            })
            .join("");
    } catch (err) {
        container.innerHTML = `
            <p class="text-sm text-danger text-center py-4">Failed to load shared quizzes. Please try again.</p>
        `;
    }
}

function copyDirectShareUrl(url) {
    navigator.clipboard.writeText(url);
    alert("Shareable link copied to clipboard!");
}

async function viewQuizLeaderboard(quizId) {
    const modal = document.getElementById("responses-modal");
    const container = document.getElementById("responses-list-container");
    container.innerHTML = `<p class="text-sm text-gray-500 text-center py-6">Loading student responses...</p>`;

    modal.classList.remove("hidden");
    modal.style.display = "flex";

    try {
        const data = await api.getQuizResponses(quizId);
        const responses = data.responses || [];

        document.getElementById("responses-modal-title").textContent = `Student Leaderboard (${responses.length})`;

        if (responses.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-sm text-gray-500 mb-2">No students have submitted this test yet.</p>
                    <p class="text-xs text-gray-400">Share the link with your class to see live scores here!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="border border-surface-200 rounded-card overflow-hidden">
                <table class="w-full text-left text-xs border-collapse">
                    <thead class="bg-surface-100 border-b border-surface-200 text-gray-600 uppercase font-semibold">
                        <tr>
                            <th class="p-3">#</th>
                            <th class="p-3">Student Name</th>
                            <th class="p-3">Score</th>
                            <th class="p-3">Percentage</th>
                            <th class="p-3">Submitted At</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-surface-200 bg-white">
                        ${responses
                            .map((r, idx) => {
                                const percent = r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
                                let color = "text-danger";
                                if (percent >= 80) color = "text-success font-bold";
                                else if (percent >= 60) color = "text-primary-600 font-semibold";
                                else if (percent >= 40) color = "text-warn font-semibold";

                                const dateStr = r.submitted_at
                                    ? new Date(r.submitted_at).toLocaleDateString(undefined, {
                                          month: "short",
                                          day: "numeric",
                                          hour: "2-digit",
                                          minute: "2-digit",
                                      })
                                    : "";

                                return `
                                    <tr class="hover:bg-surface-50 transition-colors">
                                        <td class="p-3 font-semibold text-gray-400">${idx + 1}</td>
                                        <td class="p-3 font-semibold text-gray-900">${escapeHtml(r.student_name)}</td>
                                        <td class="p-3 font-bold text-gray-900">${r.score} / ${r.total}</td>
                                        <td class="p-3 ${color}">${percent}%</td>
                                        <td class="p-3 text-gray-500">${dateStr}</td>
                                    </tr>
                                `;
                            })
                            .join("")}
                    </tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<p class="text-sm text-danger text-center py-4">Failed to load student responses.</p>`;
    }
}

function closeResponsesModal() {
    const modal = document.getElementById("responses-modal");
    modal.classList.add("hidden");
    modal.style.display = "";
}

async function checkStudentShareUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get("quiz_id");

    if (quizId) {
        state.isStudentMode = true;
        state.pendingSharedQuizId = quizId;

        try {
            const data = await api.getSharedQuiz(quizId);
            state.sharedQuizData = data;

            document.getElementById("student-modal-title").textContent = `${data.subject} — ${data.chapter}`;
            document.getElementById("student-modal-meta").textContent = `Teacher: ${data.teacher_name} · ${data.class_level} · ${data.questions.length} Qs · ${data.difficulty}`;

            const modal = document.getElementById("student-start-modal");
            modal.classList.remove("hidden");
            modal.style.display = "flex";
        } catch (err) {
            showError("The shared quiz link is invalid or expired.");
        }
    }
}

function startStudentQuiz(event) {
    event.preventDefault();
    const nameInput = document.getElementById("student-name-input");
    const name = (nameInput.value || "").trim();

    if (!name) return;

    state.studentName = name;
    document.getElementById("student-start-modal").classList.add("hidden");
    document.getElementById("student-start-modal").style.display = "";

    state.questions = state.sharedQuizData.questions;
    state.selectedAnswers = {};

    renderQuizAttempt({
        subject: state.sharedQuizData.subject,
        chapter: state.sharedQuizData.chapter,
        class_level: state.sharedQuizData.class_level,
        difficulty: state.sharedQuizData.difficulty,
        num_questions: state.sharedQuizData.questions.length,
        language: state.sharedQuizData.language,
    });

    navigateTo("attempt");
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize auth first
    await auth.init();

    // Check if opening via share link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("quiz_id")) {
        checkStudentShareUrl();
    } else {
        navigateTo("home");
    }
});
