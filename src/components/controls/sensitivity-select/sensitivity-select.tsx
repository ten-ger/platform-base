import { Component, h, Prop } from "@stencil/core";

@Component({
  tag: 'sensitivity-select'
})
export class SensitivitySelect {

  @Prop() enabled: boolean = true;
  @Prop() width: string = '150px';
  @Prop() selectedOption: '-1' | '0' | '1';

  render() {
    return [
      <div class='flex row items-center justify-between' style={{ width: this.width }}>
        <ion-button title="Sensitivity: Less"
          disabled={!this.enabled} 
          fill={this.selectedOption == '-1' ? 'solid' : 'clear'}>
          <ion-icon slot='icon-only' name='remove-outline' />
        </ion-button>
        <ion-button title="Sensitivity: Default"
          disabled={!this.enabled} 
          fill={this.selectedOption == '0' ? 'solid' : 'clear'}>
          <ion-icon slot='icon-only' name='reorder-two-outline' />
        </ion-button>
        <ion-button title="Sensitivity: More"
          disabled={!this.enabled} 
          fill={this.selectedOption == '1' ? 'solid' : 'clear'}>
          <ion-icon slot='icon-only' name='reorder-three-outline' />
        </ion-button>
      </div>
    ]
  }
}