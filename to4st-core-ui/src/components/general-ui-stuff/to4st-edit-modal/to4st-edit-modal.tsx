import {
  Component,
  ComponentInterface,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
  State,
  Listen
} from "@stencil/core";
import { ColumnProps, InputState } from "../to4st-list/to4st-list";

/**
 * Edit modal component used by TO4ST-List
 */
@Component({
  tag: "to4st-edit-modal",
  styleUrl: "to4st-edit-modal.scss",
  shadow: false
})
export class To4stEditModal implements ComponentInterface {
  /**
   * Properties used to retrieve input elements
   */
  @Prop() columns = [] as ColumnProps[];

  /**
   * Freeze commit button
   */
  @Prop() freeze: boolean;

  /**
   * Current input state of modal
   */
  @Prop() currentInputState: InputState = "none";

  /**
   * Current item which is being edited
   */
  @Prop() currentItem: any;

  /**
   * Current input error
   */
  @Prop() currentError = "";

  /**
   * Delete button is active
   */
  @State() deleteActive = false;

  /**
   * Close event
   */
  @Event() close: EventEmitter<void>;

  /**
   * Save event
   */
  @Event() save: EventEmitter<void>;

  /**
   * Delete current item event
   */
  @Event() delete: EventEmitter<void>;

  /**
   * Close error message event
   */
  @Event() closeErrorMessage: EventEmitter<void>;

  /**
   * Event used to change a value of current item
   */
  @Event() changeKeyValue: EventEmitter<{ key: string; value: any }>;

  /**
   * Executes on save
   */
  @Listen("save")
  onSave() {
    this.currentError = "";
  }

  /**
   * Execute on delete
   */
  @Listen("delete")
  onDelete() {
    this.deleteActive = false;
  }

  /**
   * Render modal
   */
  render() {
    return (
      <Host>
        <div
          class={{ modal: true, "is-active": this.currentInputState != "none" }}
        >
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">
                {this.currentInputState == "create" ? "Create" : "Edit"}
              </p>
              <button
                class="delete"
                aria-label="close"
                onClick={() => this.close.emit()}
              ></button>
            </header>
            <section class="modal-card-body">
              <div
                class={{
                  "notification is-danger": true,
                  "is-hidden": this.currentError.length == 0
                }}
              >
                <button
                  class="delete"
                  onClick={() => this.closeErrorMessage.emit()}
                ></button>
                {this.currentError}
              </div>
              {this.columns.map(props =>
                props.input ? (
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">{props.name}</label>
                    </div>
                    <div class="field-body">
                      <div class="control">
                        {props.input(
                          this.currentItem,
                          this.changeKeyValue,
                          this.currentInputState === "create"
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )
              )}
            </section>
            <footer class="modal-card-foot">
              <div class="container">
                <div class="level">
                  <div class="level-left">
                    <div class="level-item">
                      <div class="field level-item">
                        <div class="control">
                          <button
                            class="button is-success"
                            disabled={this.freeze}
                            onClick={() => this.save.emit()}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="level-item">
                      <div class="field ">
                        <div class="control">
                          <button
                            class="button"
                            onClick={() => this.close.emit()}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class={{
                      "level-right": true,
                      "is-hidden": this.currentInputState != "edit"
                    }}
                  >
                    <div class={"level-item"}>
                      <div class="field">
                        <div class="control">
                          <to4st-switch
                            value={this.deleteActive}
                            onToggle={e => (this.deleteActive = e.detail)}
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
                              disabled={!this.deleteActive}
                              onClick={() => this.delete.emit()}
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
            </footer>
          </div>
        </div>
      </Host>
    );
  }
}
