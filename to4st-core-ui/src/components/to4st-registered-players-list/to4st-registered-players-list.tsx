import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State
} from "@stencil/core";


import { APIClient, RegisteredPlayer } from "../../libs/api";
import { ColumnProps, FilterProps } from "../general-ui-stuff/to4st-list/to4st-list";
import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";


/**
 * Registered player list
 */
@Component({
  tag: "to4st-registered-players-list",
  styleUrl: "to4st-registered-players-list.scss",
  shadow: false
})
export class To4stRegisteredPlayersList implements ComponentInterface {

  /**
   * List content
   */
  @State() players = [] as RegisteredPlayer[];

  /**
   * Current page
   */
  @State() currentPage = 1;

  /**
   * Page count
   */
  @State() currentPageCount = 1;

  /**
   * Current search string
   */
  @State() currentSearch = "";

  /**
   * Order descending?
   */
  @State() orderDesc = true;

  /**
   * Order by key
   */
  @State() currentOrderBy = "";

  /**
   * Has valid steam names => enable column
   */
  @State() hasValidNames = false;

  /**
   * API client
   */
  @app.Context("api") apiClient = {} as APIClient;

  /**
   * Columns of registered player type
   */
  columns = [
    {
      name: "SteamId64",
      hiddenMobile: () => this.hasValidNames,
      tableContent: player => <p><a target="_blank" href={`http://steamcommunity.com/profiles/${player.steamId64}`}>{player.steamId64}</a></p>,
      input: (item, cb, isCreate) => <input type="text" placeholder="SteamId64" disabled={!isCreate} value={item?.steamId64 ?? ""} class="input" onChange={event => cb.emit({key: "steamId64", value: (event.target as HTMLInputElement).value.trim()}) } />
    },
    {
      name: "Name",
      tableContent: player => <p><a target="_blank" href={`http://steamcommunity.com/profiles/${player.steamId64}`}>{player.steamUser?.name}</a></p>,
      shouldBeVisible: () => this.hasValidNames
    },
    {
      name: "Visible Role",
      tableContent: player => <p>{player.visibleRole}</p>,
      input: (item, cb) => <input type="text" placeholder="Visible Role" value={item?.visibleRole ?? ""} class="input" onChange={event => cb.emit({key: "visibleRole", value: (event.target as HTMLInputElement).value.trim()}) } />
    },
    {
      name: "Root Admin",
      tableContent: player => <p>{this.getSymbol(player.rootAdmin)}</p>,
      input: (item, cb) => <to4st-switch value={item?.rootAdmin ?? false} onToggle={event => cb.emit({key: "rootAdmin", value: event.detail})} />
    },
    {
      name: "Kick",
      tableContent: player => <p>{this.getSymbol(player.kick)}</p>,
      input: (item, cb) => <to4st-switch value={item?.kick ?? false} onToggle={event => cb.emit({key: "kick", value: event.detail})} />
    },
    {
      name: "Ban",
      tableContent: player => <p>{this.getSymbol(player.ban)}</p>,
      input: (item, cb) => <to4st-switch value={item?.ban ?? false} onToggle={event => cb.emit({key: "ban", value: event.detail})} />
    },
    {
      name: "Temp KickBan",
      tableContent: player => <p>{this.getSymbol(player.tempKickBan)}</p>,
      input: (item, cb) => <to4st-switch value={item?.tempKickBan ?? false} onToggle={event => cb.emit({key: "tempKickBan", value: event.detail})} />
    },
    {
      name: "Mute",
      tableContent: player => <p>{this.getSymbol(player.mute)}</p>,
      input: (item, cb) => <to4st-switch value={item?.mute ?? false} onToggle={event => cb.emit({key: "mute", value: event.detail})} />
    },
    {
      name: "Make Teams",
      tableContent: player => <p>{this.getSymbol(player.makeTeams)}</p>,
      input: (item, cb) => <to4st-switch value={item?.makeTeams ?? false} onToggle={event => cb.emit({key: "makeTeams", value: event.detail})} />
    },
    {
      name: "Reserved Slots",
      tableContent: player => <p>{this.getSymbol(player.reservedSlots)}</p>,
      input: (item, cb) => <to4st-switch value={item?.reservedSlots ?? false} onToggle={event => cb.emit({key: "reservedSlots", value: event.detail})} />
    },
    {
      name: "Broadcast Message",
      tableContent: player => <p>{this.getSymbol(player.broadcastMessage)}</p>,
      input: (item, cb) => <to4st-switch value={item?.broadcastMessage ?? false} onToggle={event => cb.emit({key: "broadcastMessage", value: event.detail})} />
    },
    {
      name: "Game Control",
      tableContent: player => <p>{this.getSymbol(player.gameControl)}</p>,
      input: (item, cb) => <to4st-switch value={item?.gameControl ?? false} onToggle={event => cb.emit({key: "gameControl", value: event.detail})} />
    },
    
  ] as ColumnProps[];

  /**
   * Get symbol to render bool
   * @param checked 
   */
  getSymbol(checked: boolean)
  {
    return checked ? (<i class="fas fa-check"></i>) : (<i class="fas fa-times"></i>);
  }

  /**
   * Init
   */
  async componentWillLoad()
  {
    await this.updateContent();
  }

  /**
   * Update list
   */
  async updateContent()
  {
    try 
    {
      const res = await this.apiClient.client.chain.query.registeredPlayers({options: {page: this.currentPage, search: this.currentSearch, pageSize: 25}}).execute(
        {
          pageCount: true, content: {
            steamId64: true, 
            steamUser: {name: true, avatarMediumUrl: true},
            visibleRole: true,
            rootAdmin: true, 
            kick: true, 
            ban: true, 
            tempKickBan: true, 
            mute: true, 
            makeTeams: true, 
            reservedSlots: true, 
            broadcastMessage: true, 
            gameControl: true
          }
        });

      this.players = res.content;
      this.currentPageCount = res.pageCount;
      this.hasValidNames = this.players.some(p => p.steamUser?.name);
    }
    catch(e)
    {
      console.error(e);
    }
  }

  /**
   * Search registered players
   * @param search 
   */
  async searchPlayer(search: string) 
  {
    this.currentSearch = search;
    await this.updateContent();
  }

  /**
   * Save player
   * @param player 
   * @param isEdit 
   * @param afterEx Callback executed when request resolves
   */
  async savePlayer(player: RegisteredPlayer, isEdit: boolean, afterEx: EventEmitter<string>) 
  {
    try {
        await this.apiClient.client.chain.mutation.createUpdateRegisteredPlayer(
          {
            registeredPlayer: {
              steamId64: player.steamId64, 
              rootAdmin: player.rootAdmin, 
              visibleRole: player.visibleRole,
              kick: player.kick, 
              ban: player.ban, 
              tempKickBan: player.tempKickBan, 
              mute: player.mute, 
              makeTeams: player.makeTeams, 
              reservedSlots: player.reservedSlots, 
              broadcastMessage: player.broadcastMessage, 
              gameControl: player.gameControl
        }
        }).execute({steamId64: false});
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
  async goToPage(page: number) 
  {
    this.currentPage = page;
    await this.updateContent();
  } 

  /**
   * Remove player from list
   * @param player 
   */
  async removePlayer(player: RegisteredPlayer)
  {
    try {
      await this.apiClient.client.chain.mutation.deleteRegisteredPlayer({steamId64: player.steamId64}).execute(false);
      await this.updateContent();

    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Render registered player list
   */
  render() {
    return (
      <Host>
        <to4st-list
          name="Registered Players"
          columns={this.columns}
          content={this.players}
          pagesCount={this.currentPageCount}
          currentPage={this.currentPage}
          onPagination={e => this.goToPage(e.detail)}
          onSaveItem={e => this.savePlayer(e.detail.item as RegisteredPlayer, e.detail.isEdit, e.detail.afterSaveExecuted)}
          onSearchItem={e => this.searchPlayer(e.detail)}
          onRemoveItem={e => this.removePlayer(e.detail as RegisteredPlayer)}
        ></to4st-list>
      </Host>
    );
  }
}
