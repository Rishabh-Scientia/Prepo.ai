import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabase';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(3);
  
  // Auth & Billing Modals State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup'
  const [isCreditLimitModalOpen, setIsCreditLimitModalOpen] = useState(false);
  const [isBuyCreditsModalOpen, setIsBuyCreditsModalOpen] = useState(false);

  const fetchCredits = useCallback(async () => {
    try {
      const data = await api.getUserCredits();
      if (data && typeof data.credits === 'number') {
        setCredits(data.credits);
      }
    } catch (err) {
      console.warn('Could not fetch user credits:', err.message);
    }
  }, []);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchCredits();
      }
    });

    // 2. Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);

      if (newSession?.user) {
        fetchCredits();
      } else {
        setCredits(3);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchCredits]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, fullName = '') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });
    if (error) throw error;
    return data;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('prepo_active_session_state');
  };

  const openSignIn = () => {
    setAuthModalMode('signin');
    setIsAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openCreditLimitModal = () => setIsCreditLimitModalOpen(true);
  const closeCreditLimitModal = () => setIsCreditLimitModalOpen(false);

  const openBuyCreditsModal = () => setIsBuyCreditsModalOpen(true);
  const closeBuyCreditsModal = () => setIsBuyCreditsModalOpen(false);

  const displayName = user?.user_metadata?.full_name?.trim() || 
    (user?.email ? user.email.split('@')[0] : 'User');
  const userInitial = displayName.charAt(0).toUpperCase();

  const value = {
    user,
    session,
    loading,
    credits,
    fetchCredits,
    displayName,
    userInitial,
    isLoggedIn: !!user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthModalOpen,
    authModalMode,
    openSignIn,
    openSignUp,
    closeAuthModal,
    isCreditLimitModalOpen,
    openCreditLimitModal,
    closeCreditLimitModal,
    isBuyCreditsModalOpen,
    openBuyCreditsModal,
    closeBuyCreditsModal,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
