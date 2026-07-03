import { Component, h, Prop, Event, EventEmitter, Watch, Method, Element, State } from '@stencil/core';

declare const require: any;

const MONACO_VERSION = '0.55.1';
const MONACO_CDN = `https://cdn.jsdelivr.net/npm/monaco-editor@${MONACO_VERSION}/min/vs`;

// ── Monaco singleton loader ──────────────────────────────────────────────────

type LoadState = 'idle' | 'loading' | 'ready';
let monacoLoadState: LoadState = 'idle';
let monacoLoadCallbacks: Array<() => void> = [];

function loadMonaco(): Promise<void> {
  if (monacoLoadState === 'ready') return Promise.resolve();
  if (monacoLoadState === 'loading') {
    return new Promise<void>(resolve => monacoLoadCallbacks.push(resolve));
  }
  monacoLoadState = 'loading';
  return new Promise<void>((resolve, reject) => {
    monacoLoadCallbacks.push(resolve);
    const script = document.createElement('script');
    script.src = `${MONACO_CDN}/loader.js`;
    script.onload = () => {
      require.config({ paths: { vs: MONACO_CDN } });
      require(['vs/editor/editor.main'], () => {
        monacoLoadState = 'ready';
        monacoLoadCallbacks.forEach(cb => cb());
        monacoLoadCallbacks = [];
      });
    };
    script.onerror = () => {
      monacoLoadState = 'idle';
      reject(new Error(`Monaco failed to load from CDN (${MONACO_CDN})`));
    };
    document.head.appendChild(script);
  });
}

// ── Component ────────────────────────────────────────────────────────────────

@Component({
  tag: 'code-editor',
  styleUrl: 'code-editor.css'
})
export class CodeEditor {
  @Element() el: HTMLElement;

  /** The string content to display. Changing this prop replaces the editor content. */
  @Prop() value: string = '';

  /** Monaco language identifier. Default: 'json'. */
  @Prop() language: string = 'json';

  /**
   * Optional JSON Schema object for validation. Only applied when language is 'json'.
   * Passed directly to monaco.languages.json.jsonDefaults.setDiagnosticsOptions.
   */
  @Prop() schema: object | null = null;

  /** When true, the editor is read-only. Default: false. */
  @Prop() readonly: boolean = false;

  /** Height of the editor area. Any valid CSS length. Default: '320px'. */
  @Prop() height: string = '320px';

  /** VS Code color theme: 'vs' | 'vs-dark' | 'hc-black'. Default: 'vs-dark'. */
  @Prop() theme: string = 'vs-dark';

  /** Emitted on every content change with the current raw string value. */
  @Event() valueChanged: EventEmitter<string>;

  @State() loadError: string | null = null;

  private editorContainer: HTMLDivElement;
  private monacoEditor: any;
  private suppressPropSync = false;

  // ── Prop watchers ──────────────────────────────────────────────────────────

  @Watch('value')
  onValuePropChanged(next: string) {
    if (!this.monacoEditor || this.suppressPropSync) return;
    if (this.monacoEditor.getValue() !== next) {
      this.monacoEditor.setValue(next ?? '');
    }
  }

  @Watch('readonly')
  onReadonlyChanged(val: boolean) {
    this.monacoEditor?.updateOptions({ readOnly: val });
  }

  @Watch('theme')
  onThemeChanged(val: string) {
    (window as any).monaco?.editor.setTheme(val);
  }

  @Watch('schema')
  onSchemaChanged() {
    this.applySchema();
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────────

  async componentDidLoad() {
    try {
      await loadMonaco();
      this.initEditor();
    } catch (err) {
      this.loadError = (err as Error).message;
    }
  }

  disconnectedCallback() {
    this.monacoEditor?.dispose();
    this.monacoEditor = null;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Returns the current raw string value of the editor. */
  @Method()
  async getValue(): Promise<string> {
    return this.monacoEditor?.getValue() ?? '';
  }

  /** Replaces the editor content with the supplied string. */
  @Method()
  async setValue(content: string): Promise<void> {
    this.monacoEditor?.setValue(content ?? '');
  }

  /** Runs Monaco's built-in document formatter. */
  @Method()
  async format(): Promise<void> {
    await this.monacoEditor?.getAction('editor.action.formatDocument')?.run();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private applySchema() {
    const monaco = (window as any).monaco;
    if (!monaco || this.language !== 'json') return;
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: this.schema
        ? [{ uri: 'https://tenna.io/schema/code-editor', fileMatch: ['*'], schema: this.schema }]
        : []
    });
  }

  private initEditor() {
    const monaco = (window as any).monaco;
    if (!monaco || !this.editorContainer) return;

    this.applySchema();

    this.monacoEditor = monaco.editor.create(this.editorContainer, {
      value: this.value ?? '',
      language: this.language,
      theme: this.theme,
      readOnly: this.readonly,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontSize: 13,
      lineNumbers: 'on',
      wordWrap: 'off',
      formatOnPaste: true,
      folding: true,
      tabSize: 2,
    });

    this.monacoEditor.onDidChangeModelContent(() => {
      if (this.suppressPropSync) return;
      const current = this.monacoEditor.getValue();
      this.suppressPropSync = true;
      this.valueChanged.emit(current);
      this.suppressPropSync = false;
    });
  }

  render() {
    return (
      <div class="code-editor">
        {this.loadError
          ? <div class="load-error">
              <ion-icon name="warning-outline" />
              <span>{this.loadError}</span>
            </div>
          : <div
              class="editor-surface"
              style={{ height: this.height }}
              ref={el => (this.editorContainer = el as HTMLDivElement)}
            />
        }
      </div>
    );
  }
}
