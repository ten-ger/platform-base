import { loadingController, LoadingOptions } from "@ionic/core";

class LoadingController {

  async showLoading(options?: LoadingOptions) {

    let opts = {...options};
    opts.translucent = true;
    opts.cssClass = 'loading-secondary-bg';

    let loading = await loadingController.create(opts);
    await loading.present();
  }

  async dismiss() {

    while (await loadingController.getTop()) {
      
      await loadingController.dismiss();
    }
  }
}

export const LoadingService = new LoadingController();