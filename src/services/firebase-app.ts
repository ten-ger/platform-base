import { initializeApp, FirebaseApp } from 'firebase/app';
import { Analytics, getAnalytics } from "firebase/analytics";
import { Log } from './log';

class FirebaseAppController {
  private _app: FirebaseApp | null = null;
  private _analytics: Analytics | null = null;

  async initialize(): Promise<void> {
    if (this._app) {
      Log.info('Firebase app already initialized.');
      return;
    }

    try {
      /** Update the following config with 
       * details from your Firebase project: */
      const firebaseConfig = {
        apiKey: "",
        authDomain: "",
        projectId: "",
        storageBucket: "",
        messagingSenderId: "",
        appId: "",
        measurementId: ""
      };

      if (!firebaseConfig) {
        Log.error("Firebase configuration not found in app state. Please ensure 'firebaseConfig' is set.");
        throw new Error("Firebase configuration missing.");
      }

      this._app = initializeApp(firebaseConfig);
      Log.debug('Firebase app initialized successfully.');
      this._analytics = getAnalytics(this._app);
    } catch (error) {
      Log.error(`Error initializing Firebase app: ${error.message}`);
      this._app = null;
      throw error;
    }
  }

  get app(): FirebaseApp {
    if (!this._app) {
      throw new Error('Firebase app not initialized. Call initialize() first.');
    }
    return this._app;
  }

  get analytics(): Analytics {
    if (!this._analytics) {
      throw new Error('Firebase app not initialized. Call initialize() first.');
    }
    return this._analytics;
  }
}

export const FirebaseAppService = new FirebaseAppController();