import { Component, h, Event, EventEmitter, Method, Prop, State, Watch } from "@stencil/core";

@Component({
  tag: 'range-input'
})
export class RangeInput {

  @Event() valueChanged: EventEmitter;

  @Prop({ mutable: true }) value: number;
  @Prop() min: number = 0;
  @Prop() max: number = 100;
  @Prop() displayPin: boolean = true;
  @Prop() color: string = 'primary';
  @Prop() enabled: boolean = true;
  @Prop() labelText: string;
  @Prop() labelColor: string = 'medium';
  @Prop() lines: 'none' | 'full' | 'inset' = 'none';

  @State() fieldValue: number;

  async componentWillLoad() {
    this.fieldValue = this.value;
  }

  @Watch('value')
  async hValueChanged(event: any) {
    this.fieldValue = event;
  }

  @Method()
  async getValue() {
    return this.fieldValue;
  }

  @Method()
  async setValue(value: number) {
    this.fieldValue = value;
  }

  async handleValueChanged(event: any) {
    if (!this.enabled) { return }
    this.fieldValue = event.detail.value;

    this.valueChanged.emit({
      value: this.fieldValue
    });
  }

  render() {
    return [
      <ion-item lines={this.lines}>
        <ion-label position='stacked' color={this.labelColor} >
          {this.labelText} ({this.fieldValue})
        </ion-label>
        <ion-range
          color={this.color}
          disabled={!this.enabled}
          min={this.min}
          max={this.max}
          pin={this.displayPin}
          value={this.fieldValue || 0}
          onIonChange={(e) => this.handleValueChanged(e)}
        />
      </ion-item>
    ]
  }
}