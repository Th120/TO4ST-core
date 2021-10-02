import { Component, h, ComponentInterface, State } from "@stencil/core";
import jwt_decode from "jwt-decode";

import { app } from "../../global/context";
import { createAPI, TApiClient } from "../../libs/api";
import {
  AppConfigService,
  TAppInfoApi,
} from "../../services/app-config.service";

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
  shadow: false,
})
export class To4stRoot implements ComponentInterface {
  /**
   * API client
   */
  @app.Provide("api") api: TApiClient;

  /**
   * Current appConfig
   */
  @app.Provide("appConfig") appConfig: TAppInfoApi;

  /**
   * Is logged in as admin?
   */
  @app.Provide("isAdmin") isAdmin: boolean;

  /**
   * Refresh appConfig
   */
  async refreshAppConfig() {
    try {
      this.appConfig = await AppConfigService.get(this.api).appInfo(
        !this.isAdmin
      );
    } catch (e) {
      console.error(e);
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
          const validToken = await this.api.client.query({ authValid: true });
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
    appconfig: TAppInfoApi;
    token: string;
  }) {
    localStorage.setItem(TOKEN_KEY, loginResult.token);
    this.api = createAPI(loginResult.token);
    this.isAdmin = true;
    this.appConfig = loginResult.appconfig;
    this.loginOpen = false;
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
          onLogout={(e) => this.logout()}
        ></to4st-header>
        <to4st-login-modal
          visible={this.loginOpen}
          onClose={() => (this.loginOpen = false)}
          onSuccessfulLogin={(e) => this.afterSuccessfulLogin(e.detail)}
        ></to4st-login-modal>
        <main>
          <stencil-router>
            <stencil-route-switch scrollTopOffset={0}>
              <stencil-route url="/" component="to4st-home" exact={true} />
              <stencil-route
                url="/gameserver-config"
                component="to4st-gameserver-config"
              />
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
