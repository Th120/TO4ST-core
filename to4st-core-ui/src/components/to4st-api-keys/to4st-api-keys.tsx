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
import { ColumnProps } from "../general-ui-stuff/to4st-list/to4st-list";
import { GraphQLTypes, InputType, Selectors } from "../../libs/client/zeus";

const authKeyQuery = (page: number, search: string, orderDesc: boolean) =>
  Selectors.query({
    authKeys: [
      {
        options: {
          page: page,
          pageSize: 20,
          search: search,
          orderDesc: orderDesc,
        },
      },
      {
        pageCount: true,
        content: { id: true, authKey: true, lastUse: true, description: true },
      },
    ],
  });

type TAuthKeyApi = InputType<
  GraphQLTypes["Query"],
  ReturnType<typeof authKeyQuery>
>["authKeys"]["content"][number];
const mapAuthKey = (x: TAuthKeyApi) => ({ ...x, lastUse: new Date(x.lastUse) });
type TAuthKey = ReturnType<typeof mapAuthKey>;

/**
 * ApiKeys list
 */
@Component({
  tag: "to4st-api-keys",
  styleUrl: "to4st-api-keys.scss",
  shadow: false,
})
export class To4stApiKeys implements ComponentInterface {
  /**
   * Current apiKeys
   */
  @State() keys = [] as TAuthKey[];

  /**
   * Current page
   */
  @State() currentPage = 1;

  /**
   * Current page count
   */
  @State() currentPageCount = 1;

  /**
   * Current search string
   */
  @State() currentSearch = "";

  /**
   * Should order descending
   */
  @State() orderDesc = true;

  /**
   * API client
   */
  @app.Context("api") apiClient = {} as TApiClient;

  /**
   * Columns for apiKey
   */
  columns = [
    {
      name: "Key",
      hiddenMobile: () => true,
      tableContent: (key) => <p>{key.authKey}</p>,
      input: (item, cb) => (
        <input
          type="text"
          placeholder="Leave blank to auto-generate"
          value={item?.authKey ?? ""}
          class="input"
          onChange={(event) =>
            cb.emit({
              key: "authKey",
              value: (event.target as HTMLInputElement).value.trim(),
            })
          }
        />
      ),
    },
    {
      name: "Description",
      tableContent: (key) => <p>{key.description}</p>,
      input: (item, cb) => (
        <input
          type="text"
          placeholder="Description"
          value={item?.description ?? ""}
          class="input"
          onChange={(event) =>
            cb.emit({
              key: "description",
              value: (event.target as HTMLInputElement).value.trim(),
            })
          }
        />
      ),
    },
    {
      name: "Last Use",
      tableContent: (key) => <p>{key.lastUse?.toLocaleString()}</p>,
      sortable: true,
    },
  ] as ColumnProps<TAuthKey>[];

  /**
   * Init
   */
  async componentWillLoad() {
    await this.updateContent();
  }

  /**
   * Update elements
   */
  async updateContent() {
    try {
      const res = await this.apiClient.client.query(
        authKeyQuery(this.currentPage, this.currentSearch, this.orderDesc)
      );
      this.currentPageCount = res.authKeys.pageCount;
      this.keys = res.authKeys.content.map((x) => mapAuthKey(x));
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Search
   * @param search
   */
  async searchAuthKey(search: string) {
    this.currentSearch = search;
    await this.updateContent();
  }

  /**
   * Save handler
   * @param key api key to insert
   * @param isEdit
   * @param afterEx Callback executed when request resolves
   * @param transactionId
   */
  async saveAuthKey(
    key: TAuthKey,
    isEdit: boolean,
    afterEx: EventEmitter<string>,
    transactionId: string
  ) {
    try {
      this.apiClient.setTransactionId(transactionId);
      await this.apiClient.client.mutation({
        createUpdateAuthKey: [
          {
            authKey: {
              id: key.id,
              authKey: key.authKey,
              description: key.description,
            },
          },
          {
            id: true,
          },
        ],
      });
      afterEx.emit();
      await this.updateContent();
    } catch (e) {
      afterEx.emit(extractGraphQLErrors(e));
      console.error(e);
    }
  }

  /**
   * Go to page
   * @param page
   */
  async goToPage(page: number) {
    this.currentPage = page;
    await this.updateContent();
  }

  /**
   * Order content
   * @param orderByKey
   * @param orderDesc
   */
  async orderBy(orderByKey: string, orderDesc: boolean) {
    this.orderDesc = orderDesc;
    this.updateContent();
  }

  /**
   * Remove authKey
   * @param key
   */
  async removeAuthKey(key: TAuthKey) {
    try {
      await this.apiClient.client.mutation({
        deleteAuthKey: [{ authKey: key.authKey }, true],
      });
      await this.updateContent();
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Render list
   */
  render() {
    return (
      <Host>
        <to4st-list
          name="API Keys"
          columns={this.columns}
          content={this.keys}
          currentPage={this.currentPage}
          pagesCount={this.currentPageCount}
          onChangedOrder={(e) =>
            this.orderBy(e.detail.orderBy, e.detail.orderDesc)
          }
          onPagination={(e) => this.goToPage(e.detail)}
          onSaveItem={(e) =>
            this.saveAuthKey(
              e.detail.item,
              e.detail.isEdit,
              e.detail.afterSaveExecuted,
              e.detail.transactionId
            )
          }
          onSearchItem={(e) => this.searchAuthKey(e.detail)}
          onRemoveItem={(e) => this.removeAuthKey(e.detail)}
        ></to4st-list>
      </Host>
    );
  }
}
