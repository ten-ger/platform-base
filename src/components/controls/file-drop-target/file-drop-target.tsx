import { Component, h, Event, EventEmitter, State, Prop } from "@stencil/core";
import { parse } from 'papaparse';

@Component({
  tag: 'file-drop-target'
})
export class FileDropTarget {

  @Event() fileDropped: EventEmitter;

  @Prop() fileTypeDescription: string = '';
  @Prop() fileType: string = '';
  @Prop() showFileInput: boolean;
  @Prop() buttonSize: 'default' | 'small' = 'small';
  @Prop() returnFileContents: boolean;
  @Prop() convertToJson: boolean;
  @Prop() fontColor: string = 'var(--ion-color-medium)';
  @Prop() borderColor: string = 'var(--ion-color-secondary)';
  @Prop() borderColorHighlighted: string = 'var(--ion-color-medium)';
  @Prop() minHeight: string = '100px';

  @State() isHighlighted: boolean;

  inputElem: HTMLInputElement;
  
  async handleDragEnter(event: any) {

    event.preventDefault();
    this.isHighlighted = true;
  }

  async handleDragLeave(event: any) {

    event.preventDefault();
    this.isHighlighted = false;
  }

  async handleDragOver(event: any) {

    event.preventDefault();
  }

  async handleDrop(event: any) {

    event.preventDefault();
    this.isHighlighted = false;
    
    const dropItems = event.dataTransfer.items;

    if (dropItems && dropItems.length > 0 && dropItems[0].kind === 'file') {

      let file = dropItems[0].getAsFile();

      if (this.returnFileContents) {

        await this.readFile(file);
      }
      else {

        this.fileDropped.emit({
          file: file
        });
      }
    }
  }

  async readFile(file: any) {
    if (this.convertToJson) {
      parse(file, {
        header: true,
        transformHeader: (hdr, _idx) => { return hdr.trim() },
        // REMOVED the 'transform' option here.
        // The previous 'transform' function was forcing all values to strings,
        // which prevents dynamicTyping from working.
        skipEmptyLines: true,
        dynamicTyping: true, // <--- ADDED: This option tells Papa Parse to automatically
                             //            convert numeric and boolean values to their
                             //            respective types instead of keeping them as strings.
        complete: (results) => {
          this.fileDropped.emit({
            data: results.data
          });
        }
      });
    }
    else {
      const reader = new FileReader();
      reader.onload = (event) => {
        this.fileDropped.emit({
          data: event.target.result
        });
      }
      reader.readAsText(file);
    }
  }

  // async readFile(file: any) {

  //   if (this.convertToJson) {

  //     parse(file, {
  //       header: true,
  //       transformHeader: (hdr, _idx) => { return hdr.trim() },
  //       transform: (val, _idx) => { return val.replaceAll('"', '\"').replaceAll('\t', '\\t').trim(); },
  //       skipEmptyLines: true,
  //       complete: (results) => {
          
  //         this.fileDropped.emit({
  //           data: results.data
  //         })
  //       }
  //     });
  //   }
  //   else {

  //     const reader = new FileReader();
  //     reader.onload = (event) => {

  //       this.fileDropped.emit({
  //         data: event.target.result
  //       });
  //     }
  //     reader.readAsText(file);
  //   }
  // }

  async handleBrowseClicked() {

    this.inputElem.click();
  }

  async handleFileSelected(event: any) {

    if (!event || !event.target || !event.target.files || !event.target.files[0]) { return; }

    let selectedFile = event.target.files[0] as File;
    
    if (this.returnFileContents) {

      await this.readFile(selectedFile);
    }
    else {

      this.fileDropped.emit({
        file: selectedFile
      });
    }
  }

  render() {
    return [
      <div style={{ border: `${ this.isHighlighted ? `5px dashed ${this.borderColorHighlighted}` : `5px dashed ${this.borderColor}`}`, 
                    borderRadius: '10px', color: `${this.fontColor}`,
                    margin: '10px', minHeight: `${this.minHeight}`, 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
           onDragEnter={(e)=>this.handleDragEnter(e)}
           onDragLeave={(e)=>this.handleDragLeave(e)}
           onDrop={(e)=>this.handleDrop(e)}
           onDragOver={(e)=>this.handleDragOver(e)}>
        <div>Drop {this.fileType}{this.fileTypeDescription ? ` ${this.fileTypeDescription} ` : ' '}file here</div>
        {this.showFileInput && [
          <ion-button color='medium' fill='outline' size={this.buttonSize} onClick={()=>this.handleBrowseClicked()}>
            or browse for file
          </ion-button>,
          <input ref={(el)=>this.inputElem = el} type="file" accept={`.${this.fileType.toLowerCase()}`}
                 style={{ visibility: 'hidden', height: '0' }}
                 onChange={(e)=>this.handleFileSelected(e)} />
        ]}
      </div>
    ]
  }
}