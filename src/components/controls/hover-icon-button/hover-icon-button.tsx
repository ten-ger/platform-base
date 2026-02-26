import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'hover-icon-button',
  styleUrl: 'hover-icon-button.css'
})
export class HoverIconButton {

  @Event() buttonClick: EventEmitter;
  
  @Prop() iconName: string;
  @Prop() startOpacity: number = 0.4;
  @Prop() btnSize: 'small' | 'default' | 'large' = 'default';
  @Prop() btnColor: string = 'medium';
  @Prop() btnFill: 'clear' | 'outline' | 'solid' | 'default' = 'clear';
  @Prop() btnTitle: string;
  @Prop() btnClass: string;

  private handleClick = (event: MouseEvent) => {
    event.stopPropagation();
    this.buttonClick.emit(event);
  }

  render() {
    return (
      <ion-button
        class={this.btnClass}
        size={this.btnSize}
        color={this.btnColor}
        fill={this.btnFill}
        title={this.btnTitle}
        onClick={this.handleClick}
      >
        <ion-icon
          slot="icon-only"
          name={this.iconName}
          style={{ opacity: this.startOpacity.toString() }}
        />
      </ion-button>
    );
  }
}