import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

export interface FarmerUser {
  id: string;
  full_name: string;
  phone_number: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  user?: FarmerUser;
}

class AuthService {
  private static instance: AuthService;
  private currentUser: FarmerUser | null = null;
  private currentSession: Session | null = null;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  async register(fullName: string, phoneNumber: string, password: string, role: string = 'farmer'): Promise<{ user?: FarmerUser; error?: string }> {
    try {
      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+254${phoneNumber.replace(/^0/, '')}`;
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      const { data, error } = await supabase
        .from('farmer_users')
        .insert({
          full_name: fullName,
          phone_number: formattedPhone,
          password_hash: passwordHash,
          role: role
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          return { error: 'Phone number already registered' };
        }
        return { error: error.message };
      }

      return { user: data };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async login(name: string, password: string): Promise<{ session?: Session; error?: string }> {
    try {
      // Find user by name (case insensitive)
      const { data: users, error: fetchError } = await supabase
        .from('farmer_users')
        .select('*')
        .ilike('full_name', name.trim())
        .limit(1);

      if (fetchError) {
        return { error: fetchError.message };
      }

      if (!users || users.length === 0) {
        return { error: 'User not found' };
      }

      const user = users[0];

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return { error: 'Invalid password' };
      }

      // Create session
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_token: sessionToken,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        return { error: sessionError.message };
      }

      // Update last login
      await supabase
        .from('farmer_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', user.id);

      const session: Session = {
        ...sessionData,
        user
      };

      // Store session locally
      this.currentUser = user;
      this.currentSession = session;
      localStorage.setItem('farmer-session', sessionToken);

      return { session };
    } catch (error: any) {
      return { error: error.message };
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.currentSession) {
        await supabase
          .from('user_sessions')
          .delete()
          .eq('session_token', this.currentSession.session_token);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      this.currentUser = null;
      this.currentSession = null;
      localStorage.removeItem('farmer-session');
    }
  }

  async checkSession(): Promise<FarmerUser | null> {
    try {
      const sessionToken = localStorage.getItem('farmer-session');
      if (!sessionToken) {
        return null;
      }

      // Check if session is valid and not expired
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          farmer_users (*)
        `)
        .eq('session_token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .limit(1);

      if (error || !sessions || sessions.length === 0) {
        localStorage.removeItem('farmer-session');
        return null;
      }

      const session = sessions[0];
      this.currentUser = session.farmer_users;
      this.currentSession = session;

      return this.currentUser;
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem('farmer-session');
      return null;
    }
  }

  getCurrentUser(): FarmerUser | null {
    return this.currentUser;
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }

  private generateSessionToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}

export const authService = AuthService.getInstance();