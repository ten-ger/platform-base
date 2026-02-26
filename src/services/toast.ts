import { toastController, ToastOptions } from "@ionic/core";

class ToastController {

  async getToast(options?: ToastOptions) {

    return await toastController.create(options);
  }

  async showSuccessToast(options?: ToastOptions) {

    let opts = {...options,
      color: 'success',
      duration: options && options.duration ? options.duration : 3000
    };
    const toast = await this.getToast(opts);
    await toast.present();
  }
  
  async showFailureToast(options?: ToastOptions) {

    let opts = {...options,
      color: 'danger'
    };
    opts.buttons = options && options.buttons ? options.buttons : 
      [{
        side: 'end',
        icon: 'close',
        role: 'cancel'
      }];
    const toast = await this.getToast(opts);
    await toast.present();
  }

  async showInformationToast(options?: ToastOptions) {

    let opts = {...options,
      color: 'warning'
    };
    const toast = await this.getToast(opts);
    await toast.present();
  }

  async dismissAny() {

    try {

      await toastController.dismiss();
    }
    catch (error) {}
  }
}

export const ToastService = new ToastController();