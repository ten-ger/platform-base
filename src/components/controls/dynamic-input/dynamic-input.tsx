import { TextFieldTypes } from "@ionic/core";
import { Component, h, Event, EventEmitter, Prop, State, Watch } from "@stencil/core";

@Component({
  tag: 'dynamic-input'
})
export class DynamicInput {

  @Event() valueChanged: EventEmitter;

  @Prop() labelText: string;
  @Prop() placeholder: string;
  @Prop() description: string;
  @Prop() required: boolean;
  @Prop() readonly: boolean;
  @Prop() enabled: boolean = true;
  @Prop() debounce: number = 250;
  @Prop({ mutable: true }) value: any;
  /** Field metadata/reference */
  @Prop() field: any; 

  @State() fieldValue: any;
  @State() validationError: string;

  async componentWillLoad() {
    this.fieldValue = this.value;
  }

  @Watch('value')
  hValueChanged(newValue: any) {
    this.fieldValue = newValue;
  }

  private emitChange(val: any) {
    this.fieldValue = val;
    this.valueChanged.emit({
      value: this.fieldValue,
      field: this.field
    });
  }

  // --- Specialized Renderers ---

  private renderToggle() {
    return (
      <toggle-input
        labelText={this.labelText}
        enabled={this.enabled}
        checked={!!this.fieldValue}
        onValueChanged={(e) => this.emitChange(e.detail.checked)}
      />
    )
  }

  private renderRange(min = 0, max = 100) {
    return (
      <range-input
        labelText={this.labelText}
        enabled={this.enabled}
        min={min} max={max}
        value={this.fieldValue || 0}
        onValueChanged={(e) => this.emitChange(e.detail.value)}
      />
    );
  }

  private renderDefaultInput() {
    const typeMetadata = this.getMetadataByType(this.field?.type);
    
    return (
      <ion-item style={{ '--background': 'transparent' }}>
        <ion-label position='stacked' color='medium'>
          {this.labelText}
        </ion-label>
        <ion-input
          type={typeMetadata.inputType as TextFieldTypes}
          inputmode={typeMetadata.inputMode as any}
          value={this.fieldValue}
          placeholder={this.placeholder || (this.required ? 'Required' : '')}
          disabled={!this.enabled}
          readonly={this.readonly}
          debounce={this.debounce}
          onIonInput={(e) => this.emitChange(e.detail.value)}
        >
          {typeMetadata.unit && (
            <div slot="end" style={{ color: "var(--ion-color-medium)" }}>
              {typeMetadata.unit}
            </div>
          )}
        </ion-input>
      </ion-item>
    );
  }

  private getMetadataByType(type: string) {
    const map: Record<string, { inputType: string, inputMode: string, unit?: string }> = {
      'KMH': { inputType: 'number', inputMode: 'decimal', unit: 'km/h' },
      'MPH': { inputType: 'number', inputMode: 'decimal', unit: 'mph' },
      'Celsius': { inputType: 'number', inputMode: 'decimal', unit: '°C' },
      'Percentage': { inputType: 'number', inputMode: 'decimal', unit: '%' },
      'Millivolts': { inputType: 'number', inputMode: 'numeric', unit: 'mV' },
      'Hex': { inputType: 'text', inputMode: 'text' },
      'Seconds': { inputType: 'number', inputMode: 'numeric', unit: 'sec' },
      'Floating Point': { inputType: 'number', inputMode: 'decimal' },
    };
    return map[type] || { inputType: 'text', inputMode: 'text' };
  }

  render() {
    const type = this.field?.type;

    // Dispatcher Logic
    let content;
    if (type === 'Binary') {
      content = this.renderToggle();
    }
    else if (['Percentage', 'Percentage', 'Throttle'].includes(type)) {
      content = this.renderRange();
    }
    else if (['MPH'].includes(type)) {
      content = this.renderRange(0, 120);
    }
    else if (['KMH'].includes(type)) {
      content = this.renderRange(0, 193);
    }
    else {
      content = this.renderDefaultInput();
    }

    return [
      content,
      (this.validationError || this.description) && (
        <ion-note 
          class="ion-margin-start"
          color={this.validationError ? 'danger' : 'medium'}
        >
          {this.validationError || this.description}
        </ion-note>
      )
    ];
  }
}