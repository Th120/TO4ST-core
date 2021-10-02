import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State,
} from "@stencil/core";

import { app } from "../../global/context";
import { TMatchConfig } from "../../services/gameserver.service";

@Component({
  tag: "to4st-gameserver-config",
  styleUrl: "to4st-gameserver-config.scss",
  shadow: false,
})
export class To4stGameserverConfig implements ComponentInterface {
  /**
   * Current matchConfigs
   */
  @app.Provide("matchConfigs") matchConfigs = [] as TMatchConfig[];

  render() {
    return (
      <Host>
        <section class="hero is-primary is-fullheight">
          <div class="hero-body">
            <div class="container is-max-widescreen">
              <div class="columns is-centered">
                <div class="column">
                  <to4st-gameserver-config-list></to4st-gameserver-config-list>
                  <to4st-match-config-list></to4st-match-config-list>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
