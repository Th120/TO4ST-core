import {
  Component,
  ComponentInterface,
  Host,
  h,
  State,
  EventEmitter
} from "@stencil/core";

import { AuthKey, APIClient } from "../../libs/api";
import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";
import { ColumnProps } from "../general-ui-stuff/to4st-list/to4st-list";

/**
 * ApiKeys list
 */
@Component({
  tag: "to4st-api-keys",
  styleUrl: "to4st-api-keys.scss",
  shadow: false
})
export class To4stApiKeys implements ComponentInterface {

  /**
   * Current apiKeys
   */
  @State() keys = [] as AuthKey[];

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
  @app.Context("api") apiClient = {} as APIClient;

  /**
   * Columns for apiKey
   */
  columns = [
    {
      name: "Key",
      hiddenMobile: () => true,
      tableContent: key => <p>{key.authKey}</p>,
      input: (item, cb) => (
        <input
          type="text"
          placeholder="Leave blank to auto-generate"
          value={item?.key ?? ""}
          class="input"
          onChange={event =>
            cb.emit({
              key: "authKey",
              value: (event.target as HTMLInputElement).value.trim()
            })
          }
        />
      )
    },
    {
      name: "Description",
      tableContent: key => <p>{key.description}</p>,
      input: (item, cb) => (
        <input
          type="text"
          placeholder="Description"
          value={item?.description ?? ""}
          class="input"
          onChange={event =>
            cb.emit({
              key: "description",
              value: (event.target as HTMLInputElement).value.trim()
            })
          }
        />
      )
    },
    {
      name: "Last Use",
      tableContent: key => <p>{key.lastUse}</p>,
      sortable: true
    }
  ] as ColumnProps[];

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
      const res = await this.apiClient.client.chain.query
        .authKeys({
          options: {
            page: this.currentPage,
            pageSize: 20,
            search: this.currentSearch,
            orderDesc: this.orderDesc
          }
        })
        .execute({
          pageCount: true,
          content: { id: true, authKey: true, lastUse: true, description: true }
        });
      this.currentPageCount = res.pageCount;
      this.keys = res.content;
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
    key: AuthKey,
    isEdit: boolean,
    afterEx: EventEmitter<string>,
    transactionId: string
  ) {
    try {
      this.apiClient.setTransactionId(transactionId);
      await this.apiClient.client.chain.mutation
        .createUpdateAuthKey({
          authKey: {
            id: key.id,
            authKey: key.authKey,
            description: key.description
          }
        })
        .execute({ id: false });
      afterEx.emit();
      await this.updateContent();
    } catch (e) {
      afterEx.emit(extractGraphQLErrors(e));
      console.log(e);
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
  async removeAuthKey(key: AuthKey) {
    try {
      await this.apiClient.client.chain.mutation
        .deleteAuthKey({ authKey: key.authKey })
        .execute(false);
      await this.updateContent();
    } catch (e) {
      console.log(e);
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
          onChangedOrder={e =>
            this.orderBy(e.detail.orderBy, e.detail.orderDesc)
          }
          onPagination={e => this.goToPage(e.detail)}
          onSaveItem={e =>
            this.saveAuthKey(
              e.detail.item,
              e.detail.isEdit,
              e.detail.afterSaveExecuted,
              e.detail.transactionId
            )
          }
          onSearchItem={e => this.searchAuthKey(e.detail)}
          onRemoveItem={e => this.removeAuthKey(e.detail)}
        ></to4st-list>
      </Host>
    );
  }
}
