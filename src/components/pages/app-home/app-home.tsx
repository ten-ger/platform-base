import { Component, h } from "@stencil/core";

@Component({
  tag: 'app-home'
})
export class AppHome {

  render() {
    return [
      <ion-header>
        <app-header-toolbar pageTitle="Home" />
      </ion-header>,
      <ion-content class="ion-padding">
        <div>
          <div class="text-lg font-bold">Welcome.</div>
          <div class="font-light">It's nice to have you here.</div>
        </div>
      </ion-content>
    ]
  }
}