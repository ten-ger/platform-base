import { actionSheetController, ActionSheetOptions } from "@ionic/core";

class ActionSheetController {

  async create(options: ActionSheetOptions) {

    return actionSheetController.create(options);
  }

  async present(options: ActionSheetOptions): Promise<{ data: any; role: string }> {

    const sheet = await this.create(options);
    await sheet.present();
    const { data, role } = await sheet.onDidDismiss();
    return { data, role: role ?? '' };
  }
}

export const ActionSheetService = new ActionSheetController();
