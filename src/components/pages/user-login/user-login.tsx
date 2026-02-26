import { Component, h } from "@stencil/core";
import { AppApiService } from "../../../services/app-api";

@Component({
  tag: 'user-login'
})
export class UserLogin {

  async hLogInClicked() {
    await AppApiService.login('', '');
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <div class='px-4 text-2xl'>Log In</div>
        </ion-toolbar>
      </ion-header>,
      <ion-content>
        <div class='flex col h-2/3 items-center justify-center'>
          <ion-button
            onClick={() => this.hLogInClicked()}
          >Log In</ion-button>
        </div>
      </ion-content>
    ]
  }
}