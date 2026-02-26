import { modalController, ModalOptions } from "@ionic/core";

class ModalController {

  async create(options: ModalOptions) {

    return modalController.create(options);
  }

  async dismiss(data?: any, role?: string, id?: string) {

    await modalController.dismiss(data, role, id);
  }

  async showModal(options: ModalOptions) {

    const modal = await this.create(options);
    await modal.present();
  }
}

export const ModalService = new ModalController();