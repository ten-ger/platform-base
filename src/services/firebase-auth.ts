import { getAuth, signInWithEmailAndPassword, signOut, onIdTokenChanged, Auth, User as FirebaseUser } from 'firebase/auth';
import { FirebaseAppService } from './firebase-app';
import { Log } from './log';

class FirebaseAuthController {
  private _auth: Auth | null = null;
  private _unsubscribeTokenListener: (() => void) | null = null;

  private get auth(): Auth {
    if (!this._auth) {
      this._auth = getAuth(FirebaseAppService.app);
    }
    return this._auth;
  }

  async signIn(email: string, password: string): Promise<FirebaseUser> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      Log.debug('Firebase sign in successful');
      return credential.user;
    } catch (error) {
      Log.error('Firebase sign in failed', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      Log.debug('Firebase sign out successful');
    } catch (error) {
      Log.error('Firebase sign out failed', error);
      throw error;
    }
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    try {
      return await user.getIdToken();
    } catch (error) {
      Log.error('Failed to get Firebase ID token', error);
      return null;
    }
  }

  /**
   * Waits for Firebase to finish restoring persisted auth state, then returns
   * the ID token (or null if unauthenticated). Use this instead of getIdToken()
   * on page load, since currentUser is null until Firebase initializes.
   */
  waitForAuthReady(): Promise<string | null> {
    return new Promise((resolve) => {
      const unsub = onIdTokenChanged(this.auth, async (user) => {
        unsub();
        if (!user) { resolve(null); return; }
        try {
          resolve(await user.getIdToken());
        } catch (error) {
          Log.error('Failed to get Firebase ID token after auth ready', error);
          resolve(null);
        }
      });
    });
  }

  /**
   * Subscribe to Firebase ID token changes (fires on sign-in, sign-out, and auto-refresh).
   * Replaces any previously registered listener.
   */
  onTokenChanged(callback: (token: string | null, user: FirebaseUser | null) => void): void {
    if (this._unsubscribeTokenListener) {
      this._unsubscribeTokenListener();
    }
    this._unsubscribeTokenListener = onIdTokenChanged(this.auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        callback(token, user);
      } else {
        callback(null, null);
      }
    });
  }

  stopTokenListener(): void {
    if (this._unsubscribeTokenListener) {
      this._unsubscribeTokenListener();
      this._unsubscribeTokenListener = null;
    }
  }
}

export const FirebaseAuthService = new FirebaseAuthController();
