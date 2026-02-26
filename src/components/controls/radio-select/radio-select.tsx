import { Component, h, Event, EventEmitter, Method, Prop, State, Watch } from '@stencil/core';

@Component({
  tag: 'radio-select'
})
export class RadioSelect {

  /**
   * Emitted when the field value is changed.
   */
  @Event() valueChanged: EventEmitter;

  /**
   * The display text associated with the field. 
   */
  @Prop() labelText: string;
  /**
   * If `true`, the user cannot modify the value.
   */
  @Prop() readonly: boolean;
  /**
   * If `true`, the user must supply a value or a validation error is displayed.
   */
  @Prop() required: boolean;
  /**
   * The default text value of the field.
   */
  @Prop({ mutable: true }) value: any;
  /**
   * Metadata returned with events, along with 'value' property.
   */
  @Prop() field: any;
  /**
   * Property name used for option display values.
   */
  @Prop() displayPropertyName: string = 'name';
  /**
   * Property name used for option ID values.
   */
  @Prop() idPropertyName: string = 'id';
  /**
   * Select options.
   */
  @Prop({ mutable: true }) options: any[] = [];
  /**
   * Function to load select options.
   */
  @Prop() optionsFn: Function;
  /**
   * If `true`, the user can clear the selection.
   */
  @Prop() showClear: boolean;
  /**
   * If `true`, a line separator appears below the control.
   */
  @Prop() lines: 'none' | 'inset' | 'full' = 'none';

  @State() placeholderValue: string;
  @State() fieldValue: any;
  @State() validationError: string;

  async componentWillLoad() {
    this.fieldValue = this.value;
    if (this.optionsFn) {
      try {
        this.options = await this.optionsFn();
      }
      catch (err) {
        console.log('single-select: Error loading options: ', err);
        this.options = [];
      }
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
  async setValue(value: any) {
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
    else {
      this.validationError = '';
    }

    return !(await this.hasError());
  }

  getOptionDisplayValue() {
    if (!this.fieldValue) {
      return '';
    }
    let selectedOption = this.options
      .find(o => o[this.idPropertyName] == this.fieldValue);
    return selectedOption[this.displayPropertyName];
  }

  async handleValueChanged(event: any) {

    //TODO: Make this.fieldValue the entire option object
    // that was selected, not just the ID of the object
    this.fieldValue = event.detail.value;

    if (await this.validate()) {
      this.valueChanged.emit({
        field: this.field,
        value: this.fieldValue
      });
    }
  }

  async handleClearSelectionClicked() {
    await this.handleValueChanged({ detail: { value: undefined } });
  }

  render() {
    if (this.readonly) {
      return [
        <ion-item
          lines={this.lines}>
          <ion-label position='stacked'
            color='medium'>
            {this.labelText}
          </ion-label>
          <ion-input
            value={this.getOptionDisplayValue()}
            readonly={true} />
          <div slot='end'>
            <slot name='end' />
          </div>
        </ion-item>
      ]
    }
    return [
      <ion-list>
        <ion-radio-group
          value={this.fieldValue || undefined}
          onIonChange={(e) => this.handleValueChanged(e)}>
          {this.options.map(option =>
            <ion-item key={option[this.idPropertyName]} lines='none'>
              <ion-radio label-placement='end' justify='start'
                value={option[this.idPropertyName]}>
                {option[this.displayPropertyName]}
              </ion-radio>
            </ion-item>
          )}
        </ion-radio-group>
      </ion-list>
      // <div class='flex col width-full'>
      //   <ion-item style={{ '--background': 'transparent' }}
      //     lines={this.lines}>
      //     <ion-label position='stacked'
      //       color='medium'>
      //       {this.labelText}
      //     </ion-label>
      //     {this.showClear &&
      //       <ion-buttons slot='end'
      //         style={{
      //           margin: '0',
      //           transform: "translate(10px, 8px)"
      //         }}>
      //         <ion-button color='medium' fill='clear'
      //           onClick={() => this.handleClearSelectionClicked()}>
      //           <ion-icon slot='icon-only' name='close-outline' />
      //         </ion-button>
      //       </ion-buttons>
      //     }
      //   </ion-item>

      //   {this.validationError && this.validationError.length > 0 &&
      //     <ion-note color='danger' style={{ marginLeft: '6px' }}>
      //       {this.validationError}
      //     </ion-note>
      //   }
      // </div>
    ]
  }
}