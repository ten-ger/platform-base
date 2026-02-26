import { Component, h, Event, EventEmitter, Method, Prop, State } from "@stencil/core";

@Component({
  tag: 'search-content',
  styleUrl: 'search-content.css',
})
export class SearchContent {

  @Event() valueChanged: EventEmitter;
  @Event() valueCleared: EventEmitter;

  @Prop() idPropertyName: string = 'id';
  @Prop() displayPropertyName: string = 'name';
  @Prop() maxOptions: number = 5;
  @Prop() defaultOptions: Function;
  @Prop() searchOptions: Function;
  @Prop() placeholder: string = "Search";
  @Prop() multiple: boolean;
  @Prop() defaultValue: any;
  @Prop() showSelectedFirst: boolean;

  @State() options: any[] = [];
  @State() selected: any;

  private searchBarElem: HTMLIonSearchbarElement;

  async componentWillLoad() {
    let initialOptions = this.defaultOptions ? await this.defaultOptions() : [];

    if (this.multiple) {
      this.selected = [];
    } else {
      this.selected = null;
    }

    if (this.defaultValue) {
      if (this.multiple) {
        // Ensure this.selected is an array before pushing
        this.selected = Array.isArray(this.selected) ? [...this.selected] : [];
        for (let opt of this.defaultValue) {
          this.selected.push(opt);
        }
      } else {
        this.selected = this.defaultValue;
      }
    }

    if (this.showSelectedFirst && this.selected && (this.multiple ? this.selected.length > 0 : this.selected !== null)) {
      const selectedOnLoad = [];
      const unselectedOnLoad = [];

      initialOptions.forEach(option => {
        if (this.multiple) {
          // Check if option is in the initially selected array
          if (Array.isArray(this.selected) && this.selected.some(s => s[this.displayPropertyName] === option[this.displayPropertyName])) {
            selectedOnLoad.push(option);
          } else {
            unselectedOnLoad.push(option);
          }
        } else {
          // Check if option is the initially selected single value
          if (this.selected && this.selected[this.displayPropertyName] === option[this.displayPropertyName]) {
            selectedOnLoad.push(option);
          } else {
            unselectedOnLoad.push(option);
          }
        }
      });
      this.options = [...selectedOnLoad, ...unselectedOnLoad];
    } else {
      this.options = initialOptions;
    }
  }

  @Method()
  async clear() {
    if (this.multiple) {
      this.selected = [];
    } else {
      this.selected = null;
    }
    this.searchBarElem.value = '';
    this.options = this.defaultOptions ? await this.defaultOptions() : [];
  }

  async hSearchChanged(event: any) {
    event.stopPropagation();
    this.options = await this.searchOptions(event.detail.value);
  }

  async hSearchCleared(event: any) {
    event.stopPropagation();
    this.options = await this.defaultOptions();
  }

  async hOptionSelected(option: any) {
    if (this.multiple) {
      if (this.isOptionSelected(option)) {
        this.selected = this.selected?.filter(s => s[this.displayPropertyName] != option[this.displayPropertyName]);
      }
      else {
        this.selected = [...this.selected, option];
      }
      this.valueChanged.emit(this.selected);
    }
    else {
      this.selected = option;
      this.valueChanged.emit(option);
    }
  }

  isOptionSelected(option: any) {
    if (this.multiple) {
      return this.selected?.find(s => s[this.displayPropertyName] == option[this.displayPropertyName]);
    }
    else {
      return this.selected?.[this.displayPropertyName] == option[this.displayPropertyName];
    }
  }

  // render() {
  //   return [
  //     <div class="search-container">
  //       <div class='flex row'>
  //         <ion-searchbar
  //           ref={(el) => this.searchBarElem = el}
  //           debounce={200}
  //           placeholder={this.placeholder}
  //           onIonInput={(e) => this.hSearchChanged(e)}
  //           onIonClear={(e) => this.hSearchCleared(e)} />
  //         <slot name='searchbar-end' />
  //       </div>
  //       {this.options?.length > 0 &&
  //         <div class="results-container">
  //           <ion-list>
  //             {this.options?.map(option =>
  //               <ion-item
  //                 id={option[this.idPropertyName]}
  //                 key={option[this.idPropertyName]}
  //                 button
  //                 onClick={() => this.hOptionSelected(option)}
  //               >
  //                 {this.multiple &&
  //                   <ion-checkbox
  //                     slot='start'
  //                     checked={this.isOptionSelected(option)}
  //                   />
  //                 }
  //                 {option[this.displayPropertyName]}
  //                 {!this.multiple && this.isOptionSelected(option) &&
  //                   <ion-icon slot='end' name='checkmark' />
  //                 }
  //               </ion-item>
  //             )}
  //           </ion-list>
  //         </div>
  //       }
  //     </div>
  //   ];
  // }

  render() {
    return [
      <div style={{ maxHeight:'400px' }}>
        <div style={{
          margin: '0', padding: '0',
          display: 'flex', flexDirection: 'column'
        }}>
          <div class='flex row'>
            <ion-searchbar
              debounce={200}
              onIonInput={(e) => this.hSearchChanged(e)}
              onIonClear={(e) => this.hSearchCleared(e)} />
            <slot name='searchbar-end' />
          </div>
          <div>
            <ion-list>
              {this.options?.map(option =>
                <ion-item
                  id={option[this.idPropertyName]}
                  key={option[this.idPropertyName]}
                  button
                  onClick={()=>this.hOptionSelected(option)}
                >
                  {this.multiple &&
                    <ion-checkbox 
                      slot='start'
                      checked={this.isOptionSelected(option)}
                    />
                  }
                  {option[this.displayPropertyName]}
                  {!this.multiple && this.isOptionSelected(option) &&
                    <ion-icon slot='end' name='checkmark' />
                  }
                </ion-item>
              )}
            </ion-list>
          </div>
        </div>
      </div>
    ]
  }
}