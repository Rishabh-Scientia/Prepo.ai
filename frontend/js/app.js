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
    activeQuizConfig: null, // metadata for current quiz attempt
    selectedDifficulty: "Medium",
    selectedDocDifficulty: "Medium",
    selectedDocFile: null,
    configMode: "topic",   // "topic" | "doc"
    results: null,         // evaluation results from API
    lastAction: null,      // for retry
    activeProfileTab: "history", // "history" | "teacher"
    isStudentMode: false,
    studentName: "",
    pendingSharedQuizId: null,
    sharedQuizData: null,
    userCredits: 3,
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

        // Show footer ONLY on home page
        const footer = document.getElementById("main-footer");
        if (footer) {
            if (page === "home") {
                footer.classList.remove("hidden");
            } else {
                footer.classList.add("hidden");
            }
        }

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
// SESSION STATE PERSISTENCE (PREVENTS DATA LOSS ON REFRESH)
// ═══════════════════════════════════════════════════════════════════════════

const ACTIVE_SESSION_STORAGE_KEY = "prepo_active_session_state";

function saveSessionState() {
    if (state.currentPage === "attempt" && state.questions && state.questions.length > 0) {
        const payload = {
            currentPage: "attempt",
            sessionId: state.sessionId,
            questions: state.questions,
            selectedAnswers: state.selectedAnswers || {},
            activeQuizConfig: state.activeQuizConfig || null,
            isStudentMode: state.isStudentMode || false,
            studentName: state.studentName || "",
            pendingSharedQuizId: state.pendingSharedQuizId || null,
            timestamp: Date.now(),
        };
        sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(payload));
    } else if (state.currentPage === "results" && state.results) {
        const payload = {
            currentPage: "results",
            sessionId: state.sessionId,
            results: state.results,
            activeQuizConfig: state.activeQuizConfig || null,
            timestamp: Date.now(),
        };
        sessionStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(payload));
    }
}

function clearSessionState() {
    sessionStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
}

function restoreSessionState() {
    try {
        const raw = sessionStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
        if (!raw) return false;
        const payload = JSON.parse(raw);

        // Expire session after 12 hours
        if (Date.now() - (payload.timestamp || 0) > 12 * 60 * 60 * 1000) {
            clearSessionState();
            return false;
        }

        if (payload.currentPage === "attempt" && Array.isArray(payload.questions) && payload.questions.length > 0) {
            state.sessionId = payload.sessionId;
            state.questions = payload.questions;
            state.selectedAnswers = payload.selectedAnswers || {};
            state.activeQuizConfig = payload.activeQuizConfig;
            state.isStudentMode = payload.isStudentMode || false;
            state.studentName = payload.studentName || "";
            state.pendingSharedQuizId = payload.pendingSharedQuizId || null;

            if (payload.activeQuizConfig) {
                renderQuizAttempt(payload.activeQuizConfig);
            }

            // Restore highlighted options and navigation state in UI
            if (state.selectedAnswers) {
                Object.entries(state.selectedAnswers).forEach(([qid, ans]) => {
                    const question = state.questions.find((q) => q.id === qid);
                    if (question) {
                        const optIdx = question.options.indexOf(ans);
                        if (optIdx !== -1) {
                            const btn = document.getElementById(`opt-${qid}-${optIdx}`);
                            if (btn) btn.classList.add("selected");
                            const navBtn = document.getElementById(`nav-${qid}`);
                            if (navBtn) navBtn.classList.add("answered");
                        }
                    }
                });
                updateAnsweredCount();
            }

            navigateTo("attempt");
            return true;
        } else if (payload.currentPage === "results" && payload.results) {
            state.sessionId = payload.sessionId;
            state.results = payload.results;
            state.activeQuizConfig = payload.activeQuizConfig;
            renderResults(payload.results);
            navigateTo("results");
            return true;
        }
    } catch (e) {
        console.error("Error restoring session state:", e);
        clearSessionState();
    }
    return false;
}


// ═══════════════════════════════════════════════════════════════════════════
// GENERATE QUIZ
// ═══════════════════════════════════════════════════════════════════════════

async function generateQuiz() {
    // Check credits first
    if (state.userCredits <= 0) {
        showCreditLimitModal();
        return;
    }

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
        state.activeQuizConfig = config;

        // Refresh user credits
        refreshUserCredits();

        renderQuizAttempt(config);
        navigateTo("attempt");
        saveSessionState();
    } catch (err) {
        console.error("Quiz generation error:", err);
        navigateTo("config");
        showError(err.message || "Failed to generate quiz. Please provide a valid subject and topic.");
    }
}



// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT UPLOAD QUIZ GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function switchConfigMode(mode) {
    state.configMode = mode;
    const topicTab = document.getElementById("tab-mode-topic");
    const docTab = document.getElementById("tab-mode-doc");
    const topicForm = document.getElementById("quiz-config-form");
    const docForm = document.getElementById("doc-quiz-config-form");

    if (mode === "doc") {
        if (topicForm) topicForm.classList.add("hidden");
        if (docForm) docForm.classList.remove("hidden");
        if (topicTab) {
            topicTab.className = "text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-card transition-all cursor-pointer";
        }
        if (docTab) {
            docTab.className = "text-xs font-semibold px-3 py-1.5 rounded-card transition-all cursor-pointer bg-primary-600 text-white shadow-xs";
        }
    } else {
        if (docForm) docForm.classList.add("hidden");
        if (topicForm) topicForm.classList.remove("hidden");
        if (docTab) {
            docTab.className = "text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-card transition-all cursor-pointer";
        }
        if (topicTab) {
            topicTab.className = "text-xs font-semibold px-3 py-1.5 rounded-card transition-all cursor-pointer bg-primary-600 text-white shadow-xs";
        }
    }
}

function selectDocDifficulty(difficulty) {
    state.selectedDocDifficulty = difficulty;
    document.querySelectorAll(".doc-diff-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === difficulty);
    });
}

function handleDocFileSelect(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    // Validate extension
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "docx", "doc", "txt"].includes(ext)) {
        showError("Invalid file format. Please upload a PDF (.pdf), Word document (.docx), or Text file (.txt).");
        return;
    }

    // Validate size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
        showError("File size exceeds 20MB limit. Please upload a smaller document.");
        return;
    }

    state.selectedDocFile = file;

    // Format file size
    const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const emptyEl = document.getElementById("dropzone-empty");
    const selectedEl = document.getElementById("dropzone-selected");
    const nameEl = document.getElementById("selected-doc-name");
    const sizeEl = document.getElementById("selected-doc-size");

    if (nameEl) nameEl.textContent = file.name;
    if (sizeEl) sizeEl.textContent = sizeStr;

    if (emptyEl) emptyEl.classList.add("hidden");
    if (selectedEl) {
        selectedEl.classList.remove("hidden");
        selectedEl.classList.add("flex");
    }

    // Auto-fill subject placeholder if empty
    const subjectInput = document.getElementById("doc-subject");
    if (subjectInput && !subjectInput.value.trim()) {
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        subjectInput.placeholder = baseName;
    }
}

function removeSelectedDoc() {
    state.selectedDocFile = null;
    const input = document.getElementById("doc-file-input");
    if (input) input.value = "";

    const emptyEl = document.getElementById("dropzone-empty");
    const selectedEl = document.getElementById("dropzone-selected");

    if (selectedEl) {
        selectedEl.classList.add("hidden");
        selectedEl.classList.remove("flex");
    }
    if (emptyEl) emptyEl.classList.remove("hidden");

    const subjectInput = document.getElementById("doc-subject");
    if (subjectInput) subjectInput.placeholder = "Auto-detected from file name if left blank";
}

async function generateDocQuiz() {
    // Check credits first
    if (state.userCredits <= 0) {
        showCreditLimitModal();
        return;
    }

    const errorEl = document.getElementById("doc-config-error");
    if (errorEl) errorEl.classList.add("hidden");

    if (!state.selectedDocFile) {
        if (errorEl) {
            errorEl.textContent = "Please select or upload a study document (PDF, DOCX, or TXT).";
            errorEl.classList.remove("hidden");
        }
        return;
    }

    const file = state.selectedDocFile;
    const numQuestions = parseInt(document.getElementById("doc-num-questions").value || "10", 10);
    const language = document.getElementById("doc-language").value || "English";
    const difficulty = state.selectedDocDifficulty || "Medium";
    const customSubject = (document.getElementById("doc-subject").value || "").trim();
    const docSubject = customSubject || file.name.replace(/\.[^/.]+$/, "");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("num_questions", numQuestions);
    formData.append("language", language);
    formData.append("difficulty", difficulty);
    if (customSubject) {
        formData.append("subject", customSubject);
    }

    // Show loading screen
    state.lastAction = () => generateDocQuiz();
    navigateTo("loading");
    document.getElementById("loading-title").textContent = "Analyzing document & generating quiz...";
    document.getElementById("loading-subtitle").textContent =
        `Creating ${numQuestions} ${difficulty.toLowerCase()} questions grounded strictly in ${file.name}`;

    try {
        const data = await api.generateQuizFromDoc(formData);

        const quizConfig = {
            subject: `📄 ${docSubject}`,
            chapter: "Document Quiz",
            class_level: "Study Doc",
            num_questions: numQuestions,
            language: language,
            difficulty: difficulty,
        };

        state.sessionId = data.session_id;
        state.questions = data.questions;
        state.selectedAnswers = {};
        state.results = null;
        state.activeQuizConfig = quizConfig;

        // Refresh user credits
        refreshUserCredits();

        renderQuizAttempt(quizConfig);
        navigateTo("attempt");
        saveSessionState();
    } catch (err) {
        console.error("Document quiz error:", err);
        navigateTo("config");
        showError(err.message || "Failed to generate quiz from document.");
    }
}

function setupDocDropzone() {
    const dropzone = document.getElementById("doc-dropzone");
    if (!dropzone) return;

    ["dragenter", "dragover"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("border-primary-600", "bg-primary-100/50");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("border-primary-600", "bg-primary-100/50");
        });
    });

    dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            handleDocFileSelect({ target: { files: [files[0]] } });
        }
    });
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


// ═══════════════════════════════════════════════════════════════════════════
// QUIZ PDF EXPORT (QUESTION PAPER ONLY — NO ANSWERS)
// ═══════════════════════════════════════════════════════════════════════════

async function downloadQuizPdf() {
    if (!state.questions || state.questions.length === 0) {
        showError("No active quiz questions found to download.");
        return;
    }

    const config = state.activeQuizConfig || {
        subject: document.getElementById("attempt-title")?.textContent || "Practice Quiz",
        chapter: "",
        class_level: "",
        difficulty: "Medium",
        language: "English",
        num_questions: state.questions.length,
    };

    const title = config.chapter ? `${config.subject} — ${config.chapter}` : config.subject;
    const dateStr = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
    });

    const letters = ["A", "B", "C", "D"];

    // Build printable HTML element
    const pdfContainer = document.createElement("div");
    pdfContainer.id = "pdf-export-container";
    pdfContainer.style.fontFamily = "system-ui, -apple-system, sans-serif";
    pdfContainer.style.color = "#111827";
    pdfContainer.style.padding = "20px 24px";
    pdfContainer.style.background = "#ffffff";
    pdfContainer.style.maxWidth = "800px";
    pdfContainer.style.margin = "0 auto";

    pdfContainer.innerHTML = `
        <!-- PDF Header -->
        <div style="border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div style="font-size: 20px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px;">
                    Prepo<span style="color: #1e293b;">.ai</span>
                </div>
                <div style="font-size: 11px; color: #6b7280; font-weight: 500;">
                    Date: ${dateStr}
                </div>
            </div>
            <div style="font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px;">
                ${escapeHtml(title)}
            </div>
            <div style="font-size: 11px; color: #4b5563; display: flex; gap: 12px; flex-wrap: wrap;">
                ${config.class_level ? `<span><strong>Level:</strong> ${escapeHtml(config.class_level)}</span>` : ""}
                ${config.difficulty ? `<span><strong>Difficulty:</strong> ${escapeHtml(config.difficulty)}</span>` : ""}
                <span><strong>Total Questions:</strong> ${state.questions.length}</span>
                ${config.language ? `<span><strong>Language:</strong> ${escapeHtml(config.language)}</span>` : ""}
            </div>
        </div>

        <!-- Instructions -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; margin-bottom: 18px; font-size: 11px; color: #475569;">
            <strong>Instructions:</strong> Read each question carefully and mark the correct option (A, B, C, or D).
        </div>

        <!-- Questions List (Clean Practice Exam Paper) -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
            ${state.questions
                .map(
                    (q, idx) => `
                <div style="page-break-inside: avoid; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 14px; background: #ffffff;">
                    <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px; line-height: 1.4;">
                        <span style="color: #2563eb; font-weight: 700; margin-right: 4px;">Q${idx + 1}.</span> ${escapeHtml(q.question)}
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        ${(q.options || [])
                            .map(
                                (opt, oi) => `
                            <div style="font-size: 11px; color: #374151; padding: 6px 8px; border: 1px solid #e2e8f0; border-radius: 4px; background: #fafafa; display: flex; align-items: flex-start; gap: 6px;">
                                <span style="font-weight: 700; color: #4b5563; min-width: 18px;">(${letters[oi]})</span>
                                <span style="line-height: 1.3;">${escapeHtml(opt)}</span>
                            </div>
                        `
                            )
                            .join("")}
                    </div>
                </div>
            `
                )
                .join("")}
        </div>

        <!-- Footer -->
        <div style="margin-top: 24px; padding-top: 10px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #9ca3af;">
            Generated via Prepo.ai — AI Powered Practice & Learning Platform
        </div>
    `;

    // Download button feedback
    const btn = document.getElementById("download-pdf-btn");
    const originalText = btn ? btn.innerHTML : "";
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span>⏳</span> <span>Downloading...</span>`;
    }

    try {
        if (typeof html2pdf !== "undefined") {
            const cleanFileName = (title || "Prepo_Quiz").replace(/[^a-zA-Z0-9_-]/g, "_") + ".pdf";
            const opt = {
                margin: [10, 10, 10, 10],
                filename: cleanFileName,
                image: { type: "jpeg", quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true, letterRendering: true },
                jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                pagebreak: { mode: ["avoid-all", "css", "legacy"] },
            };

            await html2pdf().set(opt).from(pdfContainer).save();
            showToast("📥 PDF downloaded successfully!");
        } else {
            // Fallback to printable window
            const printWin = window.open("", "_blank");
            if (printWin) {
                printWin.document.write(`
                    <html>
                        <head>
                            <title>${escapeHtml(title)} - Prepo.ai</title>
                            <style>
                                body { font-family: system-ui, sans-serif; margin: 20px; color: #111827; }
                                @media print { body { margin: 0; } }
                            </style>
                        </head>
                        <body>
                            ${pdfContainer.innerHTML}
                            <script>
                                window.onload = function() { window.print(); window.close(); }
                            <\/script>
                        </body>
                    </html>
                `);
                printWin.document.close();
            } else {
                throw new Error("Popup blocked by browser.");
            }
        }
    } catch (err) {
        console.error("PDF export error:", err);
        showError("Failed to generate PDF. Please try again or allow popups.");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
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
    saveSessionState();
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
            saveSessionState();
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
        saveSessionState();
    } catch (err) {
        showError(err.message || "Failed to evaluate quiz. Please try again.");
    }
}


// ═══════════════════════════════════════════════════════════════════════════
// RESULTS — RENDERING
// ═══════════════════════════════════════════════════════════════════════════

function renderResults(data) {
    if (!data) return;
    const score = data.score || 0;
    const total = data.total || 0;
    const results = Array.isArray(data.results) ? data.results : [];

    // Score display
    const percent = total > 0 ? Math.round((score / total) * 100) : 0;
    const scoreDisplay = document.getElementById("score-display");
    if (scoreDisplay) {
        scoreDisplay.textContent = `${score} / ${total}`;
        let scoreClass = "score-poor";
        if (percent >= 80) scoreClass = "score-excellent";
        else if (percent >= 60) scoreClass = "score-good";
        else if (percent >= 40) scoreClass = "score-average";
        scoreDisplay.className = `text-4xl font-bold m-0 ${scoreClass}`;
    }

    const scorePercent = document.getElementById("score-percent");
    if (scorePercent) {
        let scoreClass = "score-poor";
        if (percent >= 80) scoreClass = "score-excellent";
        else if (percent >= 60) scoreClass = "score-good";
        else if (percent >= 40) scoreClass = "score-average";
        scorePercent.textContent = `${percent}% correct`;
        scorePercent.className = `text-sm mt-2 m-0 ${scoreClass}`;
    }

    // Render each result card
    const container = document.getElementById("results-container");
    if (!container) return;

    container.innerHTML = results
        .map((r, idx) => {
            const isCorrect = !!r.is_correct;
            const cardClass = isCorrect ? "correct" : "incorrect";
            const statusText = isCorrect ? "Correct" : "Incorrect";
            let exp = r.explanation || {};
            if (typeof exp === "string") {
                try { exp = JSON.parse(exp); } catch (e) { exp = { reasoning: exp }; }
            }

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
// ERROR HANDLING & CREDIT LIMIT MODAL
// ═══════════════════════════════════════════════════════════════════════════

function showCreditLimitModal() {
    const modal = document.getElementById("credit-limit-modal");
    if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    }
}

function closeCreditLimitModal() {
    const modal = document.getElementById("credit-limit-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "";
    }
    if (state.currentPage === "loading") {
        navigateTo("config");
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// BUY CREDITS & RAZORPAY PAYMENT FLOW
// ═══════════════════════════════════════════════════════════════════════════

function openBuyCreditsModal() {
    if (typeof auth === "undefined" || !auth || !auth.isLoggedIn()) {
        showError("Please sign in to view and buy quiz credit packs.");
        setTimeout(() => {
            navigateTo("signin");
        }, 1200);
        return;
    }

    const modal = document.getElementById("buy-credits-modal");
    const countEl = document.getElementById("modal-current-credits");
    if (countEl) {
        countEl.textContent = state.userCredits;
    }

    if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    }
}

function closeBuyCreditsModal() {
    const modal = document.getElementById("buy-credits-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "";
    }
}

async function initiatePurchase(planId) {
    if (typeof auth === "undefined" || !auth || !auth.isLoggedIn()) {
        closeBuyCreditsModal();
        showError("Please sign in to purchase credits.");
        navigateTo("signin");
        return;
    }

    const btn = document.getElementById(`btn-buy-${planId}`);
    const originalBtnHtml = btn ? btn.innerHTML : "";

    // Set Loading State
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<span class="inline-block animate-spin">⏳</span> Processing...`;
    }

    function resetButton() {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalBtnHtml;
        }
    }

    try {
        // 1. Create order on backend
        const orderData = await api.createPaymentOrder(planId);

        // 2. Check Razorpay SDK is loaded
        if (typeof window.Razorpay === "undefined") {
            throw new Error("Razorpay payment gateway failed to load. Please check your internet connection or try again.");
        }

        const currentUser = auth.getCurrentUser() || {};
        const userName = currentUser.user_metadata?.full_name || "";
        const userEmail = currentUser.email || "";

        // 3. Configure Razorpay Checkout
        const options = {
            key: orderData.key_id,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "Prepo.ai",
            description: `${orderData.credits} AI Quiz Credits (${orderData.plan_name})`,
            image: "/assets/favicon.png",
            order_id: orderData.order_id,
            prefill: {
                name: userName,
                email: userEmail,
            },
            theme: {
                color: "#2e73b8", // primary-600
            },
            modal: {
                ondismiss: function () {
                    resetButton();
                },
            },
            handler: async function (response) {
                // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
                try {
                    if (btn) {
                        btn.innerHTML = `<span class="inline-block animate-spin">⚡</span> Verifying Payment...`;
                    }

                    // 4. Verify payment on backend
                    const verifyRes = await api.verifyPayment({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        plan_id: planId,
                    });

                    // 5. Update state & UI
                    state.userCredits = verifyRes.credits;
                    const navCountEl = document.getElementById("nav-credits-count");
                    if (navCountEl) navCountEl.textContent = verifyRes.credits;
                    const modalCountEl = document.getElementById("modal-current-credits");
                    if (modalCountEl) modalCountEl.textContent = verifyRes.credits;

                    closeBuyCreditsModal();

                    showToast(`🎉 Payment Successful! ${orderData.credits} Credits added to your account (Total: ${verifyRes.credits}).`, "success");
                } catch (err) {
                    console.error("Payment verification error:", err);
                    showError(err.message || "Payment verification failed. If money was deducted, please contact support with Order ID: " + response.razorpay_order_id);
                } finally {
                    resetButton();
                }
            },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", function (response) {
            console.error("Razorpay payment failed:", response.error);
            showError(`Payment Failed: ${response.error.description || response.error.reason || "Transaction could not be completed."}`);
            resetButton();
        });

        rzp.open();
    } catch (err) {
        console.error("Initiate purchase error:", err);
        showError(err.message || "Failed to initiate payment. Please try again.");
        resetButton();
    }
}

function showToast(message, type = "success") {
    let toast = document.getElementById("app-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "app-toast";
        document.body.appendChild(toast);
    }

    if (type === "success") {
        toast.className = "fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 transform bg-gray-900 text-white border border-gray-700 flex items-center gap-2.5";
    } else {
        toast.className = "fixed bottom-6 right-6 z-[200] px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium transition-all duration-300 transform bg-red-600 text-white border border-red-500 flex items-center gap-2.5";
    }

    toast.innerHTML = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(16px)";
    }, 4500);
}

async function refreshUserCredits() {
    if (typeof auth === "undefined" || !auth || !auth.isLoggedIn()) {
        const badge = document.getElementById("nav-credits-badge");
        const mobileLink = document.getElementById("mobile-nav-credits-link");
        if (badge) badge.classList.add("hidden");
        if (mobileLink) mobileLink.classList.add("hidden");
        return;
    }

    try {
        const data = await api.getUserCredits();
        const countEl = document.getElementById("nav-credits-count");
        const badge = document.getElementById("nav-credits-badge");
        const mobileLink = document.getElementById("mobile-nav-credits-link");
        if (countEl) countEl.textContent = data.credits;
        if (badge) badge.classList.remove("hidden");
        if (mobileLink) mobileLink.classList.remove("hidden");
        state.userCredits = data.credits;
    } catch (err) {
        console.error("Error fetching credits:", err);
    }
}

function toggleMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    if (menu) {
        menu.classList.toggle("hidden");
    }
}

function closeMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    if (menu) {
        menu.classList.add("hidden");
    }
}

function showError(message) {
    if (message && (message.includes("CREDIT_LIMIT_REACHED") || message.toLowerCase().includes("credit limit"))) {
        closeErrorModal();
        showCreditLimitModal();
        return;
    }

    let displayMsg = message || "An unexpected error occurred. Please try again.";

    // Intercept technical 413 / TPM / token / rate-limit JSON errors and show friendly message
    if (
        displayMsg.includes("413") ||
        displayMsg.includes("Request too large") ||
        displayMsg.includes("rate_limit_exceeded") ||
        displayMsg.includes("tokens per minute") ||
        displayMsg.includes("TPM") ||
        (displayMsg.includes("Limit") && displayMsg.includes("Requested"))
    ) {
        displayMsg = "Document is too large. Please upload notes under 15–20 pages or a specific chapter.";
    }

    document.getElementById("error-message").textContent = displayMsg;
    const modal = document.getElementById("error-modal");
    modal.classList.remove("hidden");
    modal.style.display = "flex";
}

function closeErrorModal() {
    const modal = document.getElementById("error-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "";
    }
    // Go back to config page if on loading page
    if (state.currentPage === "loading") {
        navigateTo("config");
    }
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
                    <div class="border border-surface-200 rounded-card p-4 hover:border-primary-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-sm sm:text-base font-semibold text-gray-900 truncate">${escapeHtml(att.subject)} — ${escapeHtml(att.chapter)}</span>
                            </div>
                            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
                                <span class="tag">${escapeHtml(att.class_level)}</span>
                                <span>·</span>
                                <span>${att.total} Questions</span>
                                <span>·</span>
                                <span>${escapeHtml(att.difficulty)}</span>
                                ${dateStr ? `<span>·</span><span>${dateStr}</span>` : ""}
                            </div>
                        </div>
                        <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-surface-100">
                            <div class="border px-2.5 py-1 rounded-card text-center shrink-0 ${badgeClass}">
                                <span class="text-xs sm:text-sm font-bold block leading-tight">${att.score} / ${att.total}</span>
                                <span class="text-[9px] sm:text-[10px] font-medium opacity-80">${percent}%</span>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onclick="viewPastResponse('${att.id}')"
                                    class="bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-card transition-colors cursor-pointer"
                                >
                                    View Response
                                </button>
                                <button
                                    type="button"
                                    onclick="confirmDeleteAttempt('${att.id}', '${escapeHtml(att.subject)} — ${escapeHtml(att.chapter)}')"
                                    class="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-card transition-colors shrink-0 cursor-pointer border border-surface-200 hover:border-red-200"
                                    title="Delete quiz attempt"
                                    aria-label="Delete quiz attempt"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
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
        saveSessionState();
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
                    <div class="border border-surface-200 rounded-card p-4 hover:border-primary-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-white">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-sm sm:text-base font-semibold text-gray-900 truncate">${escapeHtml(q.subject)} — ${escapeHtml(q.chapter)}</span>
                            </div>
                            <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-gray-500">
                                <span class="tag">${escapeHtml(q.class_level)}</span>
                                <span>·</span>
                                <span>${escapeHtml(q.difficulty)}</span>
                                <span>·</span>
                                <span>${escapeHtml(q.language)}</span>
                                ${dateStr ? `<span>·</span><span>${dateStr}</span>` : ""}
                            </div>
                        </div>
                        <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-surface-100">
                            <div class="bg-primary-50 border border-primary-200 text-primary-700 px-2.5 py-1 rounded-card text-center shrink-0">
                                <span class="text-xs sm:text-sm font-bold block leading-tight">${q.submission_count || 0}</span>
                                <span class="text-[9px] sm:text-[10px] font-medium uppercase">Students</span>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <button
                                    type="button"
                                    onclick="copyDirectShareUrl('${shareUrl}')"
                                    class="bg-surface-100 hover:bg-surface-200 text-gray-700 border border-surface-300 text-xs font-medium px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-card transition-colors cursor-pointer"
                                >
                                    Copy Link
                                </button>
                                <button
                                    type="button"
                                    onclick="viewQuizLeaderboard('${q.id}')"
                                    class="bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-card transition-colors cursor-pointer shadow-xs"
                                >
                                    Responses
                                </button>
                                <button
                                    type="button"
                                    onclick="confirmDeleteSharedQuiz('${q.id}', '${escapeHtml(q.subject)} — ${escapeHtml(q.chapter)}')"
                                    class="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-card transition-colors cursor-pointer border border-surface-200 hover:border-red-200"
                                    title="Delete shared quiz"
                                    aria-label="Delete shared quiz"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
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

    const quizConfig = {
        subject: state.sharedQuizData.subject,
        chapter: state.sharedQuizData.chapter,
        class_level: state.sharedQuizData.class_level,
        difficulty: state.sharedQuizData.difficulty,
        num_questions: state.sharedQuizData.questions.length,
        language: state.sharedQuizData.language,
    };

    state.activeQuizConfig = quizConfig;
    renderQuizAttempt(quizConfig);
    navigateTo("attempt");
    saveSessionState();
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE CONFIRMATION HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

let pendingDeleteAction = null;

function openConfirmDeleteModal(title, description, onConfirm) {
    const modal = document.getElementById("confirm-delete-modal");
    const titleEl = document.getElementById("delete-modal-title");
    const descEl = document.getElementById("delete-modal-desc");
    const confirmBtn = document.getElementById("delete-modal-confirm-btn");

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = description;

    pendingDeleteAction = onConfirm;

    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            if (typeof pendingDeleteAction === "function") {
                confirmBtn.disabled = true;
                confirmBtn.textContent = "Deleting...";
                try {
                    await pendingDeleteAction();
                } finally {
                    confirmBtn.disabled = false;
                    confirmBtn.textContent = "Delete";
                    closeConfirmDeleteModal();
                }
            }
        };
    }

    if (modal) {
        modal.classList.remove("hidden");
        modal.style.display = "flex";
    }
}

function closeConfirmDeleteModal() {
    const modal = document.getElementById("confirm-delete-modal");
    if (modal) {
        modal.classList.add("hidden");
        modal.style.display = "";
    }
    pendingDeleteAction = null;
}

function confirmDeleteAttempt(attemptId, quizTitle) {
    openConfirmDeleteModal(
        "Delete Quiz Attempt?",
        `Are you sure you want to delete your past attempt for "${quizTitle}"? This cannot be undone.`,
        async () => {
            try {
                await api.deleteUserAttempt(attemptId);
                showToast("🗑️ Quiz attempt deleted successfully.");
                loadUserProfileHistory();
            } catch (err) {
                console.error("Delete attempt error:", err);
                showError(err.message || "Failed to delete quiz attempt.");
            }
        }
    );
}

function confirmDeleteSharedQuiz(quizId, quizTitle) {
    openConfirmDeleteModal(
        "Delete Shared Quiz?",
        `Are you sure you want to delete "${quizTitle}"? All student responses and leaderboard records for this quiz will also be removed.`,
        async () => {
            try {
                await api.deleteSharedQuiz(quizId);
                showToast("🗑️ Shared quiz deleted successfully.");
                loadTeacherSharedQuizzes();
            } catch (err) {
                console.error("Delete shared quiz error:", err);
                showError(err.message || "Failed to delete shared quiz.");
            }
        }
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", async () => {
    // Initialize auth first
    await auth.init();

    // Setup document dropzone listeners
    setupDocDropzone();

    // Check if opening via share link
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("quiz_id")) {
        checkStudentShareUrl();
    } else {
        // Restore active quiz or results session if refreshed
        const restored = restoreSessionState();
        if (!restored) {
            navigateTo("home");
        }
    }
});

// Auto-save state before page unload / refresh
window.addEventListener("beforeunload", () => {
    if (typeof saveSessionState === "function") {
        saveSessionState();
    }
});


