import { setDarkTheme } from "../utils/helpers";
import { LocalStorageService } from "./local-storage";
import { Log } from "./log";

class AppStateController {

  state = {}; // as AppState;

  xsMin = 1;
  xsMax = 319;
  smMin = 320;
  smMax = 511;
  mdMin = 512;
  mdMax = 991;
  lgMin = 992;
  lgMax = 1199;
  xlMin = 1200;
  xlMax = 99999;

  async initialize() {

    try {

      const savedState = await LocalStorageService.get('state');

      if (savedState) {
        this.state = savedState;
      }
    }
    catch (error) {
      Log.error(`Error getting initial app state: ${error.message}. Check that an environment.json file is provided with a 'databaseName' property.`);
    }
  }

  async registerEventHandlers() {

    // Create media query for user color theme preference
    const userPrefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)");
    // Set initial theme based on preference
    setDarkTheme(userPrefersDarkMode.matches);
    // Listen for changes to preference
    userPrefersDarkMode.addEventListener('change', mediaQuery => setDarkTheme(mediaQuery.matches));

    // Create media query for viewport size changes
    const extraSmallSize = window.matchMedia(`(min-width: ${this.xsMin}px) and (max-width: ${this.xsMax}px)`);
    const smallSize = window.matchMedia(`(min-width: ${this.smMin}px) and (max-width: ${this.smMax}px)`);
    const mediumSize = window.matchMedia(`(min-width: ${this.mdMin}px) and (max-width: ${this.mdMax}px)`);
    const largeSize = window.matchMedia(`(min-width: ${this.lgMin}px) and (max-width: ${this.lgMax}px)`);
    const extraLargeSize = window.matchMedia(`(min-width: ${this.xlMin}px) and (max-width: ${this.xlMax}px)`);

    // Listen for changes to viewport size
    extraSmallSize.addEventListener('change', (e) => this.handleViewportSizeChanged(e, 'xs'));
    smallSize.addEventListener('change', (e) => this.handleViewportSizeChanged(e, 'sm'));
    mediumSize.addEventListener('change', (e) => this.handleViewportSizeChanged(e, 'md'));
    largeSize.addEventListener('change', (e) => this.handleViewportSizeChanged(e, 'lg'));
    extraLargeSize.addEventListener('change', (e) => this.handleViewportSizeChanged(e, 'xl'));
  }

  async handleViewportSizeChanged(event: any, size: ViewportSize) {
    if (event.matches) {
      await this.setState('viewportSize', size);
    }
  }

  getViewportSize(clientWidth: number) {
    if (clientWidth >= this.xsMin && clientWidth <= this.xsMax) { return 'xs'; }
    else if (clientWidth >= this.smMin && clientWidth <= this.smMax) { return 'sm'; }
    else if (clientWidth >= this.mdMin && clientWidth <= this.mdMax) { return 'md'; }
    else if (clientWidth >= this.lgMin && clientWidth <= this.lgMax) { return 'lg'; }
    else { return 'xl'; }
  }
  async setViewportSize(clientWidth: number) {
    const newSize = this.getViewportSize(clientWidth);
    if (this.getState('viewportSize') !== newSize) {
      await this.setState('viewportSize', newSize);
    }
  }

  async emitEvent(eventName: string, detail?: any) {
    // Dispatch event to which other components can listen
    let appElem = document.querySelector('ion-app');
    if (!appElem) {
      Log.debug("Cannot find root app element to emit event", eventName);
      return;
    }
    appElem.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      detail: detail
    }));
  }

  async persistState() {
    await LocalStorageService.set('state', this.state);
  }

  getState(property: string) {
    return this.state[property];
  }

  async setState(property: string, value: any) {
    //if (this.state[property] == value) { return }
    this.state[property] = value;
    await this.persistState();
    this.emitEvent(`${property}Changed`, value);
  }
}

export const App = new AppStateController();