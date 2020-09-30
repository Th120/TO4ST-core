import { Component, ComponentInterface, Host, h } from '@stencil/core';


/**
 * App settings
 */
@Component({
  tag: 'to4st-settings',
  styleUrl: 'to4st-settings.scss',
  shadow: false,
})
export class To4stSettings implements ComponentInterface {

  /**
   * Render settings
   */
  render() {
    return (
      <Host>
        <section class="hero is-primary is-fullheight">
          <div class="hero-body">
            <div class="container">
                <div class="columns is-centered">
                  <div class="column">
                    <to4st-general-settings></to4st-general-settings>
                    <to4st-banlist-partners></to4st-banlist-partners>
                    <to4st-api-keys></to4st-api-keys>
                  </div>
             </div>
            </div>
          </div>
        </section>
       
      </Host>
    );
  }

}
