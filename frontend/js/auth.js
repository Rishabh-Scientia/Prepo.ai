/**
 * Prepo.ai — Supabase Auth Module
 * Handles sign-up, sign-in, sign-out, and session management.
 */

// ── Supabase Configuration ──────────────────────────────────────────────────

const SUPABASE_URL = "https://cahlcjvndiytjluzhpop.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhaGxjanZuZGl5dGpsdXpocG9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2ODM1NTUsImV4cCI6MjEwMTI1OTU1NX0.Srvqu56S7mJ557w_pNnwelEAVPLD88jD8MgIf2eRVxY";

// Initialize Supabase client (loaded via CDN)
// Note: CDN exposes `var supabase` globally, so we use a different name
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// ═══════════════════════════════════════════════════════════════════════════
// AUTH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const auth = {
    /**
     * Sign up a new user with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user: object|null, error: string|null}>}
     */
    async signUp(email, password, fullName = "") {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName.trim(),
                },
            },
        });

        if (error) {
            return { user: null, error: error.message };
        }

        // Supabase may require email confirmation
        if (data.user && !data.session) {
            return {
                user: data.user,
                error: null,
                needsConfirmation: true,
            };
        }

        return { user: data.user, error: null, needsConfirmation: false };
    },

    /**
     * Sign in with email and password
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user: object|null, error: string|null}>}
     */
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { user: null, error: error.message };
        }

        return { user: data.user, error: null };
    },

    /**
     * Sign out the current user
     */
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error("Sign out error:", error.message);
        }
    },

    /**
     * Get the current session (access token)
     * @returns {Promise<{accessToken: string|null, user: object|null}>}
     */
    async getSession() {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (!session) {
            return { accessToken: null, user: null };
        }

        return {
            accessToken: session.access_token,
            user: session.user,
        };
    },

    /**
     * Get current access token directly
     * @returns {Promise<string|null>}
     */
    async getToken() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session ? session.access_token : null;
    },

    /**
     * Get the current user synchronously from local state
     * @returns {object|null}
     */
    getCurrentUser() {
        return auth._currentUser;
    },

    /**
     * Check if user is logged in
     * @returns {boolean}
     */
    isLoggedIn() {
        return auth._currentUser !== null;
    },

    /**
     * Get display name for current user (Full Name or Email)
     */
    getDisplayName() {
        if (!auth._currentUser) return "";
        const meta = auth._currentUser.user_metadata || {};
        if (meta.full_name && meta.full_name.trim()) {
            return meta.full_name.trim();
        }
        return auth._currentUser.email ? auth._currentUser.email.split("@")[0] : "User";
    },

    // ── Internal State ──────────────────────────────────────────────────

    _currentUser: null,

    /**
     * Initialize auth — check existing session and set up listener
     */
    async init() {
        // Check existing session
        const { user } = await auth.getSession();
        auth._currentUser = user;
        auth._updateNavbar();

        // Listen for auth state changes
        supabaseClient.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_IN" && session) {
                auth._currentUser = session.user;
                auth._updateNavbar();
            } else if (event === "SIGNED_OUT") {
                const hadUser = auth._currentUser !== null;
                auth._currentUser = null;
                auth._updateNavbar();
                if (hadUser) {
                    navigateTo("home");
                }
            }
        });
    },

    /**
     * Update navbar based on auth state
     */
    _updateNavbar() {
        const signInBtn = document.getElementById("nav-signin-btn");
        const userInfo = document.getElementById("nav-user-info");
        const userEmail = document.getElementById("nav-user-email");
        const userAvatar = document.getElementById("nav-user-avatar");
        const desktopDashboardLink = document.getElementById("nav-dashboard-link");

        const mobileHeaderUserBtn = document.getElementById("mobile-header-user-btn");
        const mobileHeaderUserAvatar = document.getElementById("mobile-header-user-avatar");
        const mobileSignInBtn = document.getElementById("mobile-nav-signin-btn");
        const mobileDashboardLink = document.getElementById("mobile-nav-dashboard-link");
        const mobileSignOutBtn = document.getElementById("mobile-nav-signout-btn");

        if (auth._currentUser) {
            // Logged in
            if (signInBtn) signInBtn.classList.add("hidden");
            if (userInfo) userInfo.classList.remove("hidden");
            if (desktopDashboardLink) desktopDashboardLink.classList.remove("hidden");

            if (mobileHeaderUserBtn) mobileHeaderUserBtn.classList.remove("hidden");
            if (mobileSignInBtn) mobileSignInBtn.classList.add("hidden");
            if (mobileDashboardLink) mobileDashboardLink.classList.remove("hidden");
            if (mobileSignOutBtn) mobileSignOutBtn.classList.remove("hidden");
            
            const displayName = auth.getDisplayName();
            const initial = displayName.charAt(0).toUpperCase();
            if (userEmail) userEmail.textContent = displayName;
            if (userAvatar) userAvatar.textContent = initial;
            if (mobileHeaderUserAvatar) mobileHeaderUserAvatar.textContent = initial;

            if (typeof refreshUserCredits === "function") {
                refreshUserCredits();
            }
        } else {
            // Logged out
            if (signInBtn) signInBtn.classList.remove("hidden");
            if (userInfo) userInfo.classList.add("hidden");
            if (desktopDashboardLink) desktopDashboardLink.classList.add("hidden");

            if (mobileHeaderUserBtn) mobileHeaderUserBtn.classList.add("hidden");
            if (mobileSignInBtn) mobileSignInBtn.classList.remove("hidden");
            if (mobileDashboardLink) mobileDashboardLink.classList.add("hidden");
            if (mobileSignOutBtn) mobileSignOutBtn.classList.add("hidden");

            const creditsBadge = document.getElementById("nav-credits-badge");
            if (creditsBadge) creditsBadge.classList.add("hidden");
        }
    },
};


// ═══════════════════════════════════════════════════════════════════════════
// AUTH UI HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle sign-in form submission
 */
async function handleSignIn(event) {
    event.preventDefault();

    const email = document.getElementById("signin-email").value.trim();
    const password = document.getElementById("signin-password").value;
    const errorEl = document.getElementById("signin-error");
    const submitBtn = document.getElementById("signin-submit-btn");

    // Clear previous errors
    errorEl.classList.add("hidden");
    errorEl.textContent = "";

    // Validate
    if (!email || !password) {
        errorEl.textContent = "Please enter both email and password.";
        errorEl.classList.remove("hidden");
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = "Signing in...";

    const { user, error } = await auth.signIn(email, password);

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";

    if (error) {
        errorEl.textContent = error;
        errorEl.classList.remove("hidden");
        return;
    }

    // Success — navigate to home
    navigateTo("home");
}

/**
 * Handle sign-up form submission
 */
async function handleSignUp(event) {
    event.preventDefault();

    const fullName = (document.getElementById("signup-fullname")?.value || "").trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const confirmPassword = document.getElementById("signup-confirm-password").value;
    const errorEl = document.getElementById("signup-error");
    const successEl = document.getElementById("signup-success");
    const submitBtn = document.getElementById("signup-submit-btn");

    // Clear previous messages
    errorEl.classList.add("hidden");
    errorEl.textContent = "";
    successEl.classList.add("hidden");
    successEl.textContent = "";

    // Validate
    if (!fullName || !email || !password || !confirmPassword) {
        errorEl.textContent = "Please fill in all fields.";
        errorEl.classList.remove("hidden");
        return;
    }

    if (password.length < 6) {
        errorEl.textContent = "Password must be at least 6 characters long.";
        errorEl.classList.remove("hidden");
        return;
    }

    if (password !== confirmPassword) {
        errorEl.textContent = "Passwords do not match.";
        errorEl.classList.remove("hidden");
        return;
    }

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating account...";

    const { user, error, needsConfirmation } = await auth.signUp(email, password, fullName);

    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";

    if (error) {
        errorEl.textContent = error;
        errorEl.classList.remove("hidden");
        return;
    }

    if (needsConfirmation) {
        successEl.textContent = "Account created! Please check your email to confirm your account, then sign in.";
        successEl.classList.remove("hidden");
        // Clear form
        document.getElementById("signup-form").reset();
        return;
    }

    // Auto-logged in — navigate to home
    navigateTo("home");
}

/**
 * Handle sign-out button click
 */
async function handleSignOut() {
    if (typeof clearSessionState === "function") {
        clearSessionState();
    }
    await auth.signOut();
}

/**
 * Handle Google OAuth login
 */
const handleGoogleLogin = async () => {
    const supabase = supabaseClient;
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    });

    if (error) {
        console.error("Google sign in error:", error.message);
        const signinErrorEl = document.getElementById("signin-error");
        if (signinErrorEl) {
            signinErrorEl.textContent = error.message;
            signinErrorEl.classList.remove("hidden");
        }
        const signupErrorEl = document.getElementById("signup-error");
        if (signupErrorEl) {
            signupErrorEl.textContent = error.message;
            signupErrorEl.classList.remove("hidden");
        }
    }
};
