import {
  Component,
  ComponentInterface,
  Host,
  Event,
  EventEmitter,
  h,
  Prop,
  State
} from "@stencil/core";


import { APIClient, AppConfig } from "../../libs/api";
import { app } from "../../global/context";
import { extractGraphQLErrors, hashPassword } from "../../libs/utils";


/**
 * Login modal
 */
@Component({
  tag: "to4st-login-modal",
  styleUrl: "to4st-login-modal.scss",
  shadow: false
})
export class To4stLoginModal implements ComponentInterface {
  /**
   * Close login modal event
   */
  @Event() close: EventEmitter<void>;

  /**
   * Successful login event
   */
  @Event() successfulLogin: EventEmitter<{
    /**
     * Current appConfig
     */
    appconfig: AppConfig;

    /**
     * Current JWT
     */
    token: string;
  }>;

  /**
   * Is visible?
   */
  @Prop() visible: boolean;

  /**
   * Current password input
   */
  @State() currentPw: string;

  /**
   * Current error
   */
  @State() currentError = "";

  /**
   * API client
   */
  @app.Context("api") apiClient = {} as APIClient;

  /**
   * Login 
   */
  async login() {
    if (this.currentPw?.length > 0) {
      try {
        const loginResponse = await this.apiClient.client.chain.mutation
          .login({ password: hashPassword(this.currentPw) })
          .execute({
            jwt: true,
            appConfig: {
              instanceId: true,
              publicStats: true,
              publicBanQuery: true,
              banlistPartners: true,
              masterserverKey: true,
              steamWebApiKey: true,
              ownAddress: true,
              appInfo: {
                uniquePlayers: true,
                gamesPlayed: true,
                roundsPlayed: true,
                activeBans: true
              }
            }
          });

        this.successfulLogin.emit({
          appconfig: loginResponse.appConfig,
          token: loginResponse.jwt
        });
      } catch (e) {
        this.currentError = extractGraphQLErrors(e);
      }

      this.currentPw = "";
    }
  }

  /**
   * Render login
   */
  render() {
    return (
      <Host>
        <div class={{ modal: true, "is-active": this.visible }}>
          <div class="modal-background"></div>
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Login</p>
              <button
                class="delete"
                aria-label="close"
                onClick={e => this.close.emit()}
              ></button>
            </header>
            <section class="modal-card-body">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  this.login();
                }}
              >
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
                <div class="field has-addons">
                  <p class="control">
                    <input
                      type="password"
                      class={{
                        input: true,
                        "is-danger": this.currentError.length > 0
                      }}
                      placeholder="Password"
                      value={this.currentPw}
                      onChange={e =>
                        (this.currentPw = (e.target as HTMLInputElement).value.trim())
                      }
                    />
                  </p>
                  <p class="control">
                    <a class="button is-primary" onClick={e => this.login()}>
                      Login
                    </a>
                  </p>
                </div>
              </form>
            </section>
          </div>
        </div>
      </Host>
    );
  }
}
