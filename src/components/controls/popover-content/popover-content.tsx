import { h, Component, Prop } from "@stencil/core";

@Component({
  tag: 'popover-content',
  styleUrl: 'popover-content.css', // Assumes a new CSS file for styling
  shadow: true
})
export class PopoverContent {

  @Prop() content: any;
  @Prop() isOpen: boolean = false;
  @Prop() position: { x: number; y: number } = { x: 0, y: 0 };

  render() {
    return (
      <div
        class={{ 'popover-container': true, 'is-open': this.isOpen }}
        style={{
          transform: `translate3d(${this.position.x}px, ${this.position.y}px, 0)`,
        }}
      >
        {this.content}
      </div>
    );
  }
}