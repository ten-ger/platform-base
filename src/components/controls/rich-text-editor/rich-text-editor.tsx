import { Component, h, Prop, Event, EventEmitter, Element, Watch } from "@stencil/core";

@Component({
  tag: 'rich-text-editor',
  styleUrl: 'rich-text-editor.css',
})
export class RichTextEditor {

  @Element() el: HTMLElement;

  @Prop() value: string = '';
  @Prop() placeholder: string = 'Enter rich text…';

  @Event() valueChanged: EventEmitter<{ value: string }>;

  private editorEl: HTMLDivElement;

  componentDidLoad() {
    this.editorEl = this.el.querySelector('.rte-content') as HTMLDivElement;
    this.editorEl.innerHTML = this.value ?? '';
  }

  @Watch('value')
  onValuePropChanged(newVal: string) {
    if (this.editorEl && this.editorEl.innerHTML !== (newVal ?? '')) {
      this.editorEl.innerHTML = newVal ?? '';
    }
  }

  private execCmd(cmd: string, value?: string) {
    this.editorEl.focus();
    document.execCommand(cmd, false, value ?? null);
    this.emitValue();
  }

  private execLink() {
    const sel = window.getSelection();
    const selectedText = sel?.toString() ?? '';
    const url = window.prompt('Enter URL', 'https://');
    if (!url) return;
    this.editorEl.focus();
    if (selectedText) {
      document.execCommand('createLink', false, url);
    } else {
      document.execCommand('insertHTML', false, `<a href="${url}">${url}</a>`);
    }
    this.emitValue();
  }

  private emitValue() {
    this.valueChanged.emit({ value: this.editorEl.innerHTML });
  }

  private btn(title: string, cmd: string, value?: string, children?: any) {
    return (
      <button
        type="button"
        class="rte-btn"
        title={title}
        onMouseDown={(e: MouseEvent) => { e.preventDefault(); this.execCmd(cmd, value); }}
      >
        {children}
      </button>
    );
  }

  render() {
    return (
      <div class="rte-wrap">
        <div class="rte-toolbar">
          {this.btn('Bold', 'bold', undefined, <b>B</b>)}
          {this.btn('Italic', 'italic', undefined, <i>I</i>)}
          {this.btn('Underline', 'underline', undefined, <u>U</u>)}
          <span class="rte-sep" />
          {this.btn('Heading 2', 'formatBlock', 'h2', 'H2')}
          {this.btn('Heading 3', 'formatBlock', 'h3', 'H3')}
          {this.btn('Paragraph', 'formatBlock', 'p', '¶')}
          <span class="rte-sep" />
          {this.btn('Bullet List', 'insertUnorderedList', undefined, <ion-icon name="list-outline" />)}
          {this.btn('Ordered List', 'insertOrderedList', undefined, <ion-icon name="list-circle-outline" />)}
          <span class="rte-sep" />
          {this.btn('Align Left', 'justifyLeft', undefined,
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <rect x="0" y="0"  width="14" height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="5"  width="9"  height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="10" width="11" height="2" rx="1" fill="currentColor"/>
            </svg>
          )}
          {this.btn('Align Center', 'justifyCenter', undefined,
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <rect x="0" y="0"  width="14" height="2" rx="1" fill="currentColor"/>
              <rect x="2.5" y="5"  width="9"  height="2" rx="1" fill="currentColor"/>
              <rect x="1.5" y="10" width="11" height="2" rx="1" fill="currentColor"/>
            </svg>
          )}
          {this.btn('Align Right', 'justifyRight', undefined,
            <svg width="14" height="12" viewBox="0 0 14 12" fill="none" aria-hidden="true">
              <rect x="0" y="0"  width="14" height="2" rx="1" fill="currentColor"/>
              <rect x="5" y="5"  width="9"  height="2" rx="1" fill="currentColor"/>
              <rect x="3" y="10" width="11" height="2" rx="1" fill="currentColor"/>
            </svg>
          )}
          <span class="rte-sep" />
          <button
            type="button"
            class="rte-btn"
            title="Link"
            onMouseDown={(e: MouseEvent) => { e.preventDefault(); this.execLink(); }}
          >
            <ion-icon name="link-outline" />
          </button>
          {this.btn('Remove Formatting', 'removeFormat', undefined, <ion-icon name="close-circle-outline" />)}
        </div>
        <div
          class="rte-content"
          contentEditable="true"
          data-placeholder={this.placeholder}
          onInput={() => this.emitValue()}
        />
      </div>
    );
  }
}
