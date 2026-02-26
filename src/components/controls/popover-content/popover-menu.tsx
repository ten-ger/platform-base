import { Component, h, Prop } from '@stencil/core';
import { PopoverMenuItem, PopoverService } from '../../../services/popover';

@Component({
  tag: 'popover-menu'
})
export class PopoverMenu {

  @Prop() menuOptions: PopoverMenuItem[];

  render() {
    return (
      <ion-list>
        {this.menuOptions.map(option => (
          <ion-item
            button={true}
            lines={option.lines}
            disabled={option.disabled}
            onClick={(e) => {
              PopoverService.dismiss();
              option.onClick(e);
            }}
          >
            {option.displayText}
          </ion-item>
        ))}
      </ion-list>
    );
  }
}