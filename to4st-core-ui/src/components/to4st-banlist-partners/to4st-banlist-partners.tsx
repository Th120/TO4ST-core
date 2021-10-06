import {
  Component,
  ComponentInterface,
  Host,
  h,
  State,
  EventEmitter,
} from "@stencil/core";
import { TApiClient } from "../../libs/api";
import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";
import {
  AppConfigService,
  TAppInfoApi,
} from "../../services/app-config.service";

/**
 * Interface by list to handle banlist partner url
 */
interface BanlistPartner {
  /**
   * Id used by list
   */
  id: number;

  /**
   * URL of partner
   */
  URL: string;
}

/**
 * List of banlist partners
 */
@Component({
  tag: "to4st-banlist-partners",
  styleUrl: "to4st-banlist-partners.scss",
  shadow: false,
})
export class To4stBanlistPartners implements ComponentInterface {
  /**
   * Current content
   */
  @State() partners = [] as BanlistPartner[];

  /**
   * App config
   */
  @app.Context("appConfig") appConfig!: TAppInfoApi;

  /**
   * API client
   */
  @app.Context("api") apiClient = {} as TApiClient;

  /**
   * Columns of banlist partner type
   */
  columns = [
    {
      name: "URL",
      tableContent: (key) => <p>{key.URL}</p>,
      input: (item, cb) => (
        <input
          type="text"
          placeholder="URL"
          value={item?.URL ?? ""}
          class="input"
          onChange={(event) =>
            cb.emit({
              key: "URL",
              value: (event.target as HTMLInputElement).value.trim(),
            })
          }
        />
      ),
    },
  ];

  /**
   * Update content of config change
   */
  @app.Observe("appConfig")
  onAppConfigUpdated() {
    this.partners = this.appConfig?.banlistPartners?.map((s, i) => ({
      URL: s,
      id: i,
    }));
  }

  /**
   * Save banlist partner
   * @param partner
   * @param isEdit
   * @param afterEx Callback executed when request resolves
   */
  async saveBanlistPartner(
    partner: BanlistPartner,
    isEdit: boolean,
    afterEx: EventEmitter<string>
  ) {
    const currPartners = [...this.partners];
    if (isEdit) {
      currPartners[partner.id].URL = partner.URL;
    } else {
      currPartners.push(partner);
    }

    try {
      const newcfg = await AppConfigService.get(
        this.apiClient
      ).createUpdateAppConfig({
        banlistPartners: currPartners.map((p) => p.URL),
      });
      afterEx.emit("");
      this.appConfig = newcfg;
    } catch (e) {
      console.error("err", e);
      afterEx.emit(extractGraphQLErrors(e));
    }
  }

  /**
   * Removes banlist partner
   * @param partner
   */
  async removeBanlistPartner(partner: BanlistPartner) {
    const filteredMapped = this.partners
      .filter((p) => p.id != partner.id)
      .map((p) => p.URL);

    try {
      const newcfg = await AppConfigService.get(
        this.apiClient
      ).createUpdateAppConfig({
        banlistPartners: filteredMapped,
      });
      this.appConfig = newcfg;
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Render banlist partners
   */
  render() {
    return (
      <Host>
        <to4st-list
          name="Banlist Partners"
          columns={this.columns}
          content={this.partners}
          hasSearch={false}
          hasPagination={false}
          onSaveItem={(e) =>
            this.saveBanlistPartner(
              e.detail.item,
              e.detail.isEdit,
              e.detail.afterSaveExecuted
            )
          }
          onRemoveItem={(e) => this.removeBanlistPartner(e.detail)}
        ></to4st-list>
      </Host>
    );
  }
}
