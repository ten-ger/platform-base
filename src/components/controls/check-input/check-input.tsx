import { Component, h, Event, EventEmitter, Method, Prop, State } from "@stencil/core";

@Component({
  tag: 'check-input'
})
export class CheckInput {

  @Event() valueChanged: EventEmitter;

  @Prop({ mutable: true }) checked: boolean;
  @Prop() color: string = 'primary';
  @Prop() enabled: boolean = true;
  @Prop() labelText: string;
  @Prop() labelColor: string = 'medium';
  @Prop() lines: 'none' | 'full' | 'inset' = 'none';

  @State() isChecked: boolean;

  async componentWillLoad() {
    this.isChecked = this.checked;
  }

  @Method()
  async getValue() {
    return this.isChecked;
  }

  @Method()
  async setValue(value: boolean) {
    this.isChecked = value;
  }

  async handleValueChanged(event: any) {
    if (!this.enabled) { return }
    this.isChecked = event.detail.checked;

    this.valueChanged.emit({
      value: this.isChecked
    });
  }

  render() {
    return [
      <ion-item lines={this.lines}>
        <ion-checkbox
          slot='start'
          color={this.color}
          checked={this.isChecked}
          disabled={!this.enabled}
          onIonChange={(e)=>this.handleValueChanged(e)}
        />
        <ion-label
          color={this.labelColor}
          onClick={()=>this.handleValueChanged({detail:{checked:!this.isChecked}})}
        >
          {this.labelText}
        </ion-label>
      </ion-item>
    ]
  }
}