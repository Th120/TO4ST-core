import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State
} from "@stencil/core";

import { Gameserver, APIClient, GameserverConfig, MatchConfig } from "../../libs/api";

import { app } from "../../global/context";

import { ColumnDetailProps } from "../general-ui-stuff/to4st-details/to4st-details";



@Component({
  tag: "to4st-gameserver-config",
  styleUrl: "to4st-gameserver-config.scss",
  shadow: false
})
export class To4stGameserverConfig implements ComponentInterface {
  
  /**
   * Current matchConfigs
   */
  @app.Provide("matchConfigs") matchConfigs!: MatchConfig[];

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
