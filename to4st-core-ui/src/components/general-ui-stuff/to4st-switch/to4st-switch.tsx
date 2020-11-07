import { Component, h, EventEmitter, Event, Prop, Host } from "@stencil/core";

/**
 * Component which implements a simple switch
 */
@Component({
  tag: "to4st-switch"
})
export class To4stSwitch {
  /**
  * On toggle
  */
  @Event() toggle!: EventEmitter<boolean>;

  /**
   * Has label
   */
  @Prop() label = "";

  /**
   * Optional message
   */
  @Prop() message?: string;

  /**
   * Value
   */
  @Prop({ mutable: true }) value?: boolean;

  /**
   * Mirror
   */
  @Prop() rtl = false;

  @Prop() disabled = false;

  /**
   * Warning appearence
   */
  @Prop() isWarning = true;

  /**
   * Error appearence
   */
  @Prop() isError = false;
  componentDidLoad() {
    if (this.value !== undefined) {
      this.toggle.emit(this.value);
    }
  }
  /**
   * Toggle!
   */
  doToggle() {
    if(!this.disabled)
    {
      this.value = !this.value;
      this.toggle.emit(this.value);
    }
  }

  /**
   * Render switch
   */
  render() {
    return (
      <Host class="field">
        <p
          class={{
            control: true,
            "is-expanded": true,
            "has-margin-top-8": true
          }}
        >
          <input
            disabled={this.disabled}
            class={{
              switch: true,
              "is-danger": this.isError,
              "is-warning": this.isWarning,
              "is-rtl": this.rtl
            }}
            type="checkbox"
            checked={this.value}
          />
          <label style={{ top: "1px" }} onClick={() => this.doToggle()}>
            {this.label}
          </label>
        </p>
        {this.message === undefined ? (
          ""
        ) : (
          <p
            class={`help ${
              this.isError ? "is-danger" : this.isWarning ? "is-warning" : ""
            }`}
          >
            {this.message}
          </p>
        )}
      </Host>
    );
  }
}
