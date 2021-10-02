import {
  Component,
  ComponentInterface,
  Host,
  h,
  Prop,
  Event,
  EventEmitter,
} from "@stencil/core";
import { FilterProps } from "../to4st-list/to4st-list";

/**
 * Modal used to filter TO4ST-List
 */
@Component({
  tag: "to4st-filter-modal",
  styleUrl: "to4st-filter-modal.scss",
  shadow: false,
})
export class To4stFilterModal implements ComponentInterface {
  /**
   * Filter properties
   */
  @Prop() filters = [] as FilterProps[];

  /**
   * Filter visibility
   */
  @Prop() isVisible = false;

  /**
   * Close event
   */
  @Event() close: EventEmitter<void>;

  /**
   * Render filter modal
   */
  render() {
    return (
      <Host>
        <div class={{ modal: true, "is-active": this.isVisible }}>
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Filter</p>
              <button
                class="delete"
                aria-label="close"
                onClick={() => this.close.emit()}
              ></button>
            </header>
            <section class="modal-card-body">
              {this.filters.map((props) =>
                props.input ? (
                  <div class="field is-horizontal">
                    <div class="field-label is-normal">
                      <label class="label">{props.name}</label>
                    </div>
                    <div class="field-body">
                      <div class="control">{props.input(props.name)}</div>
                    </div>
                  </div>
                ) : (
                  ""
                )
              )}
            </section>
          </div>
        </div>
      </Host>
    );
  }
}
