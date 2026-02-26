import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'floating-toolbar',
  styleUrl: 'floating-toolbar.css',
  shadow: true,
})
export class FloatingToolbar {

  @Prop() isOpen: boolean = false;
  @Prop() position: { x: number; y: number } = { x: 0, y: 0 };

  render() {
    return (
      <div
        class={{
          'toolbar-container': true,
          'is-open': this.isOpen,
        }}
        style={{
          'top': `${this.position.y}px`,
          'left': `${this.position.x}px`,
        }}
      >
        <slot></slot>
      </div>
    );
  }
}