import { Component, ComponentInterface, Host, h, State } from "@stencil/core";

@Component({
  tag: "to4st-gameserver-settings",
  styleUrl: "to4st-gameserver-settings.scss",
  shadow: false,
})
export class To4stGameserverSettings implements ComponentInterface {
  render() {
    return (
      <Host>
        <section class="hero is-primary is-fullheight">
          <div class="hero-body">
            <div class="container">
              <div class="columns is-centered">
                <div class="column">
                  <to4st-gameserver-list></to4st-gameserver-list>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
