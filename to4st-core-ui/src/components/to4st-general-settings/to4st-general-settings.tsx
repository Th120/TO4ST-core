import { Component, ComponentInterface, Host, h, State } from "@stencil/core";

import { app } from "../../global/context";
import { AppConfig, AppConfigInput, APIClient } from "../../libs/api";
import { extractGraphQLErrors, hashPassword } from "../../libs/utils";

/**
 * Min password length to set
 */
const MIN_PW_LENGTH = 9;

/**
 * Component to update appConfig
 */
@Component({
  tag: "to4st-general-settings",
  styleUrl: "to4st-general-settings.scss",
  shadow: false
})
export class To4stGeneralSettings implements ComponentInterface {
  /**
   * Current appConfig
   */
  @app.Context("appConfig") appConfig!: AppConfig;

  /**
   * API client
   */
  @app.Context("api") apiClient = {} as APIClient;

  /**
   * Current form password
   */
  @State() currentPassword = "";

  /**
   * Current form password repeat
   */
  @State() currentRepeat = "";

  /**
   * Current form masterserver key
   */
  @State() to4stMasterKey = "";

  /**
   * Current form steam api key
   */
  @State() steamWebApiKey = "";

  /**
   * Current form address override
   */
  @State() addressOverride = "";

  /**
   * Current form public ban query
   */
  @State() publicBanQuery = false;

  /**
   * Current form public stats
   */
  @State() publicStats = false;

  /**
   * Min score needed for players to be visible in aggregated player stats
   */
  @State() minScoreStats = 100;

  /**
   * PlayerStats cache max age
   */
  @State() playerStatsCacheAge = 5;
  
  

  /**
   * Current error
   */
  @State() currentError = "";

  /**
   * Handle appConfig refresh
   */
  @app.Observe("appConfig")
  onAppConfigUpdated() {
    this.to4stMasterKey = this.appConfig?.masterserverKey;
    this.publicBanQuery = this.appConfig?.publicBanQuery;
    this.publicStats = this.appConfig?.publicStats;
    this.steamWebApiKey = this.appConfig?.steamWebApiKey;
    this.addressOverride = this.appConfig?.ownAddress;
    this.minScoreStats = this.appConfig?.minScoreStats;
    this.playerStatsCacheAge = this.appConfig?.playerStatsCacheAge;
  }

  /**
   * Has pending changes compared to current appConfig
   */
  hasPendingChanges() {
    return this.appConfig
      ? this.currentPassword?.length > 0 ||
          this.publicBanQuery !== this.appConfig.publicBanQuery ||
          this.publicStats !== this.appConfig.publicStats ||
          this.minScoreStats !== this.appConfig.minScoreStats ||
          this.playerStatsCacheAge!== this.appConfig.playerStatsCacheAge ||
          this.to4stMasterKey?.trim() !==
            this.appConfig.masterserverKey?.trim() ||
          this.addressOverride?.trim() !== this.appConfig.ownAddress?.trim() ||
          this.steamWebApiKey?.trim() !== this.appConfig.steamWebApiKey?.trim()
      : false;
  }

  /**
   * Commit new appConfig
   */
  async commit() {
    const input = {} as AppConfigInput;

    this.currentError = "";

    if (this.currentPassword.length >= MIN_PW_LENGTH) {
      if (this.currentPassword === this.currentRepeat) {
        input.password = hashPassword(this.currentPassword);
      } else {
        this.currentError = "Passwords do not match.";
      }
    }
    else if(this.currentPassword.length > 0)
    {
      this.currentError = `Password must have at least ${MIN_PW_LENGTH} characters.`;
    }

    input.masterserverKey = this.to4stMasterKey;
    input.publicBanQuery = this.publicBanQuery;
    input.publicStats = this.publicStats;
    input.steamWebApiKey = this.steamWebApiKey;
    input.ownAddress = this.addressOverride || undefined;
    input.playerStatsCacheAge = this.playerStatsCacheAge;
    input.minScoreStats = this.minScoreStats;

    if (this.currentError) {
      return;
    }

    try {
      const newcfg = await this.apiClient.client.chain.mutation
        .updateAppConfig({ appConfig: input })
        .execute({
          instanceId: true,
          publicStats: true,
          publicBanQuery: true,
          banlistPartners: true,
          masterserverKey: true,
          steamWebApiKey: true,
          ownAddress: true,
          minScoreStats: true,
          playerStatsCacheAge: true,
          appInfo: {
            uniquePlayers: true,
            gamesPlayed: true,
            roundsPlayed: true,
            activeBans: true
          }
        });

      this.appConfig = newcfg;

      this.currentPassword = "";
      this.currentRepeat = "";
    } catch (e) {
      console.log(e)
      this.currentError = extractGraphQLErrors(e);
    }
  }

  /**
   * Render appConfig settings
   */
  render() {
    const hasPendingChanges = this.hasPendingChanges();
    const pwEq = this.currentRepeat === this.currentPassword;
    return (
      <Host>
        <article class="message has-margin-top-30">
          <div class="message-header">
            <p>General Settings</p>
          </div>
          <div class="message-body">
            <div
              class={{
                "notification is-danger": true,
                "is-hidden": this.currentError.length == 0
              }}
            >
              <button
                class="delete"
                onClick={() => (this.currentError = "")}
              ></button>
              {this.currentError}
            </div>
            <form>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Instance Id</label>
                </div>
                <div class="field-body has-text-botton">
                  <p>{this.appConfig?.instanceId}</p>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Public statistics</label>
                </div>
                <div class="field-body">
                  <to4st-switch
                    value={this.publicStats}
                    onToggle={e => (this.publicStats = e.detail)}
                  ></to4st-switch>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Public bancheck</label>
                </div>
                <div class="field-body">
                  <to4st-switch
                    value={this.publicBanQuery}
                    onToggle={e => (this.publicBanQuery = e.detail)}
                  ></to4st-switch>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Password</label>
                </div>
                <div class="field-body">
                  <div class="control">
                    <input
                      class="input"
                      type="password"
                      placeholder="Password"
                      value={this.currentPassword}
                      onKeyUp={e =>
                        (this.currentPassword = (e.target as HTMLInputElement).value.trim())
                      }
                      onChange={e =>
                        (this.currentPassword = (e.target as HTMLInputElement).value.trim())
                      }
                    />
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Repeat Password</label>
                </div>
                <div class="field-body">
                  <div class="control">
                    <input
                      class={{
                        input: true,
                        "is-success": pwEq && this.currentPassword !== "",
                        "is-danger":
                          this.currentPassword.length > 0 &&
                          this.currentRepeat.length > 0 &&
                          !pwEq,
                        "is-warning":
                          this.currentPassword.length > 0 &&
                          this.currentRepeat.length == 0
                      }}
                      type="password"
                      placeholder="Repeat Password"
                      value={this.currentRepeat}
                      onChange={e =>
                        (this.currentRepeat = (e.target as HTMLInputElement).value.trim())
                      }
                      onKeyUp={e =>
                        (this.currentRepeat = (e.target as HTMLInputElement).value.trim())
                      }
                    />
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">TO4ST-masterkey</label>
                </div>
                <div class="field-body">
                  <div class="control">
                    <input
                      class="input"
                      type="text"
                      placeholder="Key"
                      value={this.to4stMasterKey}
                      onChange={e =>
                        (this.to4stMasterKey = (e.target as HTMLInputElement).value.trim())
                      }
                      onKeyUp={e =>
                        (this.to4stMasterKey = (e.target as HTMLInputElement).value.trim())
                      }
                    />
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">TO4ST-master Address override</label>
                </div>
                <div class="field-body">
                  <div class="control">
                    <span
                      class="has-tooltip-arrow"
                      data-tooltip={"Enter the tld-address the master \nshould use to contact your backend, e.g. 'https://abc.de'"}
                    >
                      <input
                        class="input"
                        type="text"
                        placeholder=""
                        value={this.addressOverride}
                        onChange={e =>
                          (this.addressOverride = (e.target as HTMLInputElement).value.trim())
                        }
                        onKeyUp={e =>
                          (this.addressOverride = (e.target as HTMLInputElement).value.trim())
                        }
                      />
                    </span>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Min score for aggregated player statistics</label>
                </div>
                <div class="field-body">
                  <div class="control">
                    <span
                      class="has-tooltip-arrow"
                      data-tooltip={"Min score needed for players to be visible in aggregated player stats"}
                    >
                    <input type="number" placeholder="Min Score" min="0" value={this.minScoreStats ?? 0} class="input" onChange={e =>
                          (this.minScoreStats = parseInt((e.target as HTMLInputElement).value.trim()))
                        }
                        onKeyUp={e =>
                          (this.minScoreStats = parseInt((e.target as HTMLInputElement).value.trim()))
                        } />
                    </span>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Player statistics Cache MaxAge</label>
                </div>
                <div class="field-body">
                  <div class="control">
                    <span
                      class="has-tooltip-arrow"
                      data-tooltip={"In minutes, 0 to disable Cache"}
                    >
                    <input type="number" placeholder="minutes" min="0" value={this.playerStatsCacheAge ?? 0} class="input" onChange={e =>
                          (this.playerStatsCacheAge = parseInt((e.target as HTMLInputElement).value.trim()))
                        }
                        onKeyUp={e =>
                          (this.playerStatsCacheAge = parseInt((e.target as HTMLInputElement).value.trim()))
                        } />
                    </span>
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal">
                  <label class="label">Steam Web API Key</label>
                </div>
                <div class="field-body">
                  <div class="control">
                    <input
                      class="input"
                      type="text"
                      placeholder="Key"
                      value={this.steamWebApiKey}
                      onChange={e =>
                        (this.steamWebApiKey = (e.target as HTMLInputElement).value.trim())
                      }
                      onKeyUp={e =>
                        (this.steamWebApiKey = (e.target as HTMLInputElement).value.trim())
                      }
                    />
                  </div>
                </div>
              </div>
              <div class="field is-horizontal">
                <div class="field-label is-normal"></div>
                <div class="field-body">
                  <p>
                    <a
                      target="_blank"
                      href="https://partner.steamgames.com/doc/webapi_overview/auth"
                    >
                      Visit the Steamworks docs to get your own user key
                    </a>
                  </p>
                </div>
              </div>

              <div class="control">
                <a
                  class={{
                    "button has-margin-top-30": true,
                    "is-primary": !hasPendingChanges,
                    "is-warning": hasPendingChanges
                  }}
                  onClick={e => this.commit()}
                >
                  Save
                </a>
              </div>
            </form>
          </div>
        </article>
      </Host>
    );
  }
}
