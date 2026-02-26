import { Component, h, Element, Event, EventEmitter, Prop, State } from '@stencil/core';
import { Log } from '../../../services/log';
import { ModalService } from '../../../services/modal';

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

const getIonicIcon = (type: JsonType): string => {
  switch (type) {
    case 'string': return 'text-outline';
    case 'number': return 'keypad-outline';
    case 'boolean': return 'checkmark-circle-outline';
    case 'null': return 'remove-circle-outline';
    case 'object': return 'cube-outline';
    case 'array': return 'list-outline';
    default: return 'help-circle-outline';
  }
};

@Component({
  tag: 'json-node',
  styleUrl: 'json-node.css'
})
export class JsonNode {

  @Element() el: HTMLElement;

  @Prop() keyName!: string | number;
  @Prop() value: any;
  @Prop() path!: (string | number)[];
  @Prop() depth!: number;
  @Prop() isRoot?: boolean = false;
  @Prop() readonly: boolean = false;

  @State() nodeValue: any; // mutable version of value
  @State() isExpanded: boolean = false;
  @State() childrenKeys: (string | number)[] = [];

  @Event() nodeUpdate: EventEmitter<{ path: (string | number)[]; value: any }>;
  @Event() nodeRemove: EventEmitter<{ path: (string | number)[] }>;
  @Event() nodeAdd: EventEmitter<{ path: (string | number)[]; key: string | number; value: any }>;

  componentWillLoad() {
    this.nodeValue = this.value;
    this.updateChildrenKeys(this.nodeValue);
  }

  private updateChildrenKeys(value: any) {
    const valueType = getJsonType(value);
    const isExpandable = valueType === 'object' || valueType === 'array';

    if (isExpandable) {
      if (valueType === 'array') {
        // For arrays, the keys are indices (0, 1, 2, ...)
        this.childrenKeys = (value as Array<any>).map((_, index) => index);
      } else if (valueType === 'object') {
        // For objects, the keys are property names
        this.childrenKeys = Object.keys(value as object);
      }
    } else {
      this.childrenKeys = [];
    }
    // Log.debug('childrenKeys updated:', this.childrenKeys);
  }

  private get currentPath(): (string | number)[] {
    return this.isRoot ? [] : [...this.path, this.keyName];
  }

  private get pathString(): string {
    return this.currentPath.join('.');
  }

  private get valueType(): JsonType {
    return getJsonType(this.nodeValue);
  }

  private get isExpandable(): boolean {
    return this.valueType === 'object' || this.valueType === 'array';
  }

  private get isParentArray(): boolean {
    if (this.isRoot) return false;
    // We need to determine if this node's parent is an array
    // For simplicity, check if keyName is a number
    return typeof this.keyName === 'number';
  }

  private handleValueChange = (newValue: any) => {
    Log.debug(`Value changed to ${newValue} at path ${this.currentPath}`);
    this.nodeValue = newValue;
    this.nodeUpdate.emit({ path: this.currentPath, value: newValue });
  }

  private handleChildUpdated = (event: CustomEvent) => {
    // event.stopPropagation(); // Stop propagation of original event
    const { path, value } = event.detail;
    Log.debug(`Child node updated to ${value} at path:`, path);
    // Update the child value in this node's value
    if (this.valueType === 'array') {
      const index = path[path.length - 1] as number;
      const updatedArray = [...this.nodeValue];
      updatedArray[index] = value;
      this.nodeValue = updatedArray;
    } else if (this.valueType === 'object') {
      const key = path[path.length - 1] as string;
      const updatedObject = { ...this.nodeValue, [key]: value };
      this.nodeValue = updatedObject;
    }
    Log.debug('Updated nodeValue after child update', this.nodeValue);
    // this.nodeUpdate.emit({ path: this.currentPath, value: this.nodeValue });
  }

  private handleRemoveClicked = () => {
    Log.debug('Requesting removal of node at path', this.currentPath);
    this.nodeRemove.emit({ path: this.currentPath });
  }

  private handleChildArrayItemRemoved(event: CustomEvent) {
    event.stopPropagation(); // Stop propagation of original event
    const indexToRemove = event.detail.path[event.detail.path.length - 1];
    if (Array.isArray(this.nodeValue) && indexToRemove < this.nodeValue.length) {
      Log.debug('Removing child array item at index', indexToRemove);
      const updatedValue = [...this.nodeValue];
      updatedValue.splice(indexToRemove as number, 1);
      Log.debug('Updated value after child removal', updatedValue);
      this.nodeValue = [...updatedValue]; // Force new reference
      this.nodeRemove.emit({ path: event.detail.path }); // Bubble up new event
    }
  }

  private handleChildPropertyRemoved(event: CustomEvent) {
    if (this.childrenKeys.includes(event.detail.path[event.detail.path.length - 1])) {  
      Log.debug('Removing child node at path', event.detail.path);
      const updatedValue = { ...this.nodeValue };
      delete updatedValue[event.detail.path[event.detail.path.length - 1]];
      Log.debug('Updated value after child removal', updatedValue);
      this.nodeValue = { ...updatedValue }; // Force new reference
      this.childrenKeys = this.childrenKeys.filter(key => key !== event.detail.path[event.detail.path.length - 1]);
    }
  }

  private async handleAddClicked() {
    if (!this.isExpanded) {
      this.isExpanded = true;
    }
    if (this.valueType === 'array') {
      // TODO: Call json-property-add for array element types?
      //this.nodeAdd.emit({ path: this.currentPath, key: 0, value: '' });
    } else if (this.valueType === 'object') {
      // Use modal for objects
      const modal = await ModalService.create({
        component: 'json-property-add'
      });

      modal.onDidDismiss().then(async (result) => {
        const { data, role } = result;
        if (data && data.key && role === 'save') {
          this.nodeAdd.emit({ path: this.currentPath, key: data.key, value: data.value });
          this.nodeValue = { ...this.nodeValue, [data.key]: data.value };
          this.updateChildrenKeys(this.nodeValue);
          Log.debug('New value after addition', this.nodeValue);
        }
      });

      await modal.present();
    }
  }

  private renderKey() {
    const paddingLeft = this.isRoot ? '0px' : `${(this.depth + 1) * 15}px`;

    return (
      <div
        class={`json-key ${this.isExpandable ? 'expandable' : ''}`}
        style={{ 'padding-left': paddingLeft }}
        onClick={() => this.isExpanded = !this.isExpanded}
      >
        {this.isExpandable ? (
          <ion-icon
            name={this.isExpanded ? 'chevron-down-outline' : 'chevron-forward-outline'}
            class="json-expand-icon"
          ></ion-icon>
        ) : (
          <div class="json-spacer"></div>
        )}

        <span class={`json-key-name ${this.isRoot ? 'json-root-key' : ''} ${this.isParentArray ? 'json-key-index' : ''}`}>
          {this.isParentArray ? this.keyName : <b>{this.keyName}</b>}
        </span>
        <span class="json-colon">:</span>
        {/* <ion-button
            fill="clear"
            color="medium"
            size="small"
            title="Fully Expand Node"
            onClick={() => this.setExpanded(true, true)}
          >
            <ion-icon slot="icon-only" name="expand-outline"></ion-icon>
          </ion-button> */}
      </div>
    );
  }

  private renderValue() {
    if (this.isExpandable) {
      const length = this.valueType === 'array' ? this.nodeValue.length : Object.keys(this.nodeValue).length;
      return (
        <span class="json-value-editor json-summary">
          {this.valueType === 'array' ? `[${length}]` : `{${length}}`}
        </span>
      );
    }

    return (
      <json-value-editor
        value={this.nodeValue}
        type={this.valueType}
        readonly={this.readonly}
        onValueChange={(e: CustomEvent) => this.handleValueChange(e.detail)}
      />
    );
  }

  private renderActions() {
    return (
      <div class="json-actions">
        {this.isExpandable && !this.readonly && (
          <ion-button
            fill="clear"
            color="success"
            size="small"
            title={this.valueType === 'array' ? 'Add Item' : 'Add Property'}
            onClick={() => this.handleAddClicked()}
          >
            <ion-icon slot="icon-only" name="add-circle-outline"></ion-icon>
          </ion-button>
        )}
        {!this.isRoot && !this.readonly && (
          <ion-button
            fill="clear"
            color="danger"
            size="small"
            title="Remove"
            onClick={() => this.handleRemoveClicked()}
          >
            <ion-icon slot="icon-only" name="remove-circle-outline"></ion-icon>
          </ion-button>
        )}
      </div>
    );
  }

  private renderChildren() {
    if (!this.isExpanded || !this.isExpandable) {
      return null;
    }

    return [<div class="json-children">
      {this.childrenKeys.map(childKeyName => (
        <json-node
          key={`${this.pathString}.${childKeyName}`}
          keyName={childKeyName}
          value={this.nodeValue[childKeyName]}
          path={this.currentPath}
          depth={this.depth + 1}
          readonly={this.readonly}
          onNodeUpdate={(e: CustomEvent) => this.handleChildUpdated(e)}
          onNodeRemove={this.valueType === 'array'
            ? (e: CustomEvent) => this.handleChildArrayItemRemoved(e)
            : (e: CustomEvent) => this.handleChildPropertyRemoved(e)
          }
        />
      ))}
    </div>];
  }

  render() {
    return [
      <ion-item class={`json-item-row ${this.isRoot ? 'json-root-item' : ''}`} lines={this.isRoot ? 'full' : 'none'}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <div style={{ flex: '1' }}>{this.renderKey()}</div>
          <div style={{ flex: '1' }}>{this.renderValue()}</div>
        </div>
        {this.renderActions()}
        <div class="json-type-icon" slot="end">
          <ion-icon name={getIonicIcon(this.valueType)} title={this.valueType}></ion-icon>
        </div>
      </ion-item>,
      this.renderChildren()
    ];
  }
}