import { menuController } from "@ionic/core";

interface DynamicMenuComponent extends HTMLElement {
  // Add any common properties your dynamic components might have
  // e.g., a method to handle cleanup if necessary
  // dismiss?(): Promise<void>;
  [key: string]: any; // Allow for dynamic properties
}

interface MenuOptions {
  component: string,
  componentProps?: { [key: string]: any },
  width?: string
}

class MenuController {

  private currentDynamicComponent: DynamicMenuComponent | null = null;

  async open(options?: MenuOptions): Promise<boolean> {
    const { component, componentProps, width } = options || {};

    const rightMenuElem: HTMLIonMenuElement | null = document.querySelector(`#rightMenu`);
    if (!rightMenuElem) {
      console.error(`Ion-menu with ID rightMenu not found.`);
      return false;
    }

    if (width) {
      rightMenuElem.style.setProperty('--width', width);
      rightMenuElem.style.setProperty('--min-width', width);
      rightMenuElem.style.setProperty('--max-width', width);
    }
    else {
      rightMenuElem.style.removeProperty('--width');
      rightMenuElem.style.removeProperty('--min-width');
      rightMenuElem.style.removeProperty('--max-width');
    }

    if (this.currentDynamicComponent) {
      // If the component has a specific cleanup method (like dismiss), call it
      // if (typeof this.currentDynamicComponent.dismiss === 'function') {
      //   await this.currentDynamicComponent.dismiss();
      // }
      rightMenuElem.removeChild(this.currentDynamicComponent);
      this.currentDynamicComponent = null;
    }

    if (!component) {
      console.error('Right menu invoked without specifying component');
      return false;
    }
    const compElem = document.createElement(component) as DynamicMenuComponent;
    compElem.style.setProperty('height', '100%');
    // Load component properties
    for (const prop in componentProps) {
      if (Object.prototype.hasOwnProperty.call(componentProps, prop)) {
        compElem[prop] = componentProps[prop];
      }
    }
    this.currentDynamicComponent = compElem;
    rightMenuElem.appendChild(compElem);
    return menuController.open('rightMenu');
  }

  async dismiss() {
    if (this.currentDynamicComponent) {
      const rightMenuElem: HTMLIonMenuElement | null = document.querySelector(`#rightMenu`);
      if (rightMenuElem) {
        rightMenuElem.removeChild(this.currentDynamicComponent);
      }
      this.currentDynamicComponent = null;
    }
  }

  /**
   * Closes the menu.
   * @param menuId Optional: the ID of the menu to close. If not provided,
   * it will attempt to close any currently open menu.
   * @param animated Optional: whether the menu close animation should play.
   */
  async close(menuId?: string): Promise<boolean> {
    return menuController.close(menuId);
  }

  /**
   * Toggles the menu (opens if closed, closes if open).
   * @param menuId Optional: the ID of the menu to toggle. If not provided,
   * it will attempt to toggle the 'start' menu.
   * @param animated Optional: whether the menu toggle animation should play.
   */
  async toggle(menuId?: string): Promise<boolean> {
    return menuController.toggle(menuId);
  }

  /**
   * Checks if a specific menu (or any menu) is open.
   * @param menuId Optional: the ID of the menu to check.
   */
  async isOpen(menuId?: string): Promise<boolean> {
    return menuController.isOpen(menuId);
  }
}

export const MenuService = new MenuController();