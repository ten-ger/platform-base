import { Component, h, State } from '@stencil/core';
import { ModalService } from '../../../services/modal';

// Define the shape of the data being emitted
export interface NewJsonProperty {
    key: string;
    value: any;
    type: string;
}

// Define the event detail structure from custom wrapper components
type CustomInputEvent = CustomEvent<{ value: any }>;

@Component({
  tag: 'json-property-add'
})
export class JsonPropertyAdd {

  @State() keyName: string = '';
  @State() selectedType: string = 'string';
  @State() initialValue: any = '';

  // Options for the ion-select for property type
  private propertyTypes = [
    { name: 'String', id: 'string' },
    { name: 'Number', id: 'number' },
    { name: 'Boolean', id: 'boolean' },
    { name: 'Object', id: 'object' },
    { name: 'Array', id: 'array' },
    { name: 'Null', id: 'null' },
  ];

  private isKeyValid(): boolean {
      return !!this.keyName && this.keyName.trim().length > 0;
  }

  private isValueValid(): boolean {
      // If number is selected, ensure the value (which comes as a number from float-input) is valid
      if (this.selectedType === 'number' && typeof this.initialValue === 'number' && isNaN(this.initialValue)) {
        return false;
      }
      // The custom components handle their own `required` validation, but for complex types, 
      // we only validate the key.
      return true;
  }

  private isSaveDisabled(): boolean {
    return !this.isKeyValid() || !this.isValueValid();
  }

  /**
   * Parses the input value based on the selected type for the final save.
   */
  private getTypedValue(inputValue: any, type: string): any {
    switch (type) {
      case 'number':
        // float-input should pass a number, but ensure it's valid
        return typeof inputValue === 'number' && !isNaN(inputValue) ? inputValue : 0;
      case 'boolean':
        // check-input passes a boolean
        return !!inputValue; 
      case 'null':
        return null;
      case 'object':
        return {};
      case 'array':
        return [];
      case 'string':
      default:
        return String(inputValue || '');
    }
  }

  // --- Handlers ---

  private async hSaveClicked() {
    const finalValue = this.getTypedValue(this.initialValue, this.selectedType);
    
    const newProperty: NewJsonProperty = {
      key: this.keyName.trim(),
      value: finalValue,
      type: this.selectedType,
    };
    
    await ModalService.dismiss(newProperty, 'save');
  }

  private hTypeChanged(event: any) {
    const newType = event.detail.value;
    this.selectedType = newType;
    
    // Reset initial value based on new type for a guided experience
    if (newType === 'number') {
        this.initialValue = 0;
    } else if (newType === 'boolean') {
        this.initialValue = false;
    } else if (newType === 'null') {
        this.initialValue = null;
    } else {
        // Includes 'string', 'object', 'array'
        this.initialValue = (newType === 'string') ? '' : null;
    }
  }
  
  // Handler for custom <text-input> and <float-input> 'valueChanged' event
  private hValueChanged(event: CustomInputEvent) {
      this.initialValue = event.detail.value;
  }

  // --- Renderers ---

  private renderValueInput() {
    switch (this.selectedType) {
      case 'string':
        return (
          <text-input
            labelText="Initial Value"
            placeholder="Enter string value"
            value={this.initialValue}
            onValueChanged={this.hValueChanged.bind(this)}
            type='text'
          />
        );
      case 'number':
        return (
          <float-input
            labelText="Initial Value"
            placeholder="Enter number value"
            value={this.initialValue}
            onValueChanged={this.hValueChanged.bind(this)}
          />
        );
      case 'boolean':
        return (
          <check-input
            lines="none"
            labelText="Initial Value"
            checked={this.initialValue}
            onValueChanged={this.hValueChanged.bind(this)} // valueChanged emits { value: boolean }
          />
        );
      case 'object':
        return (
          <ion-item lines="none">
            <ion-label color="medium">Initial Value: **Empty Object** (`{}`) </ion-label>
          </ion-item>
        );
      case 'array':
        return (
          <ion-item lines="none">
            <ion-label color="medium">Initial Value: **Empty Array** (`[]`) </ion-label>
          </ion-item>
        );
      case 'null':
        return (
          <ion-item lines="none">
            <ion-label color="medium">Initial Value: **Null**</ion-label>
          </ion-item>
        );
      default:
        return null;
    }
  }

  render() {
    return [
      <ion-header>
        <ion-toolbar>
          <ion-button slot='start' color='medium' fill='clear' onClick={() => ModalService.dismiss(null, 'cancel')}>
            <ion-icon slot='icon-only' name='close-outline' />
          </ion-button>
          <div slot='start' class='ion-padding-start'>Add New JSON Property</div>
          <ion-button slot='end' style={{ marginRight: '16px' }}
            disabled={this.isSaveDisabled()}
            onClick={() => this.hSaveClicked()}
          >
            Save
          </ion-button>
        </ion-toolbar>
      </ion-header>,
      <ion-content class='ion-padding'>
        <ion-list lines='full'>
          
          {/* Use text-input for the key name */}
          <text-input
            labelText="Property Key"
            placeholder="e.g., vehicle_id or sensor_list"
            value={this.keyName}
            onValueChanged={(e: CustomInputEvent) => this.keyName = e.detail.value}
            required={true}
          ></text-input>
          
          {/* Use ion-select for property type selection */}
          <single-select
            labelText='Property Type'
            placeholder='Select Type'
            options={this.propertyTypes}
            idPropertyName='id'
            displayPropertyName='name'
            value={this.selectedType}
            onValueChanged={(e) => this.hTypeChanged(e)}
          />
          
          {/* Render the appropriate input based on the selected type */}
          {this.renderValueInput()}

        </ion-list>
      </ion-content>
    ];
  }
}