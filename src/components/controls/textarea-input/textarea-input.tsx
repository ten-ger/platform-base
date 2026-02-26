import { Component, h, Event, EventEmitter, Method, Prop, State, Watch } from "@stencil/core";

@Component({
  tag: 'textarea-input'
})
export class TextareaInput {

  /**
   * Emitted when the field value is changed.
   */
   @Event() valueChanged: EventEmitter;

  /**
  * The amount of time, in milliseconds, to wait before `onValueChanged` is triggered.
  */
  @Prop() debounce: number = 250;
   /**
    * If `false`, the user cannot interact with the field.
    */
   @Prop() enabled: boolean = true;
   /**
    * The display text associated with the field. 
    */
   @Prop() labelText: string;
   /**
    * The fill style of the textarea.
    */
   @Prop() fill: string = 'outline';
   /**
    * Hint text displayed when field value is empty. If no placeholder is supplied any field is required, then `Required` is displayed.
    */
   @Prop() placeholder: string;
   /**
    * If `true`, the user cannot modify the value.
    */
   @Prop() readonly: boolean;
   /**
    * If `true`, the user must supply a value or a validation error is displayed.
    */
   @Prop() required: boolean;
   @Prop() rows: number = 3;
   /**
    * The function to use for validating the field value.
    */
   @Prop() validationFunction: Function;
   /**
    * The message to display as an error if field validation fails.
    */
   @Prop() validationMessage: string;
   /**
    * The default text value of the field.
    */
   @Prop({ mutable: true }) value: string;
   /**
    * Metadata returned with events, along with 'value' property.
    */
   @Prop() field: any;
 
  @State() placeholderValue: string;
  @State() fieldValue: string;
  @State() validationError: string;

  async componentWillLoad() {
    this.fieldValue = this.value;
    this.placeholderValue = this.placeholder && this.placeholder.length > 0
      ? this.placeholder
      : this.required ? 'Required' : '';
  }

  @Watch('value')
  async hValueChanged(event: any) {
    this.fieldValue = event;
  }

  /**
   * 
   * @returns Returns the current field value.
   */
   @Method()
   async getValue() {
     return this.fieldValue;
   }
 
   /**
    * Sets the value of the field.
    * @param value The field value.
    */
   @Method()
   async setValue(value: string) {
     this.fieldValue = value;
   }
 
   /**
    * Check if the field has a validation error.
    * @returns 'true' if the field has a validation error.
    */
   @Method()
   async hasError() {
     return this.validationError && this.validationError.length > 0;
   }
 
   /**
    * Validate the field value against requirements.
    * @returns the value of hasError().
    */
  @Method()
  async validate() {

    if (!this.fieldValue && this.required) {
      this.validationError = 'Required field.'
    }
    else if (this.validationFunction) {
      this.validationError = (!await this.validationFunction(this.fieldValue))
        ? this.validationMessage
        : undefined;
    }
    else {
      this.validationError = '';
    }

    return !(await this.hasError());
  }

  async handleValueChanged(event: any) {

    this.fieldValue = event.detail.value;

    if (await this.validate()) {
      this.valueChanged.emit({
        field: this.field,
        value: this.fieldValue
      });
    }
  }

  render() {
    return [
      <ion-item>
        <ion-label position='stacked'
                   color='medium'>
          {this.labelText}
        </ion-label>
        <ion-textarea style={{ paddingTop: '8px' }}
          disabled={!this.enabled}
          fill={this.fill}
          placeholder={this.placeholderValue}
          value={this.fieldValue}
          readonly={this.readonly}
          rows={this.rows}
          debounce={this.debounce}
          onIonInput={(e)=>this.handleValueChanged(e)} />
      </ion-item>,
      this.validationError && this.validationError.length > 0 &&
        <ion-note color='danger' style={{ marginLeft: '6px' }}>
          {this.validationError}
        </ion-note>
    ]
  }
}