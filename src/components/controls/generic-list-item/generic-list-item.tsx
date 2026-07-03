import { Component, Element, h, Prop, State } from "@stencil/core";
import { ActionSheetService } from "../../../services/action-sheet";
import { PopoverService } from "../../../services/popover";

export type ListItemBreakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const BREAKPOINT_WIDTHS: Record<ListItemBreakpoint, number> = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

export interface ListItemFieldStyle {
  fontWeight?: string;
  fontSize?: string;
  color?: string;
  fontStyle?: string;
}

export interface ListItemField {
  value: string;
  label?: string;
  style?: ListItemFieldStyle;
}

export interface ListItemDataBlock {
  type: 'data';
  width: number;
  rows: ListItemField[][];
  visibleAt?: ListItemBreakpoint[];
}

export interface ListItemImageBlock {
  type: 'image';
  width: number;
  height?: number;
  src: string;
  alt?: string;
  visibleAt?: ListItemBreakpoint[];
}

export interface ListItemCustomBlock {
  type: 'custom';
  width: number;
  render: () => any;
  visibleAt?: ListItemBreakpoint[];
}

export type ListItemBlock = ListItemDataBlock | ListItemImageBlock | ListItemCustomBlock;

export interface ListItemAction {
  label: string;
  handler: () => void;
  disabled?: boolean;
}

const ACTIONS_BUTTON_WIDTH = 40;

@Component({
  tag: 'generic-list-item',
  styleUrl: 'generic-list-item.css'
})
export class GenericListItem {

  @Element() el: HTMLElement;

  @Prop() blocks: ListItemBlock[] = [];
  @Prop() actions?: ListItemAction[];

  @State() visibleBlocks: ListItemBlock[];

  private resizeObserver: ResizeObserver;

  componentDidLoad() {
    this.resizeObserver = new ResizeObserver(() => this.updateVisibleBlocks());
    this.resizeObserver.observe(this.el);
    this.updateVisibleBlocks();
  }

  disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  private getBreakpoint(width: number): ListItemBreakpoint {
    if (width >= BREAKPOINT_WIDTHS.xl) return 'xl';
    if (width >= BREAKPOINT_WIDTHS.lg) return 'lg';
    if (width >= BREAKPOINT_WIDTHS.md) return 'md';
    if (width >= BREAKPOINT_WIDTHS.sm) return 'sm';
    return 'xs';
  }

  private updateVisibleBlocks() {
    const reserved = this.actions?.length ? ACTIONS_BUTTON_WIDTH : 0;
    const available = this.el.offsetWidth - reserved;
    const breakpoint = this.getBreakpoint(available);

    const atBreakpoint = this.blocks.filter(block =>
      !block.visibleAt || block.visibleAt.includes(breakpoint)
    );

    let used = 0;
    let count = 0;
    const result: ListItemBlock[] = [];
    for (const block of atBreakpoint) {
      const dividerWidth = count > 0 ? 1 : 0;
      if (used + dividerWidth + block.width > available) break;
      used += dividerWidth + block.width;
      count++;
      result.push(block);
    }

    this.visibleBlocks = result.length > 0 ? result : atBreakpoint.slice(0, 1);
  }

  private openActionsMenu(e: MouseEvent) {
    e.stopPropagation();
    const breakpoint = this.getBreakpoint(this.el.offsetWidth);
    if (breakpoint === 'xs' || breakpoint === 'sm') {
      ActionSheetService.present({
        buttons: this.actions.map(a => ({
          text: a.label,
          disabled: a.disabled,
          handler: () => { a.handler(); return true; }
        }))
      });
    } else {
      PopoverService.showMenu(e, this.actions.map(a => ({
        displayText: a.label,
        disabled: a.disabled,
        onClick: () => a.handler()
      })));
    }
  }

  private buildFieldStyle(style?: ListItemFieldStyle): { [key: string]: string } {
    if (!style) return {};
    const s: { [key: string]: string } = {};
    if (style.fontWeight) s['font-weight'] = style.fontWeight;
    if (style.fontSize) s['font-size'] = style.fontSize;
    if (style.color) s['color'] = style.color;
    if (style.fontStyle) s['font-style'] = style.fontStyle;
    return s;
  }

  render() {
    const visible = this.visibleBlocks ?? this.blocks;

    return (
      <div class="gli-container">
        {visible.map((block, i) => [
          i > 0 && <div class="gli-divider" />,
          block.type === 'image'
            ? (
              <div
                class="gli-block gli-block-image"
                style={{
                  minWidth: `${block.width}px`,
                  maxWidth: `${block.width}px`,
                  minHeight: `${block.height || block.width}px`,
                  maxHeight: `${block.height || block.width}px`
                }}
              >
                <img class="gli-element-img" src={block.src} alt={block.alt || ''} loading="lazy" />
              </div>
            )
            : block.type === 'custom'
            ? (
              <div
                class="gli-block gli-block-custom"
                style={{ minWidth: `${block.width}px`, maxWidth: `${block.width}px` }}
              >
                {block.render()}
              </div>
            )
            : (
              <div
                class="gli-block gli-block-data"
                style={{ minWidth: `${block.width}px`, maxWidth: `${block.width}px` }}
              >
                {block.rows.map((row: ListItemField[]) => (
                  <div class="gli-field-row">
                    {row.map((field: ListItemField) => (
                      <span class="gli-field">
                        {field.label && <span class="gli-field-label">{field.label}: </span>}
                        <span class="gli-field-value" style={this.buildFieldStyle(field.style)}>{field.value}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            )
        ])}
        {this.actions?.length > 0 && (
          <button class="gli-actions-btn" onClick={(e) => this.openActionsMenu(e)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2"/>
              <circle cx="12" cy="12" r="2"/>
              <circle cx="12" cy="19" r="2"/>
            </svg>
          </button>
        )}
      </div>
    );
  }
}
