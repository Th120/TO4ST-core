import { Component, h, ComponentInterface, State } from "@stencil/core";
import jwt_decode from "jwt-decode";

import { app } from "../../global/context";
import { AppConfig } from "../../libs/api-client/schema";
import { APIClient, createAPI } from "../../libs/api";

/**
 * Token key local storare
 */
const TOKEN_KEY = "TO4ST-core_Token";

/**
 * Root component
 * Initialises website
 * Handles appConfig
 */
@Component({
  tag: "to4st-root",
  styleUrl: "to4st-root.scss",
  shadow: false
})
export class To4stRoot implements ComponentInterface {
  /**
   * API client
   */
  @app.Provide("api") api: APIClient;

  /**
   * Current appConfig
   */
  @app.Provide("appConfig") appConfig: AppConfig;

  /**
   * Is logged in as admin?
   */
  @app.Provide("isAdmin") isAdmin: boolean;

  /**
   * Refresh appConfig
   * @param updated Override instead of fetching from API
   */
  async refreshAppConfig(updated: AppConfig = null) {
    if (updated) {
      this.appConfig = updated;
    } else {
      try {
        this.appConfig = await this.api.client.chain.query
          .appConfig({ cached: !this.isAdmin })
          .execute({
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
          });
      } catch (e) {
        console.error(e);
      }
    }
  }

  /**
   * Init website
   */
  async componentWillLoad() {
    const oldToken = localStorage.getItem(TOKEN_KEY);

    this.api = createAPI();

    const decoded: any = oldToken?.length > 0 ? jwt_decode(oldToken) : null;

    if (decoded?.exp) {
      const expiredAt = new Date(decoded.exp * 1000);
      const yesterday = new Date(new Date().valueOf() - 1000 * 60 * 60 * 24); //at least one day should remain to avoid token being invalidated during session
      if (expiredAt.valueOf() > yesterday.valueOf()) {
        this.api = createAPI(oldToken);

        try {
          const validToken = await this.api.client.chain.query.authValid.execute();
          if (validToken) {
            this.isAdmin = true;
          } else {
            localStorage.removeItem(TOKEN_KEY);
            this.api = createAPI();
          }
        } catch (e) {
          localStorage.removeItem(TOKEN_KEY);
          this.api = createAPI();
          console.error(e);
        }
      }
    }

    await this.refreshAppConfig();
  }

  /**
   * Handle login
   * @param loginResult current appConfig, token
   */
  async afterSuccessfulLogin(loginResult: {
    appconfig: AppConfig;
    token: string;
  }) {
    localStorage.setItem(TOKEN_KEY, loginResult.token);
    this.isAdmin = true;
    this.appConfig = loginResult.appconfig;
    this.loginOpen = false;
    this.api = await createAPI(loginResult.token);
  }

  /**
   * Logout
   */
  logout() {
    this.isAdmin = false;
    localStorage.removeItem(TOKEN_KEY);
  }

  /**
   * Login modal open
   */
  @State() loginOpen: boolean;

  /**
   * Render root
   */
  render() {
    return (
      <div>
        <to4st-header
          onLogin={() => (this.loginOpen = true)}
          onLogout={e => this.logout()}
        ></to4st-header>
        <to4st-login-modal
          visible={this.loginOpen}
          onClose={() => (this.loginOpen = false)}
          onSuccessfulLogin={e => this.afterSuccessfulLogin(e.detail)}
        ></to4st-login-modal>
        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="to4st-home" exact={true} />
              <stencil-route url="/to4st-settings" component="to4st-settings" />
              <stencil-route
                url="/gameserver-settings"
                component="to4st-gameserver-settings"
              />
              <stencil-route
                url="/registered-players"
                component="to4st-registered-players-settings"
              />
              <stencil-route
                url="/player-statistics"
                component="to4st-player-statistics"
              />
            </stencil-route-switch>
          </stencil-router>
        </main>
      </div>
    );
  }
}
