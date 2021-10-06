import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State,
  Prop,
  Event,
  Listen,
  Watch,
} from "@stencil/core";
import { ColumnProps, FilterProps } from "../to4st-list/to4st-list";

import range from "lodash/range";
import chunk from "lodash/chunk";
import isEqual from "lodash/isEqual";
import iso8601 from "iso8601-validator";
import { nanoid } from "nanoid";

export interface ColumnDetailProps<T> extends ColumnProps<T> {
  detailInput?: (item: T, cb: (key: string, value: any) => void) => any;

  /**
   * Tooltip text
   */
  tooltip?: (item: T) => string;
}

/**
 * Detail edit component for stuff
 */
@Component({
  tag: "to4st-details",
  styleUrl: "to4st-details.scss",
  shadow: false,
})
export class To4stDetailEdit implements ComponentInterface {
  /**
   * Filters
   */
  @Prop() filters = [] as FilterProps[];

  @Prop() name: string;

  @Prop() hasSearch = false;

  @Prop() useDefaultListCreate = false;

  @Prop() columnsCount = 3;

  @Prop() defaultCreateObject: any;

  @Watch("defaultCreateObject")
  defaultCreateObjectChanged() {
    if (this.defaultCreateObject && this.currentItem) {
      this.currentItem = { ...this.defaultCreateObject, ...this.currentItem };
      this.reset();
    }
  }
  /**
   * Properties for columns
   */
  @Prop() columns = [] as ColumnDetailProps<any>[];

  /**
   * Block all inputs, display loading modal
   */
  @Prop() loadingInputBlock = false;

  /**
   * Allows overriding visibility of delete
   */
  @Prop() canItemBeDeleted: (item: any) => boolean;

  /**
   * Override orderBy assign
   */
  @Prop() mapOrderByAssign: (orderByString: string) => string;

  /**
   * Striped table
   */
  @Prop() stripedTable = false;

  /**
   * Has pagination
   */
  @Prop() listHasPagination = true;

  @Prop() mapPreSerializeEntity: (entity: any) => {
    mapped: any;
    fileName?: string;
  };

  @Event() updateEntities: EventEmitter<{
    page?: number;
    search?: string;
    orderBy?: string;
    orderDesc?: boolean;

    onFetchedData: (data: any[], pageCount: number) => void;
  }>;

  @Event() deleteEntity: EventEmitter<{
    entity: any;
    onDeletedEntity: () => void;
  }>;

  @Event() saveEntity: EventEmitter<{
    entity: any;
    transactionId: string;
    afterEx: EventEmitter<string>;
  }>;

  /**
   * List content
   */
  @State() entities = [] as any[];

  /**
   * Current page
   */
  @State() currentPage = 1;

  /**
   * Page count
   */
  @State() currentPageCount = 1;

  /**
   * Current search string
   */
  @State() currentSearch = "";

  /**
   * Order descending?
   */
  @State() orderDesc = true;

  /**
   * Order by key
   */
  @State() currentOrderBy = "";

  /**
   * Current error (input etc)
   */
  @State() currentError = "";

  /**
   * Has valid steam names => enable column
   */
  @State() hasValidNames = false;

  /**
   * Current item clone that is shown with details
   */
  @State() currentItemClone: any;

  /**
   * Current item that is selected
   */
  @State() currentItem: any;

  @State() freeze = false;

  @State() deleteActive = false;

  /**
   * Event called when save request resolves
   * @emits error to display, empty string for if successful
   */
  @Event() afterSave: EventEmitter<string>;

  /**
   * Transaction id for every save
   */
  @State() currentFormTransactionId: string;

  /**
   * Init
   */
  async componentWillLoad() {
    this.resetTransactionId();
    await this.updateContent();
  }

  /**
   * Update list
   */
  async updateContent() {
    this.updateEntities.emit({
      page: this.currentPage,
      search: this.currentSearch,
      orderBy: this.currentOrderBy,
      orderDesc: this.orderDesc,
      onFetchedData: (data, pageCount) => {
        this.entities = data;
        this.currentPageCount = pageCount;
        if (
          this.entities.length > 0 &&
          (!this.currentItem || !this.currentItemClone)
        ) {
          // this.itemSelected(this.entities[0]);
        }
      },
    });
  }

  /**
   * Search entities
   * @param search
   */
  async searchEntity(search: string) {
    this.currentSearch = search;
    await this.updateContent();
  }

  /**
   * Save entity
   * @param entity
   * @param isEdit
   * @param afterEx Callback executed when request resolves
   */
  async _saveEntity(
    entity: any,
    isEdit: boolean,
    afterEx: EventEmitter<string>
  ) {
    this.freeze = true;
    this.saveEntity.emit({
      entity: entity,
      transactionId: this.currentFormTransactionId,
      afterEx: afterEx,
    });
  }

  /**
   * Go to page
   * @param page
   */
  async goToPage(page: number) {
    this.currentPage = page;
    await this.updateContent();
  }

  /**
   * Remove entity from list
   * @param entity
   */
  async removeEntity(entity: any) {
    this.deleteActive = false;
    this.deleteEntity.emit({
      entity: entity,
      onDeletedEntity: () => {
        this.updateContent();
        this.currentItem = undefined;
        this.currentItemClone = undefined;
      },
    });
  }

  itemSelected(item: any) {
    this.currentItem = { ...this.defaultCreateObject, ...item };
    this.reset();
  }

  reset() {
    this.currentItemClone = { ...this.currentItem };
  }

  copy() {
    const asStr = this.currentItemAsString();
    if (asStr) {
      sessionStorage.setItem(this.getIdentString(), asStr);
    }
  }

  import(files: any) {
    if (files?.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result.toString();
        this.pasteFromString(content);
      };

      reader.onerror = (e) => {
        console.error("Error reading file : " + e);
      };

      reader.readAsText(files[0]);
    }
  }

  downloadJSON(name: string, json: string) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([json], {
        type: "text/plain",
      })
    );
    a.setAttribute("download", name + ".txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  export() {
    const asStr = this.currentItemAsString();
    if (asStr) {
      this.downloadJSON(
        this.mapPreSerializeEntity?.(this.currentItemClone).fileName ||
          this.name,
        asStr
      );
    }
  }

  paste() {
    const fromSessionStorage = sessionStorage.getItem(this.getIdentString());
    this.pasteFromString(fromSessionStorage);
  }

  currentItemAsString(): string {
    return this.currentItemClone
      ? JSON.stringify(
          this.mapPreSerializeEntity
            ? this.mapPreSerializeEntity(this.currentItemClone).mapped
            : this.currentItemClone,
          null,
          "\t"
        )
      : "";
  }

  pasteFromString(data: string) {
    if (data && data.trim()) {
      const parsed = JSON.parse(data, (key, value) =>
        typeof value === "string" && iso8601.test(value)
          ? new Date(value)
          : value
      );
      const temp = {};
      Object.keys(parsed).forEach((key) => {
        temp[key] = parsed[key];
      });
      this.currentItemClone = temp;
    }
  }

  orderBy(orderByKey: string, orderDesc: boolean) {
    this.orderDesc = orderDesc;
    this.currentOrderBy = this.mapOrderByAssign?.(orderByKey) ?? orderByKey;
    this.updateContent();
  }

  getIdentString() {
    return `${this.name}_copied_preset`;
  }

  /**
   * Resets current transaction id
   */
  resetTransactionId() {
    this.currentFormTransactionId = nanoid();
  }

  /**
   * Handle save result finished
   * @param event which holds current error
   */
  @Listen("afterSave")
  async afterSuccessHandler(event: CustomEvent<string>) {
    this.freeze = false;
    this.resetTransactionId();
    this.currentError = event.detail;
    await this.updateContent();
  }

  renderSetter = (props: ColumnDetailProps<any>) => (
    <div class="tile is-parent">
      <div class="tile is-child">
        {props?.detailInput ? (
          <div class="field">
            <div class="field-label is-normal">
              <label class="label has-text-left">{props.name}</label>
            </div>
            <div class="field-body">
              <div class="control">
                <span
                  class="has-tooltip-arrow has-tooltip-left"
                  data-tooltip={
                    props.tooltip ? props.tooltip(this.currentItem) : undefined
                  }
                >
                  {props.detailInput(this.currentItemClone, (key, value) => {
                    if (this.currentItemClone) {
                      this.currentItemClone[key] = value;
                      this.currentItemClone = { ...this.currentItemClone };
                    }
                  })}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div>&nbsp;</div>
        )}
      </div>
    </div>
  );

  /**
   * Render registered player list
   */
  render() {
    const chunked = chunk(
      this.columns.filter((x) => !!x.detailInput),
      this.columnsCount
    );
    if (chunked.length > 0) {
      const last = chunked[chunked.length - 1];
      const diffFullLast = this.columnsCount - last.length;
      if (diffFullLast > 0) {
        const empty = range(diffFullLast).map(
          () => ({} as ColumnDetailProps<any>)
        );

        last.push(...empty);
      }
    }

    return (
      <Host>
        <div class="columns">
          <div class="column is-narrow">
            <to4st-list
              name={this.name}
              loadingInputBlock={this.loadingInputBlock}
              striped={this.stripedTable}
              filters={this.filters}
              columns={this.columns}
              content={this.entities}
              allowSelect={true}
              hasSearch={this.hasSearch}
              pagesCount={this.currentPageCount}
              currentPage={this.currentPage}
              hasCreate={this.useDefaultListCreate}
              hasPagination={this.listHasPagination}
              hasUpdate={false}
              onChangedOrder={(e) =>
                this.orderBy(e.detail.orderBy, e.detail.orderDesc)
              }
              onItemSelected={(e) => this.itemSelected(e.detail)}
              onPagination={(e) => this.goToPage(e.detail)}
              onSaveItem={(e) =>
                this._saveEntity(
                  e.detail.item as {},
                  e.detail.isEdit,
                  e.detail.afterSaveExecuted
                )
              }
              onSearchItem={(e) => this.searchEntity(e.detail)}
              onRemoveItem={(e) => this.removeEntity(e.detail as {})}
            ></to4st-list>
          </div>
          <div class="column has-margin-top-30">
            <article class="message">
              <div class="message-header">
                <p>Details</p>
                <div
                  class={{
                    "field has-addons": true,
                    "is-hidden": !this.mapPreSerializeEntity,
                  }}
                >
                  <div class="control">
                    <button
                      disabled={this.freeze || !this.currentItemClone}
                      class="button is-small"
                      onClick={() => this.copy()}
                    >
                      Copy
                    </button>
                  </div>
                  <div class="control">
                    <button
                      disabled={this.freeze || !this.currentItemClone}
                      class="button is-small"
                      onClick={() => this.paste()}
                    >
                      Paste
                    </button>
                  </div>
                </div>
              </div>
              <div class="message-body">
                <div
                  class={{
                    "notification is-danger": true,
                    "is-hidden": this.currentError.length == 0,
                  }}
                >
                  <button
                    class="delete"
                    onClick={() => (this.currentError = "")}
                  ></button>
                  {this.currentError}
                </div>
                <div class="container">
                  {chunked.map((y) => (
                    <div class="tile is-ancestor has-margin-bottom-0">
                      {y.map((x) => this.renderSetter(x))}
                    </div>
                  ))}
                </div>
                <div class="container has-margin-top-30">
                  <div class="level">
                    <div class="level-left">
                      <div class="level-item">
                        <div class="field level-item">
                          <div class="control">
                            <button
                              class="button is-success"
                              disabled={this.freeze || !this.currentItemClone}
                              onClick={() =>
                                this._saveEntity(
                                  this.currentItemClone,
                                  true,
                                  this.afterSave
                                )
                              }
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                      <div class="level-item">
                        <div class="field">
                          <div class="control">
                            <button
                              class="button is-small is-warning"
                              disabled={isEqual(
                                this.currentItem,
                                this.currentItemClone
                              )}
                              onClick={() => this.reset()}
                            >
                              Reset
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      class={{
                        "level-item": true,
                        "is-hidden": !this.mapPreSerializeEntity,
                      }}
                    >
                      <div class="field has-addons">
                        <div class="control">
                          <div class="file is-small">
                            <label class="file-label">
                              <input
                                class="file-input is-small"
                                disabled={this.freeze || !this.currentItemClone}
                                type="file"
                                name="resume"
                                onChange={(x) =>
                                  this.import(
                                    (x.target as HTMLInputElement).files
                                  )
                                }
                              />
                              <span class="file-cta">
                                <span class="file-icon">
                                  <i class="fas fa-upload"></i>
                                </span>
                                <span class="file-label">Import</span>
                              </span>
                            </label>
                          </div>
                        </div>
                        <div class="control">
                          <button
                            disabled={this.freeze || !this.currentItemClone}
                            class="button is-small is-info"
                            onClick={() => this.export()}
                          >
                            Export
                          </button>
                        </div>
                      </div>
                    </div>
                    <div
                      class={{
                        "level-right": true,
                      }}
                    >
                      <div class={"level-item"}>
                        <div class="field">
                          <div class="control">
                            <to4st-switch
                              disabled={
                                !this.currentItemClone ||
                                (this.canItemBeDeleted &&
                                  !this.canItemBeDeleted(this.currentItemClone))
                              }
                              value={this.deleteActive}
                              onToggle={(e) => (this.deleteActive = e.detail)}
                            ></to4st-switch>
                          </div>
                        </div>
                      </div>
                      <div class="level-item">
                        <div class="field">
                          <div class="control">
                            <span
                              class="has-tooltip-arrow"
                              data-tooltip={
                                this.deleteActive
                                  ? undefined
                                  : "Toggle switch \n to unlock"
                              }
                            >
                              <button
                                class="button is-danger"
                                disabled={
                                  !this.deleteActive ||
                                  !this.currentItemClone ||
                                  (this.canItemBeDeleted &&
                                    !this.canItemBeDeleted(
                                      this.currentItemClone
                                    ))
                                }
                                onClick={() =>
                                  this.removeEntity(this.currentItemClone)
                                }
                              >
                                <i class="fas fa-trash-alt"></i>
                              </button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>
      </Host>
    );
  }
}
