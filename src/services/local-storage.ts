class LocalStorageController {

  storage = window.localStorage;
  sessionStorage = window.sessionStorage;
  storageKeyPrefix: string = '';
  
  setLocalStoragePrefix(prefix) {
    this.storageKeyPrefix = prefix;
  }

  testForLocalStorage() {
    if (!this.storage) {
      throw "Local storage unavailable.";
    }
  }

  testForSessionStorage() {
    if (!window.sessionStorage) {
      throw "Session storage unavailable.";
    }
  }

  set(keySuffix: string, value: any) {
    try {
      this.testForLocalStorage();
      this.storage.setItem(this.storageKeyPrefix + keySuffix, JSON.stringify(value));
    }
    catch (error) {
      throw `Unable to store value in local storage: ${value} due to error:` + error.message;
    }
  }

  get(keySuffix: string) {
    try {
      this.testForLocalStorage();
      const item = this.storage.getItem(this.storageKeyPrefix + keySuffix);
      return JSON.parse(item);
    }
    catch (error) {
      throw `Unable to get value from local storage: ${this.storageKeyPrefix + keySuffix} due to error:` + error.message;
    }
  }

  remove(keySuffix: string) {
    try {
      this.testForLocalStorage();
      this.storage.removeItem(this.storageKeyPrefix + keySuffix);
    }
    catch (error) {
      throw `Unable to remove value from local storage: ${this.storageKeyPrefix + keySuffix} due to error:` + error.message;
    }
  }

  setToSession(keySuffix: string, value: any) {
    try {
      this.testForSessionStorage();
      this.sessionStorage.setItem(this.storageKeyPrefix + keySuffix, JSON.stringify(value));
    }
    catch (error) {
      throw `Unable to store value in session storage: ${value} due to error:` + error.message;
    }
  }

  getFromSession(keySuffix: string) {
    try {
      this.testForSessionStorage();
      const item = this.sessionStorage.getItem(this.storageKeyPrefix + keySuffix);
      return JSON.parse(item);
    }
    catch (error) {
      throw `Unable to get value from session storage: ${this.storageKeyPrefix + keySuffix} due to error:` + error.message;
    }
  }

  removeFromSession(keySuffix: string) {
    try {
      this.testForSessionStorage();
      this.sessionStorage.removeItem(this.storageKeyPrefix + keySuffix);
    }
    catch (error) {
      throw `Unable to remove value from local storage: ${this.storageKeyPrefix + keySuffix} due to error:` + error.message;
    }
  }
}

export const LocalStorageService = new LocalStorageController();