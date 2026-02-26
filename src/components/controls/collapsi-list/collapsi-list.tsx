import { Component, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'collapsi-list',
  styles: `
    .toggle-header { cursor: pointer; --min-height: 48px; }
    .toggle-header:hover { --background: var(--ion-color-step-50); }
    .list-content { overflow: hidden; transition: max-height 0.3s ease-out; }
  `
})
export class CollapsiList {

  @Prop() headerText: string = "Advanced";

  @State() isExpanded: boolean = false;

  private toggle = () => {
    this.isExpanded = !this.isExpanded;
  }

  render() {
    return (
      <ion-list>
        <div class='flex row' style={{ borderBottom: '1px solid var(--ion-border-color)' }}>
          <ion-list-header
            class="toggle-header"
            onClick={this.toggle}
            lines="none"
          >
            <ion-label color="primary">
              {this.headerText}
            </ion-label>
          </ion-list-header>
          <ion-button fill="clear" slot="end">
            <ion-icon
              slot="icon-only"
              name={this.isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            />
          </ion-button>
        </div>

        <div style={{ display: this.isExpanded ? 'block' : 'none' }}>
          <slot />
        </div>
      </ion-list>
    );
  }
}