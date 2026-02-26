import { Component, h, Event, EventEmitter, Method, Prop, State } from "@stencil/core";
import { formatDate } from "../../../utils/helpers";

@Component({
  tag: 'date-select'
})
export class DateSelect {

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
  /**
   * The function to use for validating the field value.
   */
  @Prop() validationFunction: Function;
  /**
   * The message to display as an error if field validation fails.
   */
  @Prop() validationMessage: string;
  /**
  * The min value of the field.
  */
  @Prop() min: string;
  /**
  * The max value of the field.
  */
  @Prop() max: string;
  /**
  * The default value of the field.
  */
  @Prop() value: string;
  /**
  * Metadata returned with events, along with 'value' property.
  */
  @Prop() field: any;

  @State() placeholderValue: string;
  @State() fieldValue: string;
  @State() validationError: string;

  private popoverEl: HTMLIonPopoverElement;

  async componentWillLoad() {
    this.fieldValue = this.value;
    this.placeholderValue = this.placeholder && this.placeholder.length > 0
      ? this.placeholder
      : this.required ? 'Required' : '';
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

    if ((!this.fieldValue || this.fieldValue == 'Invalid Date') && this.required) {
      this.validationError = 'Required field.'
    }
    else if (this.validationFunction) {
      this.validationError = (!await this.validationFunction(this.fieldValue))
        ? this.validationMessage
        : undefined;
    }
    else {
      try {
        new Date(this.fieldValue);
        this.validationError = '';
      }
      catch (err) {
        this.validationError = 'Invalid date format.'
      }
    }

    return !(await this.hasError());
  }

  async handleValueChanged(event: any) {

    if (!event || !event.detail) { return }

    try {
      this.fieldValue = formatDate(event.detail.value);
    }
    catch (error) {
      console.log('Invalid date format', error);
    }

    if (await this.validate()) {
      this.valueChanged.emit({
        field: this.field,
        value: this.fieldValue
      });
    }
  }

  async handleSelectDateClicked(event: any) {

    await this.popoverEl.present(event);
    this.popoverEl.onDidDismiss().then(()=>this.popoverEl.isOpen = false)
  }

  render() {
    return [
      <ion-item>
        <ion-label position='stacked'
                   color='medium'>
          {this.labelText}
        </ion-label>
        <ion-input 
          disabled={!this.enabled}
          placeholder={this.placeholderValue}
          value={this.fieldValue}
          readonly={this.readonly}
          debounce={this.debounce}
          onIonChange={(e)=>this.handleValueChanged(e)} />
        {this.enabled && !this.readonly && [
          <ion-buttons slot='end' style={{ marginTop: '0'}}>
            <ion-button color='medium' fill='clear' 
                        onClick={(e)=>this.handleSelectDateClicked(e)}>
              <ion-icon slot='icon-only' name='calendar-outline' />
            </ion-button>
          </ion-buttons>,
          <ion-popover style={{ '--width': '300px' }}
                       ref={(el)=>this.popoverEl = el} reference="trigger"
                       alignment="center" side="bottom"
                       backdropDismiss 
                       onDidDismiss={()=>this.popoverEl.isOpen = false}>
            <ion-content>
              <ion-datetime presentation='date' min={this.min} max={this.max}
                            onIonChange={(e)=>this.handleValueChanged(e)} />
              <ion-button fill='solid' size='small' expand="full"
                          onClick={()=>this.popoverEl.dismiss()}>
                Close
              </ion-button>
            </ion-content>
          </ion-popover>
        ]}
      </ion-item>,
      this.validationError && this.validationError.length > 0 &&
      <ion-note color='danger' style={{ marginLeft: '6px' }}>
        {this.validationError}
      </ion-note>
    ]
  }
}