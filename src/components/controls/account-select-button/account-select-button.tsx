import { Component, h } from "@stencil/core";
import { ModalService } from "../../../services/modal";
import { LoadingService } from "../../../services/loading";

@Component({
  tag: 'account-select-button'
})
export class AccountSelectButton {

  async hClicked() {
    try {
      await LoadingService.showLoading();
      const modal = await ModalService.create({
        component: 'login-and-account-selection',
        backdropDismiss: false,
        showBackdrop: true
      });

      await modal.present();
    }
    catch (error) {

    }
    finally {
      await LoadingService.dismiss();
    }
  }

  render() {
    return [
      <ion-button color='medium' fill='clear' onClick={() => this.hClicked()}>
        <ion-icon slot='icon-only' name='business-outline' />
      </ion-button>
    ]
  }
}