import { Component, h, Prop } from "@stencil/core";

export interface GridButton {
  text: string,
  iconName: string,
  clickHandler: Function
}

@Component({
  tag: 'grid-button-menu'
})
export class GridButtonMenu {

  @Prop() buttons: GridButton[];

  render() {
    return [
      <div class='flex row items-center' style={{ marginTop: '6px' }}>
        {this.buttons?.map(button =>
          <material-icon 
            title={button.text} 
            iconName={button.iconName} 
            onClick={(e)=>button.clickHandler(e)}
          />
        )}
      </div>
    ]
  }
}