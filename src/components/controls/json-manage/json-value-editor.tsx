import { Component, Prop, h, Event, EventEmitter } from '@stencil/core';

type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

@Component({
  tag: 'json-value-editor',
  styleUrl: 'json-value-editor.css',
  shadow: true,
})
export class JsonValueEditor {
  @Prop() value: any;
  @Prop() type!: JsonType;
  @Prop() readonly: boolean = false;

  @Event() valueChange: EventEmitter<any>;

  private handleInputChange = (e: any) => {
    let val = e.detail.value;
    
    if (this.type === 'number') {
      val = parseFloat(val);
      if (isNaN(val)) val = 0;
    }
    
    this.valueChange.emit(val);
  }

  private handleCheckboxChange = (e: any) => {
    this.valueChange.emit(e.detail.checked);
  }

  render() {
    switch (this.type) {
      case 'string':
        return (
          <div class="json-value-editor">
            <ion-input
              value={this.value}
              type="text"
              onIonChange={this.handleInputChange}
              class="json-type-string"
              placeholder={this.readonly ? "" : "Enter string value"}
              readonly={this.readonly}
            />
          </div>
        );

      case 'number':
        return (
          <div class="json-value-editor">
            <ion-input
              value={this.value}
              type="number"
              onIonChange={this.handleInputChange}
              class="json-type-number"
              placeholder={this.readonly ? "" : "Enter number value"}
              readonly={this.readonly}
            />
          </div>
        );

      case 'boolean':
        return (
          <div class="json-value-editor type-boolean">
            <ion-checkbox
              checked={this.value}
              onIonChange={this.handleCheckboxChange}
              class="json-type-boolean"
              disabled={this.readonly}
            />
            <span class="type-boolean-label">{String(this.value)}</span>
          </div>
        );

      case 'null':
        return (
          <span class="json-value-editor json-type-null">null</span>
        );

      default:
        return (
          <span class="json-value-editor json-type-unknown">—</span>
        );
    }
  }
}