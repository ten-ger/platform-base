import { Component, h, Element, Event, EventEmitter, Method, Prop, State } from "@stencil/core";
import { ColumnState, GridApi, GridOptions, createGrid } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import { App }  from "../../../services/app-state";
import { themeQuartz, colorSchemeDark } from "ag-grid-community";
import { Log } from "../../../services/log";

@Component({
  tag: 'data-grid'
})
export class DataGrid {

  @Element() el: HTMLDataGridElement;

  @Event() rowDoubleClicked: EventEmitter;
  @Event() rowSelectionChanged: EventEmitter;
  @Event() sortChanged: EventEmitter;
  @Event() gridColumnsChanged: EventEmitter;

  @Prop() multipleSelection: boolean = true;
  @Prop() dataAccessFn: Function;
  @Prop() showPagination: boolean;
  @Prop() height: string = '100%';
  @Prop() width: string = '100%';
  @Prop() gridOptions: GridOptions;

  @State() pageCount: number;
  @State() pageIndex: number;
  @State() total: number;

  private gridApi: GridApi;
  private gridWrapperElem: HTMLDivElement;

  async componentWillLoad() {
    ModuleRegistry.registerModules([AllCommunityModule]);
  }

  async componentDidLoad() {
    Log.debug('data-grid componentDidLoad')
    this.initializeGrid();
  }

  disconnectedCallback() {
    if (this.gridApi) {
      this.gridApi.destroy();
    }
  }

  initializeGrid() {
    if (!this.gridApi) {
      Log.debug('data-grid initializeGrid')
      let defaultGridOptions = {
        theme: App.getState('darkThemeEnabled') ? themeQuartz.withPart(colorSchemeDark) : themeQuartz,
        suppressCellFocus: true,
        onDisplayedColumnsChanged: (e) => this.gridColumnsChanged.emit(e),
        onSortChanged: (e) => this.sortChanged.emit(e),
        onSelectionChanged: (e) => this.rowSelectionChanged.emit(e),
      };
      let opts = {...defaultGridOptions, ...this.gridOptions};
      this.gridApi = createGrid(this.gridWrapperElem, opts);
      this.gridApi.setGridAriaProperty('label', null);
    }
  }

  @Method()
  async loadData() {
    if (!this.dataAccessFn) { 
      Log.error('dataAccessFn is required to load data.');
      return;
    }
    
    try {
      // Fetch data
      let data = await this.dataAccessFn();
      if (!data?.length) { data = [] }
      // Log.debug("data-grid loadData data", data);
      this.gridApi.setGridOption("rowData", data);
    }
    catch (error) {
      Log.error("Error loading grid data", error);
    }
  }

  @Method()
  async updateRowData(updatedData: any[]) {
    if (!this.gridApi) {
      Log.error('data-grid: No gridApi, cannot update row data.');
      return;
    }
    try {
      this.gridApi.applyTransaction({ update: updatedData });
    }
    catch (error) {
      Log.error("Error updating grid row data", error);
    }
  }

  @Method()
  async getSelectedRows() {
    return this.gridApi.getSelectedRows();
  }

  @Method()
  async setSelectedRows(dataToSelect: any[], rowIdKey: string = 'id') {
    if (!this.gridApi || !dataToSelect || dataToSelect.length === 0) {
      // Log.debug('data-grid: No gridApi or data to select, skipping setSelectedRows.');
      return;
    }

    // Clear any existing selections first to ensure a clean state
    this.gridApi.deselectAll();

    // Create a Set of unique identifiers for quick lookup of items to select
    // Assuming 'device_id' is the unique identifier for your row data
    const idsToSelect = new Set(dataToSelect.map(item => item[rowIdKey]));

    this.gridApi.forEachNode(node => {
      // Check if the current row's data matches one of the items we want to select
      if (node.data && idsToSelect.has(node.data[rowIdKey])) {
        // Select the row.
        // The third argument (true) suppresses the 'selectionChanged' event,
        // preventing unnecessary re-triggers of the parent component's hGridSelectionChanged.
        node.setSelected(true, false);
      }
    });
  }

  @Method()
  async clearAllColumnFilters() {
    this.gridApi.setFilterModel(null);
  }

  @Method()
  async showColumnChooser() {
    this.gridApi.showColumnChooser();
  }

  @Method()
  async setColumnVisibility(columnFields: string[], visible: boolean) {
    this.gridApi.setColumnsVisible(columnFields, visible);
  }

  @Method()
  async exportData(fileName: string) {
    this.gridApi.exportDataAsCsv({
      fileName: fileName || 'csv_export'
    });
  }

  @Method()
  async getColumnState(): Promise<ColumnState[]> {
    return this.gridApi.getColumnState();
  }

  @Method()
  async setColumnState(columnState: ColumnState[]): Promise<boolean> {
    return this.gridApi.applyColumnState({
      state: columnState,
      applyOrder: true
    });
  }

  @Method()
  async setColumnDefinitions(colDefs) {
    this.gridApi.setGridOption("columnDefs", colDefs);
  }

  @Method()
  async getFilteredRowData() {
    let rowData: any[] = [];
    this.gridApi.forEachNodeAfterFilter(node => rowData.push(node.data));
    return rowData;
  }

  @Method()
  async setRowData(rowData) {
    this.gridApi.setGridOption("rowData", rowData);
  }

  @Method()
  async setColDefsAndRowData(colDefs, rowData) {
    this.gridApi.setGridOption("columnDefs", colDefs);
    this.gridApi.setGridOption("rowData", rowData);
  }

  render() {
    return [
      <div 
        ref={(el) => this.gridWrapperElem = el}
        style={{ height: this.height, width: this.width }}
      />
    ]
  }
}