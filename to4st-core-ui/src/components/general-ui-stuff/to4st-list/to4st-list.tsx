import {
  Component,
  ComponentInterface,
  Host,
  h,
  Event,
  Prop,
  EventEmitter,
  State,
  Listen
} from "@stencil/core";

import { nanoid } from "nanoid";

/**
 * Interface used to specify content to render
 */
export interface ColumnProps {
  /**
   * Name of column
   */
  name: string;

  /**
   * Should be hidden on mobile platform
   */
  hiddenMobile?: () => boolean;

  /**
   * Get content from item
   */
  tableContent: (item: any) => any;

  /**
   * Input element for create / update
   */
  input?: (
    item: any,
    emit: EventEmitter<{ key: string; value: any }>,
    isCreate?: boolean
  ) => any;

  /**
   * List can be sorted by column
   */
  sortable?: boolean;

  /**
   * Should be visible by predicate
   */
  shouldBeVisible?: () => boolean;
}

/**
 * Interface used to specify filters
 */
export interface FilterProps {
  name: string;
  input: (name: any) => any;
}

/**
 * Input state type
 */
export type InputState = "none" | "create" | "edit";

/**
 * Component which offers a sortable list box for any type with pagination
 * Allows create, update, delete of elements
 * Implements a modal for setting filters and a search box
 * Offers transaction id for create operations
 */
@Component({
  tag: "to4st-list",
  styleUrl: "to4st-list.scss",
  shadow: false
})
export class To4stList implements ComponentInterface {
  /**
   * Current items
   */
  @Prop() content = [] as {}[];

  /**
   * Properties for columns
   */
  @Prop() columns = [] as ColumnProps[];

  /**
   * Filters
   */
  @Prop() filters = [] as FilterProps[];

  /**
   * Current page
   */
  @Prop() currentPage = 1;

  /**
   * Page count
   */
  @Prop() pagesCount = 1;

  /**
   * Display search input box
   */
  @Prop() hasSearch = true;

  /**
   * Display pagination features
   */
  @Prop() hasPagination = true;

  /**
   * Name of list
   */
  @Prop() name = "";

  /**
   * Block all inputs, display loading modal
   */
  @Prop() loadingInputBlock = false;

  /**
   * Striped table
   */
  @Prop() striped = false;

  /**
   * Supports create, update, delete
   */
  @Prop() hasCreateUpdate = true;

  /**
   * Current item that is being edited
   */
  @State() currentItem: any;

  /**
   * Current input state
   */
  @State() currentInputState: InputState = "none";

  /**
   * Current error
   */
  @State() currentError = "";

  /**
   * Order descending
   */
  @State() orderDesc = false;

  /**
   * Order by column name
   */
  @State() currentOrderBy = "";

  /**
   * Filter modal is visible
   */
  @State() filterModalVisible = false;

  /**
   * Is pending request (create / update)
   */
  @State() pendingRequest = false;

  /**
   * Is currently searching
   */
  @State() isSearching = false;

  /**
   * Current transaction id of form
   */
  @State() currentFormTransactionId = "";

  /**
   * Event called when save button pressed
   */
  @Event() saveItem: EventEmitter<{
    /**
     * Item which is being saved
     */
    item: any;

    /**
     * Is edit operation?
     */
    isEdit?: boolean;

    /**
     * Transaction id for operation
     */
    transactionId?: string;

    /**
     * Callback which has to be executed when save is resolved
     * @emits error to display, empty string for if successful
     */
    afterSaveExecuted: EventEmitter<string>;
  }>;

  /**
   * Event for remove
   * @emits item to save
   */
  @Event() removeItem: EventEmitter<any>;

  /**
   * Event for search
   * @emits search string
   */
  @Event() searchItem: EventEmitter<string>;

  /**
   * Event to handle pagination
   * @emits page
   */
  @Event() pagination: EventEmitter<number>;

  /**
   * Event called when save request resolves
   * @emits error to display, empty string for if successful
   */
  @Event() afterSave: EventEmitter<string>;

  /**
   * Event called when order should be changed
   * @emits newOrder
   */
  @Event() changedOrder: EventEmitter<{
    orderBy: string;
    orderDesc: boolean;
  }>;

  /**
   * Before loading component
   */
  async componentWillLoad() {
    this.resetTransactionId();
  }

  /**
   * Resets current transaction id
   */
  resetTransactionId() {
    this.currentFormTransactionId = nanoid();
  }

  /**
   * Changes value of current item
   * @param key
   * @param val
   */
  changeValueCurrentItem(key: string, val: any) {
    const curr = this.currentItem;
    if (curr) {
      curr[key] = val;
      this.currentItem = curr;
    }
  }

  /**
   * Edit item
   * @param item
   */
  editItem(item: any) {
    this.resetTransactionId();
    this.currentItem = { ...item };
    this.currentInputState = "edit";
  }

  /**
   * Create item
   */
  createItem() {
    this.resetTransactionId();
    this.currentItem = {};
    this.currentInputState = "create";
  }

  /**
   * Handle save result finished
   * @param event which holds current error
   */
  @Listen("afterSave")
  afterSuccessHandler(event: CustomEvent<string>) {
    this.resetTransactionId();
    this.pendingRequest = false;
    if (event.detail?.trim().length > 0) {
      this.currentError = event.detail;
    } else {
      this.currentInputState = "none";
    }
  }

  /**
   * On remove item
   */
  @Listen("removeItem")
  deleteItem() {
    this.currentInputState = "none";
  }

  /**
   * On search item
   * @param event
   */
  @Listen("searchItem")
  searchHandler(event: CustomEvent<string>) {
    this.isSearching = event.detail.trim().length > 0;
  }

  /**
   * On pagination
   * @param event which holds current page
   */
  @Listen("pagination")
  paginationHandler(event: CustomEvent<number>) {
    this.currentPage = event.detail;
  }

  /**
   * Render list
   */
  render() {
    return (
      <Host>
        <to4st-filter-modal
          isVisible={this.filterModalVisible}
          onClose={() => (this.filterModalVisible = false)}
          filters={this.filters}
        ></to4st-filter-modal>
        <to4st-edit-modal
          freeze={this.pendingRequest}
          currentError={this.currentError}
          currentItem={this.currentItem}
          currentInputState={this.currentInputState}
          columns={this.columns}
          onCloseErrorMessage={() => (this.currentError = "")}
          onClose={e => {
            this.currentInputState = "none";
            this.currentError = "";
          }}
          onChangeKeyValue={e =>
            this.changeValueCurrentItem(e.detail.key, e.detail.value)
          }
          onDelete={() => this.removeItem.emit(this.currentItem)}
          onSave={e => {
            this.pendingRequest = true;
            this.saveItem.emit({
              transactionId: this.currentFormTransactionId,
              item: this.currentItem,
              isEdit: this.currentInputState == "edit",
              afterSaveExecuted: this.afterSave
            });
          }}
        ></to4st-edit-modal>

        <div
          class={{
            "modal loadingModal": true,
            "is-active": this.loadingInputBlock
          }}
        >
          <div class="modal-background"></div>
          <div class="modal-content">
            <figure class="image container is-32x32">
              <img
                src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif"
                alt="Loading ..."
              />
            </figure>
          </div>
        </div>

        <article class="message has-margin-top-30">
          <div class="message-header">
            <p>{this.name}</p>
          </div>
          <div class="message-body">
            <div class="level">
              <div class="level-left">
                <div class="field">
                  <div
                    class={{
                      control: true,
                      "is-hidden": !this.hasCreateUpdate
                    }}
                  >
                    <button
                      class="button is-success"
                      onClick={() => this.createItem()}
                    >
                      <i class="fas fa-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="level-right">
                <div
                  class={{
                    "field has-addons": true,
                    "is-hidden":
                      !this.hasSearch ||
                      (this.content.length === 0 && !this.isSearching)
                  }}
                >
                  <a
                    class={{
                      button: true,
                      "is-hidden": this.filters.length === 0
                    }}
                    onClick={e => (this.filterModalVisible = true)}
                  >
                    <i class="fas fa-filter"></i>
                  </a>
                  <p class="control has-icons-right">
                    <input
                      type="text"
                      class="input"
                      placeholder="Search"
                      onKeyUp={event =>
                        this.searchItem.emit(
                          (event.target as HTMLInputElement).value.trim()
                        )
                      }
                    />
                    <span class="icon is-small is-right">
                      <i class="fas fa-search"></i>
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <table
              class={{
                "table is-fullwidth is-hoverable": true,
                "is-striped": this.striped,
                "is-hidden":
                  this.content && this.content.length == 0 && !this.isSearching
              }}
            >
              <thead>
                {this.columns.map(col =>
                  !col.shouldBeVisible || col.shouldBeVisible() ? (
                    <th
                      class={{
                        "is-hidden-mobile":
                          col.hiddenMobile && col.hiddenMobile()
                      }}
                    >
                      {col.name}{" "}
                      {!col.sortable ? (
                        ""
                      ) : (
                        <a
                          onClick={e => {
                            this.orderDesc =
                              this.currentOrderBy !== col.name
                                ? true
                                : !this.orderDesc;
                            this.currentOrderBy = col.name;
                            this.changedOrder.emit({
                              orderBy: col.name,
                              orderDesc: this.orderDesc
                            });
                          }}
                        >
                          {this.currentOrderBy !== col.name ? (
                            <i class="fas fa-sort"></i>
                          ) : this.orderDesc ? (
                            <i class="fas fa-sort-up"></i>
                          ) : (
                            <i class="fas fa-sort-down"></i>
                          )}
                        </a>
                      )}
                    </th>
                  ) : (
                    ""
                  )
                )}
                {!this.hasCreateUpdate ? "" : <th></th>}
              </thead>
              <tbody>
                {this.content.map(item => (
                  <tr>
                    {this.columns.map(col =>
                      !col.shouldBeVisible || col.shouldBeVisible() ? (
                        <td class={{ "is-hidden-mobile": !!col.hiddenMobile }}>
                          {col.tableContent(item)}
                        </td>
                      ) : (
                        ""
                      )
                    )}
                    {!this.hasCreateUpdate ? (
                      ""
                    ) : (
                      <td>
                        <div class="level">
                          <div class="level-left"></div>
                          <div class="level-right">
                            <div class="field">
                              <p class="control">
                                <a
                                  class="button is-warning"
                                  onClick={() => this.editItem(item)}
                                >
                                  <i class="fas fa-edit"></i>
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div class="level">
              <div class="level-left">
                <a class="button is-info is-hidden">
                  <i class="fas fa-cog"></i>
                </a>
              </div>
              <div class="level-right">
                <nav
                  class={{
                    "pagination is-right": true,
                    "is-hidden": !this.hasPagination || this.content.length == 0
                  }}
                  role="navigation"
                  aria-label="pagination"
                >
                  <ul class="pagination-list">
                    <li>
                      <a
                        class={{
                          "pagination-link": true,
                          "is-hidden":
                            this.pagesCount < 3 || this.currentPage < 3
                        }}
                        onClick={() => this.pagination.emit(1)}
                      >
                        1
                      </a>
                    </li>
                    <li>
                      <span
                        class={{
                          "pagination-ellipsis": true,
                          "is-hidden":
                            this.pagesCount < 3 || this.currentPage < 4
                        }}
                      >
                        &hellip;
                      </span>
                    </li>
                    <li>
                      <a
                        class={{
                          "pagination-link": true,
                          "is-hidden": this.currentPage < 2
                        }}
                        onClick={() =>
                          this.pagination.emit(this.currentPage - 1)
                        }
                      >
                        {this.currentPage - 1}
                      </a>
                    </li>
                    <li>
                      <a class="pagination-link is-current">
                        {this.currentPage}
                      </a>
                    </li>
                    <li>
                      <a
                        class={{
                          "pagination-link": true,
                          "is-hidden": this.pagesCount < this.currentPage + 1
                        }}
                        onClick={() =>
                          this.pagination.emit(this.currentPage + 1)
                        }
                      >
                        {this.currentPage + 1}
                      </a>
                    </li>
                    <li>
                      <span
                        class={{
                          "pagination-ellipsis": true,
                          "is-hidden": this.pagesCount < this.currentPage + 3
                        }}
                      >
                        &hellip;
                      </span>
                    </li>
                    <li>
                      <a
                        class={{
                          "pagination-link": true,
                          "is-hidden": this.pagesCount < this.currentPage + 2
                        }}
                        onClick={() => this.pagination.emit(this.pagesCount)}
                      >
                        {this.pagesCount}
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </article>
      </Host>
    );
  }
}
