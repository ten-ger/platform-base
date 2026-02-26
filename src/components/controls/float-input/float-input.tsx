import { Component, h, Event, EventEmitter, Method, Prop, State, Watch } from "@stencil/core";
import { TextFieldTypes } from "@ionic/core";

@Component({
  tag: 'float-input'
})
export class FloatInput {

  /**
   * Emitted when the field value is changed.
   */
  @Event() valueChanged: EventEmitter;

  /**
   * Specifies the form control should have input focus when the page loads.
   */
  @Prop() autofocus: boolean;
  /**
  * If `false`, the user cannot interact with the field.
  */
  @Prop() enabled: boolean = true;
  /**
    * The amount of time, in milliseconds, to wait before `onValueChanged` is triggered.
    */
  @Prop() debounce: number = 250;
  /**
   * A hint to the browser for which keyboard to display.
   */
  @Prop() inputmode: "numeric" | undefined = "numeric";
  /**
   * The display text associated with the field. 
   */
  @Prop() labelText: string;
  /**
   * Hint text displayed when field value is empty. If no placeholder is supplied any field is required, then `Required` is displayed.
   */
  @Prop() placeholder: string;
  /**
   * Description of field and/or expected value.
   */
  @Prop() description: string;
  /**
   * If `true`, the user cannot modify the value.
   */
  @Prop() readonly: boolean;
  /**
   * If `true`, the user must supply a value or a validation error is displayed.
   */
  @Prop() required: boolean;
  /**
   * The type of control to display. The default is `number`.
   */
  @Prop() type: TextFieldTypes = 'number';
  /**
   * The function to use for validating the field value.
   */
  @Prop() validationFunction: Function;
  /**
   * The message to display as an error if field validation fails.
   */
  @Prop() validationMessage: string = 'Invalid input';
  /**
   * The default value of the field.
   */
  @Prop({ mutable: true }) value: number;
  /**
   * Metadata returned with events, along with 'value' property.
   */
  @Prop() field: any;

  @State() placeholderValue: string;
  @State() validationError: string;
  
  private fieldValue: number;

  async componentWillLoad() {
    this.fieldValue = this.value;
    this.placeholderValue = this.placeholder?.length > 0
      ? this.placeholder
      : this.required ? 'Required' : '';
  }

  async componentDidLoad() {
    if (this.fieldValue) {
      await this.setValue(this.fieldValue);
    }
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
  async setValue(value: number) {
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
      this.validationError = undefined;
    }
    return !(await this.hasError());
  }

  async handleValueChanged(event: any) {
    event.stopPropagation();
    this.fieldValue = event?.detail?.value ? parseFloat(event.detail.value) : undefined;

    if (await this.validate()) {
      this.valueChanged.emit({
        value: this.fieldValue
      });
    }
  }

  render() {
    return [
      <ion-item style={{ '--background': 'transparent' }}>
        <ion-label position='stacked' color='medium'>
          {this.labelText}
        </ion-label>
        <ion-input
          disabled={!this.enabled}
          type={this.type}
          inputmode={this.inputmode}
          autofocus={this.autofocus}
          placeholder={this.placeholderValue}
          readonly={this.readonly}
          debounce={this.debounce}
          value={this.fieldValue}
          onIonInput={(e) => this.handleValueChanged(e)}
        />
        <div slot='end'>
          <slot name='end' />
        </div>
      </ion-item>,
      (this.validationError?.length > 0 || this.description?.length > 0) &&
      <ion-note 
        color={this.validationError ? 'danger' : 'medium'} 
        style={{ marginLeft: '16px' }}
      >
        {this.validationError || this.description}
      </ion-note>
    ]
  }
}