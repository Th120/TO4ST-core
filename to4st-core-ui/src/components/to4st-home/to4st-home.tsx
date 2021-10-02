import { Component, Host, h, ComponentInterface } from "@stencil/core";

import { app } from "../../global/context";
import { TAppInfoApi } from "../../services/app-config.service";

/**
 * Homepage component
 */
@Component({
  tag: "to4st-home",
  styleUrl: "to4st-home.scss",
  shadow: false,
})
export class To4stHome implements ComponentInterface {
  /**
   * Current appConfig
   */
  @app.Context("appConfig") appConfig!: TAppInfoApi;

  /**
   * Render homepage
   */
  render() {
    return (
      <Host>
        <section class="hero is-primary is-fullheight">
          <div class="hero-body">
            <div class="container">
              <div class="columns is-centered">
                <div class="column is-narrow">
                  <article class="message">
                    <div class="message-header">
                      <p>Status</p>
                    </div>
                    <div class="message-body">
                      <table class="table">
                        <tbody>
                          <tr>
                            <td>Matches played</td>
                            <td>{this.appConfig?.appInfo?.gamesPlayed ?? 0}</td>
                          </tr>
                          <tr>
                            <td>Rounds played</td>
                            <td>
                              {this.appConfig?.appInfo?.roundsPlayed ?? 0}
                            </td>
                          </tr>
                          <tr>
                            <td>Unique players</td>
                            <td>
                              {this.appConfig?.appInfo?.uniquePlayers ?? 0}
                            </td>
                          </tr>
                          <tr>
                            <td>Active Bans</td>
                            <td>{this.appConfig?.appInfo?.activeBans ?? 0}</td>
                          </tr>
                          <tr>
                            <td>Public Banquery</td>
                            <td>
                              {this.appConfig.publicBanQuery
                                ? "enabled"
                                : "disabled"}
                            </td>
                          </tr>
                          <tr>
                            <td>Public Stats</td>
                            <td>
                              {this.appConfig.publicStats
                                ? "enabled"
                                : "disabled"}
                            </td>
                          </tr>
                          <tr>
                            <td>API URL</td>
                            <td>{window.location.origin}/graphql</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Host>
    );
  }
}
