import { Component, h, Listen, Prop, State } from "@stencil/core";
import { App } from "../../../services/app-state";
import { Log } from "../../../services/log";

@Component({
  tag: 'app-header-toolbar'
})
export class AppHeaderToolbar {

  @Prop() pageTitle: string;

  @State() isLargeView: boolean;

  async componentWillLoad() {
    try {
      this.isLargeView = ['lg', 'xl'].includes(App.getViewportSize(document.body.clientWidth));
      this.setFromAppState();
    }
    catch (error) {
      Log.error('Error initializing page', error);
    }
  }

  @Listen('viewportSizeChanged', { target: 'document' })
  viewportSizeChangedHandler(event: CustomEvent<ViewportSize>) {
    this.isLargeView = ['lg', 'xl'].includes(event.detail);
  }

  @Listen('accountChanged', { target: 'window' })
  async hAccountChanged(_event: any) {
    this.setFromAppState();
  }
  
  setFromAppState() {
  }

  render() {
    return [
      <ion-toolbar class='px-4'>
        {!this.isLargeView &&
          <ion-menu-button slot='start' menu='start' />
        }
        <div slot='start' class={this.isLargeView ? 'title pad-x-16' : 'title'}>
          {this.pageTitle}
        </div>
        {this.isLargeView &&
          <div slot='end' class='flex row items-center' style={{ marginRight: '16px' }}>
            <div class='flex col justify-end' style={{ fontSize: 'small' }}>
              
            </div>
            <account-select-button />
          </div>
        }
        <div slot='end'>
          <slot name='end' />
        </div>
      </ion-toolbar>
    ]
  }
}