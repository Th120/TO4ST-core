import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State
} from "@stencil/core";

import { Gameserver, APIClient, GameserverConfigOrder } from "../../libs/api";
import { ColumnProps, FilterProps } from "../general-ui-stuff/to4st-list/to4st-list";
import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";

const PAGE_SIZE = 25;

@Component({
  tag: "to4st-gameserver-list",
  styleUrl: "to4st-gameserver-list.scss",
  shadow: false
})
export class To4stGameserverList implements ComponentInterface {
  @State() servers = [] as Gameserver[];

  @State() currentPage = 1;
  @State() currentPageCount = 1;
  @State() currentSearch = "";
  @State() orderDesc = true;
  @State() currentOrderBy: GameserverConfigOrder;

  @app.Context("api") apiClient = {} as APIClient;

  columns = [
    {
      name: "Id",
      hiddenMobile: () => true,
      tableContent: server => <p>{server.id}</p>,
    },
    {
      name: "Current Name",
      tableContent: server => <p>{server.currentName}</p>,
      sortable: true
    },
    {
      name: "Key",
      tableContent: server => <p>{server.authKey}</p>,
      input: (item, cb) => <input type="text" placeholder="Leave blank to auto-generate" value={item?.authKey ?? ""} class="input" onChange={event => cb.emit({key: "authKey", value: (event.target as HTMLInputElement).value.trim()}) } />
    },
    {
      name: "Description",
      tableContent: server => <p>{server.description}</p>,
      input: (item, cb) => <input type="text" placeholder="Description" value={item?.description ?? ""} class="input" onChange={event => cb.emit({key: "description", value: (event.target as HTMLInputElement).value.trim()}) } />
    },
    {
      name: "Last Contact",
      hiddenMobile: () => true,
      tableContent: server => <p>{server.lastContact}</p>,
      sortable: true
    }
  ] as ColumnProps<Gameserver>[];

  filters = [] as FilterProps[];

  async componentWillLoad()
  {
    await this.updateContent();
  }

  async updateContent()
  {
    try 
    {
      const res = await this.apiClient.client.chain.query.gameservers({options: {pageSize: PAGE_SIZE, page: this.currentPage, search: this.currentSearch, orderDesc: this.orderDesc, orderBy: this.currentOrderBy}}).execute({pageCount: true, content: {id: true, authKey: true, currentName: true, description: true, lastContact: true}});
      this.servers = res.content;
      this.currentPageCount = res.pageCount;
    }
    catch(e)
    {
      console.error(e);
    }
  }

  async searchGameserver(search: string) 
  {
    this.currentSearch = search;
    await this.updateContent();
  }

  async saveGameserver(server: Gameserver, isEdit: boolean, afterEx: EventEmitter<string>, transactionId: string) 
  {
    try {
      this.apiClient.setTransactionId(transactionId);
      await this.apiClient.client.chain.mutation.createUpdateGameserver({gameserver: {id: server.id, authKey: server.authKey, description: server.description, currentName: server.currentName}}).execute({id: false});
        afterEx.emit();
        await this.updateContent();

    } catch (e) {

      afterEx.emit(extractGraphQLErrors(e));
      console.error(e);
    }
  }

  async goToPage(page: number) 
  {
    this.currentPage = page;
    await this.updateContent();
  } 

  async removeGameserver(server: Gameserver)
  {
    try {
      await this.apiClient.client.chain.mutation.deleteGameserver({gameserverId: server.id}).execute(false);
      await this.updateContent();

    } catch (e) {
      console.error(e);
    }
  }

  orderBy(orderByKey: string, orderDesc: boolean)
  {
    this.orderDesc = orderDesc;

    if(orderByKey === "Last Contact")
    {
      this.currentOrderBy = GameserverConfigOrder.lastContact;
    }
    else 
    {
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
          onChangedOrder={e => this.orderBy(e.detail.orderBy, e.detail.orderDesc)}
          onPagination={e => this.goToPage(e.detail)}
          onSaveItem={e => this.saveGameserver(e.detail.item as Gameserver, e.detail.isEdit, e.detail.afterSaveExecuted, e.detail.transactionId)}
          onSearchItem={e => this.searchGameserver(e.detail)}
          onRemoveItem={e => this.removeGameserver(e.detail as Gameserver)}
        ></to4st-list>
      </Host>
    );
  }
}
