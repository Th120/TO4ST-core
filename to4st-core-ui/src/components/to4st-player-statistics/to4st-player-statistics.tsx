import { Component, Host, h, ComponentInterface } from "@stencil/core";

/**
 * Player stats wrapper
 */
@Component({
  tag: "to4st-player-statistics",
  styleUrl: "to4st-player-statistics.scss",
  shadow: false,
})
export class To4stPlayerStatistics implements ComponentInterface {
  /**
   * Render player stats
   */
  render() {
    return (
      <Host>
        <section class="hero is-primary is-fullheight">
          <div class="hero-body">
            <div class="container">
              <div class="columns is-centered">
                <div class="column">
                  <to4st-player-statistics-list></to4st-player-statistics-list>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
