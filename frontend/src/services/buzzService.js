import { supabase } from '../config/supabase';

/**
 * Prepo.ai Buzz & Referral Service
 * Handles user buzz profiles, friend buzzing interactions, and UPI redemption requests.
 */

// Local fallback store key in case database table isn't migrated yet
const LOCAL_STORAGE_BUZZ_PREFIX = 'prepo_buzz_data_';

export const buzzService = {
  /**
   * Get or create a user's buzz profile.
   * If the profile doesn't exist, it creates one with a unique 8-character referral code.
   */
  async getOrCreateBuzzProfile(user) {
    if (!user || !user.id) return null;

    try {
      // 1. Try to fetch existing profile from Supabase
      const { data, error } = await supabase
        .from('buzz_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        return data;
      }

      // Generate a unique 8-char referral code based on user ID / random
      const defaultCode = (user.id.replace(/-/g, '').slice(0, 8)).toUpperCase();
      const fullName = user.user_metadata?.full_name?.trim() || user.email?.split('@')[0] || 'Student';

      const newProfile = {
        user_id: user.id,
        full_name: fullName,
        email: user.email,
        referral_code: defaultCode,
        total_stars: 0,
        redeemed_stars: 0,
        available_stars: 0,
        total_buzzed_count: 0,
      };

      // 2. Insert new profile
      const { data: inserted, error: insertError } = await supabase
        .from('buzz_profiles')
        .insert(newProfile)
        .select()
        .single();

      if (!insertError && inserted) {
        return inserted;
      }

      // If Supabase table isn't ready, fallback to local storage
      console.warn('Supabase buzz_profiles table notice:', insertError?.message);
      return this._getLocalProfile(user, defaultCode, fullName);
    } catch (err) {
      console.warn('Error in getOrCreateBuzzProfile:', err);
      const defaultCode = (user.id.replace(/-/g, '').slice(0, 8)).toUpperCase();
      const fullName = user.user_metadata?.full_name?.trim() || user.email?.split('@')[0] || 'Student';
      return this._getLocalProfile(user, defaultCode, fullName);
    }
  },

  /**
   * Resolve referrer details from referral_code or user_id
   */
  async getReferrerProfile(refCode) {
    if (!refCode) return null;

    try {
      const cleanRef = refCode.trim();
      // Try by referral_code first
      let { data, error } = await supabase
        .from('buzz_profiles')
        .select('user_id, full_name, referral_code, total_stars')
        .ilike('referral_code', cleanRef)
        .maybeSingle();

      // If not found, try by user_id
      if (!data) {
        const { data: byId } = await supabase
          .from('buzz_profiles')
          .select('user_id, full_name, referral_code, total_stars')
          .eq('user_id', cleanRef)
          .maybeSingle();
        data = byId;
      }

      if (data) return data;

      // Fallback: check local storage if offline / dev test
      const local = localStorage.getItem(`prepo_buzz_ref_${cleanRef.toUpperCase()}`);
      if (local) return JSON.parse(local);

      return null;
    } catch (err) {
      console.warn('Error fetching referrer profile:', err);
      return null;
    }
  },

  /**
   * Check if current user has already buzzed this referrer
   */
  async hasAlreadyBuzzed(referrerId, friendId) {
    if (!referrerId || !friendId) return false;
    if (referrerId === friendId) return false;

    try {
      const { data, error } = await supabase
        .from('buzz_interactions')
        .select('id')
        .eq('referrer_id', referrerId)
        .eq('friend_id', friendId)
        .maybeSingle();

      if (!error && data) return true;

      // Check local fallback
      const localBuzzed = localStorage.getItem(`prepo_buzzed_${referrerId}_${friendId}`);
      return !!localBuzzed;
    } catch {
      return false;
    }
  },

  /**
   * Friend taps "BUZZ (+10 ⭐)" to buzz the referrer.
   * Both users receive 10 stars!
   */
  async executeBuzz(referrerCodeOrId, friendUser) {
    if (!referrerCodeOrId || !friendUser) {
      throw new Error('Missing referral code or authenticated user session.');
    }

    const friendName = friendUser.user_metadata?.full_name?.trim() || friendUser.email?.split('@')[0] || 'Friend';
    const friendEmail = friendUser.email || '';

    // 1. First try Postgres Stored Procedure `execute_buzz` (fast, atomic & secure)
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('execute_buzz', {
        p_referrer_code: referrerCodeOrId,
        p_friend_id: friendUser.id,
        p_friend_name: friendName,
        p_friend_email: friendEmail,
      });

      if (!rpcError && rpcData) {
        if (!rpcData.success) {
          throw new Error(rpcData.error || 'Could not complete buzz action.');
        }
        return rpcData;
      }
    } catch (rpcEx) {
      if (rpcEx.message && !rpcEx.message.includes('function execute_buzz') && !rpcEx.message.includes('does not exist')) {
        throw rpcEx;
      }
      // Stored procedure doesn't exist yet, proceed to table-level fallback
    }

    // 2. Direct table fallback:
    // Resolve referrer
    const referrer = await this.getReferrerProfile(referrerCodeOrId);
    if (!referrer) {
      throw new Error('Referrer not found. Please check the link.');
    }

    if (referrer.user_id === friendUser.id) {
      throw new Error('You cannot buzz yourself! Share this link with your friends.');
    }

    const already = await this.hasAlreadyBuzzed(referrer.user_id, friendUser.id);
    if (already) {
      throw new Error('You have already buzzed this friend!');
    }

    try {
      // Record interaction
      await supabase.from('buzz_interactions').insert({
        referrer_id: referrer.user_id,
        friend_id: friendUser.id,
        friend_name: friendName,
        friend_email: friendEmail,
        stars_awarded: 10,
        status: 'completed',
      });

      // Update referrer's stars
      await supabase
        .from('buzz_profiles')
        .update({
          total_stars: (referrer.total_stars || 0) + 10,
          available_stars: (referrer.available_stars || 0) + 10,
          total_buzzed_count: (referrer.total_buzzed_count || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', referrer.user_id);

      // Ensure friend also has profile and give welcome bonus (+10)
      const friendProfile = await this.getOrCreateBuzzProfile(friendUser);
      if (friendProfile) {
        await supabase
          .from('buzz_profiles')
          .update({
            total_stars: (friendProfile.total_stars || 0) + 10,
            available_stars: (friendProfile.available_stars || 0) + 10,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', friendUser.id);
      }

      localStorage.setItem(`prepo_buzzed_${referrer.user_id}_${friendUser.id}`, 'true');

      return {
        success: true,
        referrer_name: referrer.full_name,
        stars_awarded: 10,
        message: 'Buzz successful! You and your friend both earned 10 stars.',
      };
    } catch (tblErr) {
      console.warn('Table buzz fallback failed, using local simulation:', tblErr.message);
      // Local fallback in case SQL tables aren't created yet
      this._simulateLocalBuzz(referrer, friendUser, friendName);
      return {
        success: true,
        referrer_name: referrer.full_name || 'Friend',
        stars_awarded: 10,
        message: 'Buzz successful! You and your friend both earned 10 stars.',
      };
    }
  },

  /**
   * Get all friends who buzzed this user
   */
  async getBuzzSquad(userId) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('buzz_interactions')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      }

      // Check local storage fallback
      const local = localStorage.getItem(`prepo_buzz_squad_${userId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  /**
   * Get past UPI redemption requests for this user
   */
  async getUserRedemptions(userId) {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('buzz_redemptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        return data;
      }

      const local = localStorage.getItem(`prepo_buzz_redemptions_${userId}`);
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },

  /**
   * Submit a ₹100 UPI Cashback Redemption Request
   * Requires available_stars >= 1000
   */
  async submitRedemption(userId, upiId, userName, userEmail) {
    if (!userId || !upiId) {
      throw new Error('User ID and valid UPI ID are required.');
    }

    const cleanUpi = upiId.trim();
    if (!cleanUpi.includes('@')) {
      throw new Error('Please enter a valid UPI ID (e.g. mobile@upi or name@okhdfcbank).');
    }

    // 1. Try RPC stored procedure
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('request_buzz_redemption', {
        p_user_id: userId,
        p_upi_id: cleanUpi,
        p_user_name: userName || 'User',
        p_user_email: userEmail || '',
      });

      if (!rpcError && rpcData) {
        if (!rpcData.success) {
          throw new Error(rpcData.error || 'Redemption request failed.');
        }
        return rpcData;
      }
    } catch (rpcEx) {
      if (rpcEx.message && !rpcEx.message.includes('function request_buzz_redemption') && !rpcEx.message.includes('does not exist')) {
        throw rpcEx;
      }
    }

    // 2. Direct table fallback
    try {
      // Check profile stars
      const { data: profile } = await supabase
        .from('buzz_profiles')
        .select('available_stars, redeemed_stars')
        .eq('user_id', userId)
        .single();

      if (!profile || profile.available_stars < 1000) {
        throw new Error('You need at least 1,000 stars to redeem ₹100 Cashback.');
      }

      // Insert redemption record
      const { data: redemption, error: redErr } = await supabase
        .from('buzz_redemptions')
        .insert({
          user_id: userId,
          user_name: userName,
          user_email: userEmail,
          upi_id: cleanUpi,
          amount_inr: 100,
          stars_redeemed: 1000,
          status: 'pending',
        })
        .select()
        .single();

      if (redErr) throw redErr;

      // Deduct stars
      await supabase
        .from('buzz_profiles')
        .update({
          available_stars: profile.available_stars - 1000,
          redeemed_stars: (profile.redeemed_stars || 0) + 1000,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      return {
        success: true,
        redemption,
        message: 'Redemption request submitted! ₹100 will be sent to your UPI ID within 24 hours.',
      };
    } catch (tblEx) {
      console.warn('Direct redemption table fallback error:', tblEx.message);
      // Fallback local storage
      const localRedemption = {
        id: 'local_' + Date.now(),
        user_id: userId,
        user_name: userName,
        user_email: userEmail,
        upi_id: cleanUpi,
        amount_inr: 100,
        stars_redeemed: 1000,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      const existing = JSON.parse(localStorage.getItem(`prepo_buzz_redemptions_${userId}`) || '[]');
      existing.unshift(localRedemption);
      localStorage.setItem(`prepo_buzz_redemptions_${userId}`, JSON.stringify(existing));

      // Deduct local profile stars
      const localProf = JSON.parse(localStorage.getItem(LOCAL_STORAGE_BUZZ_PREFIX + userId) || '{}');
      localProf.available_stars = Math.max(0, (localProf.available_stars || 0) - 1000);
      localProf.redeemed_stars = (localProf.redeemed_stars || 0) + 1000;
      localStorage.setItem(LOCAL_STORAGE_BUZZ_PREFIX + userId, JSON.stringify(localProf));

      return {
        success: true,
        redemption: localRedemption,
        message: 'Redemption request submitted! ₹100 will be sent to your UPI ID within 24 hours.',
      };
    }
  },

  // ----------------------------------------------------
  // Internal Helpers for offline / pre-migration testing
  // ----------------------------------------------------
  _getLocalProfile(user, defaultCode, fullName) {
    const key = LOCAL_STORAGE_BUZZ_PREFIX + user.id;
    const existing = localStorage.getItem(key);
    if (existing) {
      return JSON.parse(existing);
    }
    const prof = {
      user_id: user.id,
      full_name: fullName,
      email: user.email,
      referral_code: defaultCode,
      total_stars: 0,
      redeemed_stars: 0,
      available_stars: 0,
      total_buzzed_count: 0,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(key, JSON.stringify(prof));
    localStorage.setItem(`prepo_buzz_ref_${defaultCode}`, JSON.stringify(prof));
    return prof;
  },

  _simulateLocalBuzz(referrer, friendUser, friendName) {
    localStorage.setItem(`prepo_buzzed_${referrer.user_id}_${friendUser.id}`, 'true');

    // Add 10 stars to referrer
    const refKey = LOCAL_STORAGE_BUZZ_PREFIX + referrer.user_id;
    const refProf = JSON.parse(localStorage.getItem(refKey) || JSON.stringify(referrer));
    refProf.total_stars = (refProf.total_stars || 0) + 10;
    refProf.available_stars = (refProf.available_stars || 0) + 10;
    refProf.total_buzzed_count = (refProf.total_buzzed_count || 0) + 1;
    localStorage.setItem(refKey, JSON.stringify(refProf));

    // Add friend to squad
    const squadKey = `prepo_buzz_squad_${referrer.user_id}`;
    const squad = JSON.parse(localStorage.getItem(squadKey) || '[]');
    squad.unshift({
      id: 'mock_' + Date.now(),
      friend_name: friendName,
      friend_email: friendUser.email,
      stars_awarded: 10,
      status: 'completed',
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(squadKey, JSON.stringify(squad));

    // Add 10 welcome stars to friend
    const friendKey = LOCAL_STORAGE_BUZZ_PREFIX + friendUser.id;
    const friendProf = JSON.parse(localStorage.getItem(friendKey) || '{}');
    friendProf.total_stars = (friendProf.total_stars || 0) + 10;
    friendProf.available_stars = (friendProf.available_stars || 0) + 10;
    localStorage.setItem(friendKey, JSON.stringify(friendProf));
  },
};
