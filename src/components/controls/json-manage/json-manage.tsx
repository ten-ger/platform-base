import { Component, h, Event, EventEmitter, Prop, State, Watch } from '@stencil/core';
import { Log } from '../../../services/log';

// --- Helper Types & Functions ---

const cloneDeep = (data: any) => JSON.parse(JSON.stringify(data));

type JsonType = 'string' | 'number' | 'boolean' | 'null' | 'object' | 'array';

const getJsonType = (value: any): JsonType => {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'object') {
    return Array.isArray(value) ? 'array' : 'object';
  }
  if (t === 'string') return 'string';
  if (t === 'number') return 'number';
  if (t === 'boolean') return 'boolean';
  return 'string';
};

// --- Component Definition ---

@Component({
  tag: 'json-manage',
  styleUrl: 'json-manage.css'
})
export class JsonManage {

  @Prop() json: any;
  @Prop() readonly: boolean = false;

  @State() editableJson: any = {};
  @State() jsonData: any = {}; // Store current state outside of what will cause re-renders

  @Event() jsonChanged: EventEmitter<any>;

  @Watch('json')
  parseJsonProp(newValue: any) {
    if (newValue) {
      try {
        this.editableJson = cloneDeep(newValue);
      } catch (e) {
        this.editableJson = {};
      }
    } else {
      this.editableJson = {};
    }
    this.jsonData = this.editableJson;
  }

  componentWillLoad() {
    this.parseJsonProp(this.json);
  }

  private emitJsonChangedEvent() {
    this.jsonChanged.emit({ value: this.jsonData });
  }

  private updateNestedData(path: (string | number)[], newValue: any): any {
    const root = cloneDeep(this.jsonData);
    let current: any = root;

    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        current[key] = newValue;
      } else {
        current = current?.[key];
        if (current === undefined || current === null) return this.jsonData;
      }
    }
    return root;
  }

  private removeNestedData(path: (string | number)[]): any {
    const root = cloneDeep(this.jsonData);
    let current: any = root;

    for (let i = 0; i < path.length; i++) {
      const key = path[i];
      if (i === path.length - 1) {
        if (Array.isArray(current)) {
          current.splice(key as number, 1);
        } else {
          delete current[key];
        }
      } else {
        current = current?.[key];
        if (current === undefined || current === null) return this.jsonData;
      }
    }
    return root;
  }

  private addNestedData(path: (string | number)[], keyName: string | number, initialValue: any): any {
    const root = cloneDeep(this.jsonData);
    let current: any = root;

    for (const key of path) {
      current = current?.[key];
      if (current === undefined || current === null) return this.jsonData;
    }

    if (Array.isArray(current)) {
      current.push(initialValue);
    } else if (typeof current === 'object' && current !== null) {
      current[keyName] = initialValue;
    }

    return root;
  }

  private handleNodeUpdate(event: CustomEvent) {
    event.stopPropagation();
    const { path, value } = event.detail;
    this.jsonData = this.updateNestedData(path, value);
    this.emitJsonChangedEvent();
  }

  private handleNodeRemove(event: CustomEvent) {
    Log.debug('handleNodeRemove event received', event);
    event.stopPropagation();
    const { path } = event.detail;
    this.jsonData = this.removeNestedData(path);
    this.emitJsonChangedEvent();
  }

  private handleNodeAdd(event: CustomEvent) {
    event.stopPropagation();
    const { path, key, value } = event.detail;
    this.jsonData = this.addNestedData(path, key, value);
    this.emitJsonChangedEvent();
  }

  render() {
    const rootType = getJsonType(this.editableJson);
    const isExpandableRoot = rootType === 'object' || rootType === 'array';

    return (
      <ion-list class="json-manager-list" lines="full">
        {/* <ion-list-header>
          <div class='json-manager-list-header'>
            {isExpandableRoot && (
              <div class="header-actions">
                <ion-button fill="clear" color="medium" title="Expand All" onClick={() => this.toggleAllExpanded(true)}>
                  <ion-icon name="expand-outline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" color="medium" title="Collapse All" onClick={() => this.toggleAllExpanded(false)}>
                  <ion-icon name="contract-outline"></ion-icon>
                </ion-button>
                <ion-button fill="clear" color="success" title={`Add ${rootType === 'array' ? 'Element' : 'Property'} to Root`} onClick={this.handleRootAdd}>
                  <ion-icon name="add-circle-outline"></ion-icon>
                </ion-button>
              </div>
            )}
          </div>
        </ion-list-header> */}

        {isExpandableRoot && (
          <json-node
            keyName="ROOT"
            value={this.editableJson}
            path={[]}
            depth={-1}
            isRoot={true}
            readonly={this.readonly}
            onNodeUpdate={(e) => this.handleNodeUpdate(e)}
            onNodeRemove={(e) => this.handleNodeRemove(e)}
            onNodeAdd={(e) => this.handleNodeAdd(e)}
          />
        )}
      </ion-list>
    );
  }
}