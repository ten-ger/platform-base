import { Component, h, Event, EventEmitter, Prop, State } from "@stencil/core";

@Component({
  tag: 'collapsi-card'
})
export class CollapsiCard {

  /**
   * Emitted when card is collapsed.
   */
  @Event() collapse: EventEmitter;
  /**
   * Emitted when card is expanded.
   */
  @Event() expand: EventEmitter;

  /**
   * The text displayed in the card header.
   */
  @Prop() cardTitle: string;
  /**
   * The color of the text displayed in the card header.
   */
  @Prop() cardTitleColor: string;
  /**
   * If `true`, card will display as collapsed by default.
   */
  @Prop() collapsed: boolean;

  @State() isCollapsed: boolean;

  async componentWillLoad() {

    this.isCollapsed = this.collapsed;
  }

  async handleHeaderClicked() {
    this.isCollapsed = !this.isCollapsed;
    if (this.isCollapsed) {
      this.collapse.emit();
    }
    else {
      this.expand.emit();
    }
  }

  render() {
    return [
      <ion-card>
        <ion-card-header onClick={()=>this.handleHeaderClicked()}>
          <ion-item lines={this.isCollapsed ? 'none': 'full'} 
                    detail={false}>
            <ion-icon slot='start' color='medium' 
                      name={this.isCollapsed ? 'chevron-forward' : 'chevron-down'} />
            <div slot='start' style={{ margin: '0' }}>
              <slot name='header-start' />
            </div>
            <ion-label slot='start' color={this.cardTitleColor}>
              {this.cardTitle}
            </ion-label>
            <div slot='end' style={{ margin: '0' }}>
              <slot name='header-end' />
            </div>
          </ion-item>
        </ion-card-header>
        <ion-card-content style={{ display: this.isCollapsed ? 'none' : 'block' }}>
          <slot />
        </ion-card-content>
      </ion-card>
    ];
  }
}