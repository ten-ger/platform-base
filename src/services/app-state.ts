import { setDarkTheme } from "../utils/helpers";
import { LocalStorageService } from "./local-storage";
import { Log } from "./log";

class AppStateController {

  state = {};

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
      const savedState = LocalStorageService.get('state');
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

    // Detect primary input device type: 'mouse' supports hover, 'touch' does not.
    // Some devices (e.g. detachable tablets) can switch modes, so we listen for changes.
    const mouseInput = window.matchMedia("(hover: hover) and (pointer: fine)");
    mouseInput.addEventListener('change', (e) => {
      this.setState('deviceInputType', e.matches ? 'mouse' : 'touch');
    });
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

  getDeviceInputType(): DeviceInputType {
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches ? 'mouse' : 'touch';
  }

  async setDeviceInputType() {
    const inputType = this.getDeviceInputType();
    if (this.getState('deviceInputType') !== inputType) {
      await this.setState('deviceInputType', inputType);
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
    LocalStorageService.set('state', this.state);
  }

  getState(property: string) {
    return this.state[property];
  }

  async setState(property: string, value: any) {
    this.state[property] = value;
    await this.persistState();
    this.emitEvent(`${property}Changed`, value);
  }

  bindAppState(
    component: any,
    stateKey: string,
    onChanged: (value: any) => void,
    callOnChangedImmediately: boolean = true
  ) {
    const eventName = `${stateKey}Changed`;
    const handlerKey = `__appState_${stateKey}_handler`;

    if (callOnChangedImmediately) {
      onChanged(this.getState(stateKey));
    }

    component[handlerKey] = async (event: any) => {
      onChanged(event?.detail);
    };

    document.addEventListener(eventName, component[handlerKey]);
  }

  unbindAppState(component: any, stateKeys: string[]) {
    for (let stateKey of stateKeys) {
      const eventName = `${stateKey}Changed`;
      const handlerKey = `__appState_${stateKey}_handler`;
      if (component[handlerKey]) {
        document.removeEventListener(eventName, component[handlerKey]);
      }
    }
  }
}

export const App = new AppStateController();