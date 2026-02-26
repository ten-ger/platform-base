import { popoverController, PopoverOptions } from "@ionic/core";

export interface PopoverMenuItem {
  displayText: string;
  onClick: (event: any) => void;
  disabled?: boolean;
  lines?: "full" | "inset" | "none";
}

class PopoverController {

  async create(options: PopoverOptions) {
    return popoverController.create(options);
  }

  async dismiss(data?: any, role?: string | undefined) {
    return popoverController.dismiss(data, role);
  }

  async showContent(event: any, content: HTMLElement, options?: Partial<PopoverOptions>) {
    const defaultPopoverOptions: PopoverOptions = {
      component: 'popover-content',
      componentProps: {
        content: content
      },
      cssClass: 'popover-medium',
      backdropDismiss: true,
      showBackdrop: false,
      side: 'bottom',
      alignment: 'end'
    };

    const mergedOptions: PopoverOptions = {
      ...defaultPopoverOptions,
      ...options,
      component: 'popover-content',
      componentProps: {
        content: content
      },
      event: event
    };

    const popover = await this.create(mergedOptions);
    await popover.present();
  }

  async showMenu(event: any, menuOptions: PopoverMenuItem[]) {
    // If "lines" not specified, default to "none"
    for (let mo of menuOptions) {
      if (!mo.hasOwnProperty("lines")) {
        mo["lines"] = "none";
      }
    }

    const popover = await this.create({
      component: 'popover-menu',
      componentProps: {
        menuOptions: menuOptions
      },
      backdropDismiss: true,
      showBackdrop: false,
      side: 'bottom',
      alignment: 'end',
      event: event
    });

    await popover.present();
  }
}

export const PopoverService = new PopoverController();