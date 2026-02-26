import { Log } from "./log";
import { LocalStorageService } from "./local-storage";
import { App } from "./app-state";

class UserPreferencesController {
  private static instance: UserPreferencesController;
  private preferences = {};

  private constructor() {}

  public static getInstance(): UserPreferencesController {
    if (!UserPreferencesController.instance) {
      UserPreferencesController.instance = new UserPreferencesController();
    }
    return UserPreferencesController.instance;
  }

  public async initialize(): Promise<void> {
    try {
      const savedPreferences = await LocalStorageService.get('userPreferences');
      if (savedPreferences) {
        this.preferences = savedPreferences;
        Log.debug('User preferences loaded from local storage:', this.preferences);
      } else {
        Log.debug('No existing user preferences found in local storage. Initializing with defaults.');
        // Set some default preferences if none are found
        this.preferences = {};
        await this.persistPreferences(); 
      }

    } catch (error) {
      Log.error('Error initializing user preferences:', error);
    }
  }

  public get(key: string) {
    return this.preferences[key];
  }

  public async set(key: string, value: any): Promise<void> {
    if (this.preferences[key] === value) {
      return;
    }
    this.preferences[key] = value;
    Log.debug(`User preference '${String(key)}' set to:`, value);
    await this.persistPreferences();

    // Emit a generic event for preference changes, and a specific one
    App.emitEvent('userPreferencesChanged', this.preferences);
    App.emitEvent(`${String(key)}PreferenceChanged`, value);
  }

  public async clearAllPreferences(): Promise<void> {
    this.preferences = {};
    await LocalStorageService.remove('userPreferences'); 
    Log.info('All user preferences cleared.');
    App.emitEvent('userPreferencesCleared');
  }

  private async persistPreferences(): Promise<void> {
    try {
      await LocalStorageService.set('userPreferences', this.preferences);
    } catch (error) {
      Log.error('Error persisting user preferences:', error);
    }
  }
}

export const UserPreferencesService = UserPreferencesController.getInstance();