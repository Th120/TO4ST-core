import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State,
} from "@stencil/core";

import { TApiClient } from "../../libs/api";
import {
  ColumnProps,
  FilterProps,
} from "../general-ui-stuff/to4st-list/to4st-list";
import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";
import { GameserverConfigOrder } from "../../libs/client/zeus";
import {
  GameserverService,
  TGameserver,
} from "../../services/gameserver.service";

const PAGE_SIZE = 25;

@Component({
  tag: "to4st-gameserver-list",
  styleUrl: "to4st-gameserver-list.scss",
  shadow: false,
})
export class To4stGameserverList implements ComponentInterface {
  @State() servers = [] as TGameserver[];

  @State() currentPage = 1;
  @State() currentPageCount = 1;
  @State() currentSearch = "";
  @State() orderDesc = true;
  @State() currentOrderBy: GameserverConfigOrder;

  @app.Context("api") apiClient = {} as TApiClient;

  columns = [
    {
      name: "Id",
      hiddenMobile: () => true,
      tableContent: (server) => <p>{server.id}</p>,
    },
    {
      name: "Current Name",
      tableContent: (server) => <p>{server.currentName}</p>,
      sortable: true,
    },
    {
      name: "Key",
      tableContent: (server) => <p>{server.authKey}</p>,
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
      tableContent: (server) => <p>{server.description}</p>,
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
      name: "Last Contact",
      hiddenMobile: () => true,
      tableContent: (server) => <p>{server.lastContact}</p>,
      sortable: true,
    },
  ] as ColumnProps<TGameserver>[];

  filters = [] as FilterProps[];

  async componentWillLoad() {
    await this.updateContent();
  }

  async updateContent() {
    try {
      const [servers, pageCount] = await GameserverService.get(
        this.apiClient
      ).gameservers(
        this.currentPage,
        PAGE_SIZE,
        this.currentSearch,
        this.orderDesc,
        this.currentOrderBy
      );
      this.servers = servers;
      this.currentPageCount = pageCount;
    } catch (e) {
      console.error(e);
    }
  }

  async searchGameserver(search: string) {
    this.currentSearch = search;
    await this.updateContent();
  }

  async saveGameserver(
    server: TGameserver,
    isEdit: boolean,
    afterEx: EventEmitter<string>,
    transactionId: string
  ) {
    try {
      await GameserverService.get(this.apiClient).createUpdateGameserver(
        {
          id: server.id,
          authKey: server.authKey,
          description: server.description,
          currentName: server.currentName,
        },
        transactionId
      );

      afterEx.emit();
      await this.updateContent();
    } catch (e) {
      afterEx.emit(extractGraphQLErrors(e));
      console.error(e);
    }
  }

  async goToPage(page: number) {
    this.currentPage = page;
    await this.updateContent();
  }

  async removeGameserver(server: TGameserver) {
    try {
      await GameserverService.get(this.apiClient).deleteGameserver(server.id);
      await this.updateContent();
    } catch (e) {
      console.error(e);
    }
  }

  orderBy(orderByKey: string, orderDesc: boolean) {
    this.orderDesc = orderDesc;

    if (orderByKey === "Last Contact") {
      this.currentOrderBy = GameserverConfigOrder.lastContact;
    } else {
      this.currentOrderBy = GameserverConfigOrder.currentName;
    }

    this.updateContent();
  }

  render() {
    return (
      <Host>
        <to4st-list
          name="Gameservers"
          columns={this.columns}
          content={this.servers}
          pagesCount={this.currentPageCount}
          currentPage={this.currentPage}
          onChangedOrder={(e) =>
            this.orderBy(e.detail.orderBy, e.detail.orderDesc)
          }
          onPagination={(e) => this.goToPage(e.detail)}
          onSaveItem={(e) =>
            this.saveGameserver(
              e.detail.item as TGameserver,
              e.detail.isEdit,
              e.detail.afterSaveExecuted,
              e.detail.transactionId
            )
          }
          onSearchItem={(e) => this.searchGameserver(e.detail)}
          onRemoveItem={(e) => this.removeGameserver(e.detail as TGameserver)}
        ></to4st-list>
      </Host>
    );
  }
}
