import { Component, h, Element, Host, Prop } from "@stencil/core";

@Component({
  tag: 'material-icon',
  styleUrl: 'material-icon.css'
})
export class MaterialIcon {

  @Element() el: HTMLElement;

  @Prop() params: any;
  @Prop() iconName: string = 'visibility';
  @Prop() fontSize: string = '24px';
  @Prop() padding: string = '1px';
  @Prop() fill: number = 1;
  @Prop() weight: number = 400;
  @Prop() color: string = "#B2B2B2";
  @Prop() opticalSize: number = 24;

  async hClicked(event: any) {
    console.log('icon button clicked', event);
    console.log('params', JSON.stringify(this.params));
  }

  render() {
    return (
      <Host>
        <div
          style={{
            "font-variation-settings": `'FILL' ${this.fill}, 'wght' ${this.weight}, 'GRAD' 0, 'opsz' ${this.opticalSize}`,
            padding: this.padding,
          }}
          onClick={(e)=>this.hClicked(e)}
        >
          <span
            class="material-symbols-outlined icon-button"
            style={{
              fontSize: this.fontSize,
              color: this.color
            }}
          >
            {this.iconName}
          </span>
        </div>
      </Host>
    )
  }
}