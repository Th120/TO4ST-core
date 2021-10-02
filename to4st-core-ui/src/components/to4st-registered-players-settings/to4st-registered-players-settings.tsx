import { Component, ComponentInterface, Host, h } from "@stencil/core";

/**
 * Registered player settings
 */
@Component({
  tag: "to4st-registered-players-settings",
  styleUrl: "to4st-registered-players-settings.scss",
  shadow: false,
})
export class To4stRegisteredPlayersSettings implements ComponentInterface {
  /**
   * Render registered player list
   */
  render() {
    return (
      <Host>
        <section class="hero is-primary is-fullheight">
          <div class="hero-body">
            <div class="container">
              <div class="columns is-centered">
                <div class="column">
                  <to4st-registered-players-list></to4st-registered-players-list>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
