import { Component, h, Event, EventEmitter, Prop, State } from "@stencil/core";

@Component({
  tag: 'toggle-icon-buttons'
})
export class ToggleIconButtons {

  @Event() buttonClicked: EventEmitter;

  @Prop() btn1IconName: string;
  @Prop() btn2IconName: string;
  @Prop() default: string;
  @Prop() color = 'medium';
  @Prop() size = 'default';
  @Prop() padding = '1px';

  @State() selected: string;

  async componentWillLoad() {
    this.selected = this.default || this.btn1IconName;
  }

  async hBtnClicked(event: any, buttonId: string) {
    event.stopPropagation();
    this.selected = buttonId;
    this.buttonClicked.emit({
      value: this.selected
    });
  }

  render() {
    return [
      <div class='flex row items-center'
        style={{
          border: `2px solid var(--ion-color-${this.color})`,
          borderRadius: '4px'
        }}
      >
        <div class='flex row items-center justify-center'
          style={{
            backgroundColor: this.selected === this.btn1IconName ? `var(--ion-color-${this.color})` : 'transparent'
          }}
          onClick={(e) => this.hBtnClicked(e, this.btn1IconName)}
        >
          <material-icon 
            fontSize='24px'
            padding={this.padding}
            iconName={this.btn1IconName} 
            color={this.selected === this.btn1IconName ? 'var(--ion-color-primary-contrast)' : `rgba(var(--ion-color-${this.color}-rgb),.25)`}
          />
        </div>
        <div class='flex row items-center justify-center'
          style={{
            backgroundColor: this.selected === this.btn2IconName ? `var(--ion-color-${this.color})` : 'transparent'
          }}
          onClick={(e) => this.hBtnClicked(e, this.btn2IconName)}
        >
          <material-icon 
            fontSize='24px'
            padding={this.padding}
            iconName={this.btn2IconName} 
            color={this.selected === this.btn2IconName ? 'var(--ion-color-primary-contrast)' : `rgba(var(--ion-color-${this.color}-rgb),.25)`}
          />
        </div>
      </div>
    ]
  }
}