import { Component, h, Listen, Prop, State } from "@stencil/core";
import { App } from "../../../services/app-state";
import { Log } from "../../../services/log";
import { Account, Environment, User } from "../../../interfaces/application";

@Component({
  tag: 'app-header-toolbar'
})
export class AppHeaderToolbar {

  @Prop() pageTitle: string;

  @State() isLargeView: boolean;
  @State() selectedEnvironment: Environment;
  @State() selectedAccount: Account;
  @State() currentUser: User;

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
    this.selectedEnvironment = App.getState("environment");
    this.selectedAccount = App.getState("account");
    this.currentUser = App.getState("user");
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
              <div class=''>
                {this.selectedAccount && [
                  <div style={{ marginRight: '4px' }}
                    title={this.selectedAccount.id.toString()}>
                    {this.selectedAccount.name}
                  </div>
                ]}
                {!this.selectedAccount && [
                  <div style={{ marginRight: '4px' }}>Login</div>
                ]}
              </div>
              <div class='flex row items-center justify-end gap-4'>
                {this.currentUser && [
                  <div style={{ marginRight: '4px' }}
                    title={this.currentUser["custom:user_id"]}>
                    {this.currentUser.email}
                  </div>
                ]}
                {this.selectedEnvironment && [
                  <div style={{ marginRight: '4px' }}
                    title={this.selectedEnvironment.id.toString()}>
                    [{this.selectedEnvironment.name}]
                  </div>
                ]}
              </div>
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