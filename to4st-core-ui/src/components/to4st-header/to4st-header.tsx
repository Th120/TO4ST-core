import {
  Component,
  Host,
  h,
  State,
  Event,
  Prop,
  ComponentInterface,
  EventEmitter,
  Listen,
} from "@stencil/core";
import { RouterHistory, injectHistory } from "@stencil/router";

import { app } from "../../global/context";
import { TAppInfoApi } from "../../services/app-config.service";

/**
 * Navbar item interface
 */
interface NavbarItem {
  /**
   * Title of item
   */
  title: string;

  /**
   * Should be visible predicate
   */
  condition?: () => boolean;

  /**
   * URL of component
   */
  url?: string;

  /**
   * Item with children
   */
  children?: Omit<NavbarItem, "children">[];
}

/**
 * Header of website
 */
@Component({
  tag: "to4st-header",
  styleUrl: "to4st-header.scss",
  shadow: false,
})
export class To4stHeader implements ComponentInterface {
  /**
   * Current router history
   */
  @Prop() history: RouterHistory;

  /**
   * Is navbar active
   */
  @State() navbarActive = false;

  /**
   * Items which are added to the navbar
   */
  navbarItems: NavbarItem[] = [
    {
      title: "Home",
      url: "/",
    },
    {
      title: "Player Statistics",
      url: "/player-statistics",
      condition: () => !!this.isAdmin || !!this.appConfig?.publicStats,
    },
    {
      title: "Gameserver Config",
      url: "/gameserver-config",
      condition: () => !!this.isAdmin,
    },
    {
      title: "Settings",
      children: [
        {
          title: "TO4ST",
          url: "/to4st-settings",
        },
        {
          title: "Gameservers",
          url: "/gameserver-settings",
        },
        {
          title: "Registered Players",
          url: "/registered-players",
        },
      ],
      condition: () => !!this.isAdmin,
    },
  ];

  /**
   * Current appConfig
   */
  @app.Context("appConfig") appConfig!: TAppInfoApi;

  /**
   * Logged in as admin?
   */
  @app.Context("isAdmin") isAdmin = false;

  /**
   * Login event
   */
  @Event() login: EventEmitter<void>;

  /**
   * Logout event
   */
  @Event() logout: EventEmitter<void>;

  /**
   * Go back to homepage on logout
   */
  @Listen("logout")
  goHome() {
    this.history.replace("/", {});
  }

  /**
   * Render header
   */
  render() {
    return (
      <Host>
        <nav
          class="navbar is-fixed-top"
          role="navigation"
          aria-label="main navigation"
        >
          <div class="navbar-brand">
            <a class="navbar-item" href="https://to4.co">
              <img src="./assets/to4stCoreLogo.png" width="198" height="19" />
            </a>
            <a
              role="button"
              class={{
                "navbar-burger": true,
                burger: true,
                "is-active": this.navbarActive,
              }}
              aria-label="menu"
              aria-expanded="false"
              onClick={() => (this.navbarActive = !this.navbarActive)}
            >
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>
          <div
            class={{
              "navbar-menu": true,
              "is-active": this.navbarActive,
            }}
          >
            <div class="navbar-start">
              {this.navbarItems
                .filter((item) => item.condition?.() ?? true)
                .map((item) =>
                  !item.children
                    ? this.renderNavItem(item)
                    : this.renderNavDropdown(item)
                )}
            </div>
            <div class="navbar-end">
              <div class="navbar-item">
                <a
                  class={{ "button is-light": true }}
                  onClick={(e) =>
                    this.isAdmin ? this.logout.emit() : this.login.emit()
                  }
                >
                  {this.isAdmin ? "Logout" : "Login"}
                </a>
              </div>
            </div>
          </div>
        </nav>
      </Host>
    );
  }

  /**
   * Render dropdown item
   * @param item
   */
  renderNavDropdown(item: NavbarItem) {
    return (
      <a class="navbar-item has-dropdown is-hoverable">
        <a class="navbar-link">{item.title}</a>
        <div class="navbar-dropdown">
          {item.children
            .filter((child) => child.condition?.() ?? true)
            .map((child) => this.renderNavItem(child))}
        </div>
      </a>
    );
  }

  /**
   * Render single navbar item
   * @param item
   */
  renderNavItem(item: Omit<NavbarItem, "children">) {
    return (
      <stencil-route-link
        class="navbar-item"
        anchorClass="navbar-link is-arrowless"
        url={item.url}
        exact={true}
      >
        {item.title}
      </stencil-route-link>
    );
  }
}

injectHistory(To4stHeader);
