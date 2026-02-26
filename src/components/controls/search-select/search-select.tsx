import { Component, h, Event, EventEmitter, Listen, Prop, State } from "@stencil/core";
import { PopoverService } from "../../../services/popover";
import { Log } from "../../../services/log";
import { App } from "../../../services/app-state";
import { ModalService } from "../../../services/modal";

@Component({
  tag: 'search-select'
})
export class SearchSelect {

  @Event() valueChanged: EventEmitter;
  @Event() valueCleared: EventEmitter;

  @Prop() enabled: boolean = true;
  @Prop() required: boolean;
  @Prop() labelText: string;
  @Prop() placeholder: string;
  @Prop() defaultOptions: Function;
  @Prop() searchOptions: Function;
  @Prop() idPropertyName: string = 'id';
  @Prop() displayPropertyName: string = 'name';
  @Prop() multiple: boolean;
  @Prop() showClear: boolean;
  @Prop() lines: "full" | "inset" | "none" = "inset";
  @Prop() value: any; // default value, assumed to be an object

  @State() viewportSize: ViewportSize;
  @State() placeholderValue: string;
  @State() fieldValue: any;
  @State() displayValue: any;
  @State() searchValue: string;
  @State() validationError: string;

  private inputElem: HTMLIonInputElement;

  async componentWillLoad() {
    this.viewportSize = App.getState('viewportSize');
    this.placeholderValue = this.placeholder && this.placeholder.length > 0
      ? this.placeholder
      : this.required ? 'Required' : '';
    if (this.value) {
      try {
        this.fieldValue = this.value;
        this.displayValue = this.value[this.displayPropertyName];
      } catch (err) {}
    }
  }

  async componentDidLoad() {
    try {
      this.inputElem.focus();
    } catch (e) {}
  }

  @Listen('viewportSizeChanged', { target: 'body' })
  async handleViewportSizeChanged(event?: any) {
    this.viewportSize = (!event || !event.detail)
      ? App.getState('viewportSize')
      : event.detail.viewportSize;
  }

  async hSearchChanged(event: any) {
    event.stopPropagation();
    this.searchValue = event.detail.value;
  }

  async hSearchCleared(event: any) {
    event.stopPropagation();
    this.searchValue = null;
  }

  async hOptionSelected(event: any) {
    this.fieldValue = event.detail;
    if (this.multiple) {
      this.displayValue = event.detail?.map(o => o[this.displayPropertyName]);
    }
    else {
      this.displayValue = event.detail[this.displayPropertyName];
  
      // Based on viewport size, dismiss either popover or modal
      if (['xs','sm','md'].includes(this.viewportSize)) {
        await ModalService.dismiss();
      }
      else {
        await PopoverService.dismiss();
      }
    }
    this.valueChanged.emit(this.fieldValue);
  }

  async hInputClicked(event: any) {
    Log.debug('search-select hInputClicked', event);
    event.stopPropagation();
    if (!this.enabled) { return }
    let content = <search-content
      multiple={this.multiple}
      idPropertyName={this.idPropertyName}
      displayPropertyName={this.displayPropertyName}
      defaultOptions={this.defaultOptions}
      searchOptions={this.searchOptions}
      defaultValue={this.fieldValue}
      onValueChanged={(e)=>this.hOptionSelected(e)} />
      
    // Based on viewport size, show either popover or modal
    if (['xs','sm','md'].includes(this.viewportSize)) {
      const modal = await ModalService.create({
        component: 'modal-content',
        componentProps: {
          content: content
        },
        backdropDismiss: true,
        showBackdrop: true
      });

      await modal.present();
    }
    else {
      
      const popover = await PopoverService.create({
        component: 'popover-content',
        componentProps: {
          content: content
        },
        backdropDismiss: true,
        showBackdrop: false,
        side: 'bottom',
        alignment: 'start',
        cssClass: 'popover-large',
        event: event
      });
  
      await popover.present();
    }
  }

  async hInputDownBtnClicked(event: any) {
    event.stopPropagation();
    this.inputElem.click();
  }

  async hClearClicked(event: any) {
    event.stopPropagation();
    this.fieldValue = null;
    this.displayValue = null;
    this.valueCleared.emit();
  }

  render() {
    return [
      <ion-item 
        style={{ '--background': 'transparent' }}
        lines={this.lines}
      >
        <ion-label position='stacked'
                   color='medium'>
          {this.labelText}
        </ion-label>
        <ion-input 
          ref={(el)=>this.inputElem = el}
          readonly
          placeholder={this.placeholderValue}
          onClick={(e)=>this.hInputClicked(e)}
          value={this.displayValue}
        />
        <ion-buttons
          slot='end'
        >
          <ion-button
            onClick={(e)=>this.hInputDownBtnClicked(e)}
          >
            <ion-icon slot='icon-only' name='chevron-down' />
          </ion-button>
          {this.showClear && this.fieldValue &&
            <ion-button
              onClick={(e)=>this.hClearClicked(e)}
            >
              <ion-icon slot='icon-only' name='close-outline' />
            </ion-button>
          }
        </ion-buttons>
      </ion-item>,
      this.validationError && this.validationError.length > 0 &&
      <ion-note color='danger' style={{ marginLeft: '6px' }}>
        {this.validationError}
      </ion-note>
    ]
  }
}