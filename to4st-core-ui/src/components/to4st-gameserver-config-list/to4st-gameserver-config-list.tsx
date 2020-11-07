import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State,
  Watch
} from "@stencil/core";

import { Gameserver, APIClient, GameserverConfig, GameserverConfigInput, MatchConfig } from "../../libs/api";
import { ColumnProps, FilterProps } from "../general-ui-stuff/to4st-list/to4st-list";
import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";
import { ColumnDetailProps } from "../general-ui-stuff/to4st-details/to4st-details";

const PAGE_SIZE = 15;

const DEFAULT_GAMESERVER_CONFIG = {
  currentName: "TO4 Gameserver",
  voteLength: 25,
  gamePassword: "",
  reservedSlots: 0,
  balanceClans: true,
  allowSkipMapVote: true,
  tempKickBanTime: 30,
  autoRecordReplay: false,
  playerGameControl: false,
  enableMapVote: true,
  serverAdmins: "",
  serverDescription: "",
  website: "",
  contact: "",
  mapNoReplay: 3,
  enableVoicechat: true,
} as Partial<GameserverConfig>;

@Component({
  tag: "to4st-gameserver-config-list",
  styleUrl: "to4st-gameserver-config-list.scss",
  shadow: false
})
export class To4stGameserverConfigList implements ComponentInterface {

  @app.Context("api") apiClient!: APIClient;

  @app.Context("matchConfigs") matchConfigs!: MatchConfig[];

  /**
   * Handle matchConfigs refresh
   */
  @app.Observe("matchConfigs")
  onMatchConfigsUpdated() 
  {
    if(this.matchConfigs !== undefined)
    {
      this._matchConfigs = this.matchConfigs;
      this.columns = [...this.columns] // needed to rerender child
    }
  }

  @State() _matchConfigs = [] as MatchConfig[];

  @State() columns = [
    {
      name: "Current Name",
      tableContent: gameserverCfg => <p>{gameserverCfg?.gameserver?.currentName}</p>,
      sortable: true
    },
    {
      name: "Id",
      tableContent: gameserverCfg => <p>{gameserverCfg?.gameserver?.id}</p>,
      hiddenMobile: () => true,
    },
    {
      name: "Current Match Config",
      shouldBeVisible: () => false,
    detailInput: (item, cb) => <div class="select"><select onChange={e => cb("currentMatchConfig", {configName: (e.target as HTMLSelectElement).value.trim()})}>{this._matchConfigs.map(x => {console.log("dafuk"); return <option selected={item?.currentMatchConfig?.configName === x.configName}>{x.configName}</option>})}</select></div>
    },
    {
      name: "Game Password",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="text" placeholder="Game Password" value={item?.gamePassword ?? ""} class="input" onChange={event => cb("gamePassword", (event.target as HTMLInputElement).value.trim()) } />
    },
    {
      name: "Reserved Slots",
      shouldBeVisible: () => false,
    },
    {
      name: "Balance Clans",
      detailInput: (item, cb) => <to4st-switch value={item?.balanceClans} onToggle={event => cb("balanceClans", event.detail)} />,
      shouldBeVisible: () => false,
    },
    {
      name: "Allow Skip Mapvote",
      shouldBeVisible: () => false,
    },
    {
      name: "Temp Kick Ban Time",
      shouldBeVisible: () => false,
    },
    {
      name: "Auto Record Replay",
      shouldBeVisible: () => false,
    },
    {
      name: "Player Game Control",
      shouldBeVisible: () => false,
    },
    {
      name: "Enable Mapvote",
      shouldBeVisible: () => false,
    },
    {
      name: "Vote Length",
      shouldBeVisible: () => false,
    },
    {
      name: "Server Admins",
      detailInput: (item, cb) => <input type="text" placeholder="Server Admins" value={item?.serverAdmins ?? ""} class="input" onChange={event => cb("serverAdmins", (event.target as HTMLInputElement).value.trim()) } />,
      shouldBeVisible: () => false,
    },
    {
      name: "Server Description",
      detailInput: (item, cb) => <input type="text" placeholder="Contact" value={item?.serverDescription ?? ""} class="input" onChange={event => cb("serverDescription", (event.target as HTMLInputElement).value.trim()) } />,
      shouldBeVisible: () => false,
    },
    {
      name: "Website",
      detailInput: (item, cb) => <input type="text" placeholder="Website" value={item?.website ?? ""} class="input" onChange={event => cb("website", (event.target as HTMLInputElement).value.trim()) } />,
      shouldBeVisible: () => false,
    },
    {
      name: "Contact",
      detailInput: (item, cb) => <input type="text" placeholder="Contact" value={item?.contact ?? ""} class="input" onChange={event => cb("contact", (event.target as HTMLInputElement).value.trim()) } />,
      shouldBeVisible: () => false,
    },
    {
      name: "Map No Replay",
      shouldBeVisible: () => false,
    },
    {
      name: "Enable Voicechat",
      shouldBeVisible: () => false,
    }
  ] as ColumnDetailProps<GameserverConfig>[];

  async saveGameserverConfig(entity: any, transactionId: string, afterEx: EventEmitter<string>) 
  {
    const o = entity as GameserverConfig;
    try {
      this.apiClient.setTransactionId(transactionId);
      await this.apiClient.client.chain.mutation.createUpdateGameserverConfig({
        gameserverConfig: {
          gameserverId: o.gameserver.id,
          currentMatchConfigId: o.currentMatchConfig.id,
          currentGameserverName: o.currentName,
          voteLength: o.voteLength,
          tempKickBanTime: o.tempKickBanTime,
          gamePassword: o.gamePassword,
          serverAdmins: o.serverAdmins,
          serverDescription: o.serverDescription,
          website: o.website,
          contact: o.contact,
          reservedSlots: o.reservedSlots,
          mapNoReplay: o.mapNoReplay,
          balanceClans: o.balanceClans,
          allowSkipMapVote: o.allowSkipMapVote,
          autoRecordReplay: o.autoRecordReplay,
          playerGameControl: o.playerGameControl,
          enableMapVote: o.enableMapVote,
          enableVoicechat: o.enableVoicechat
        } as GameserverConfigInput
      }).execute({gameserver: {id: true}});
        afterEx.emit("");
    } catch (e) {
      afterEx.emit(extractGraphQLErrors(e));
      console.log(e);
    }
  }


  async removeGameserverConfig(entity: any, onDeletedEntity: () => void)
  {
    const o = entity as GameserverConfig;
    try {
      await this.apiClient.client.chain.mutation.deleteGameserverConfig({gameserverId: o.gameserver.id}).execute(false);
    } catch (e) {
      console.log(e);
    }
    onDeletedEntity();
  }

  async updateGameserverConfigs(page: number, search: string, orderBy: string, orderDesc: boolean, onFetchedData: (data: any[], pageCount: number) => void)
  {
    try 
    {
      const res = await this.apiClient.client.chain.query.gameservers({options: {pageSize: PAGE_SIZE, page: page, search: search, orderDesc: orderDesc, orderByCurrentName: orderBy === "Current Name"}}).execute(
        {
          pageCount: true, content: {
            id: true, 
            currentName: true,
            gameserverConfig: {
              currentMatchConfig: {
                id: true,
                configName: true,
                gameMode: {
                  name: true
                },
                configHash: true,
                matchEndLength: true,
                warmUpLength: true,
                friendlyFireScale: true,
                mapLength: true,
                roundLength: true,
                preRoundLength: true,
                roundEndLength: true,
                roundLimit: true,
                allowGhostcam: true,
                playerVoteThreshold: true,
                autoBalanceTeams: true,
                playerVoteTeamOnly: true,
                maxTeamDamage: true,
                enablePlayerVote: true,
                autoSwapTeams: true,
                midGameBreakLength: true,
                nadeRestriction: true,
                globalVoicechat: true,
                muteDeadToTeam: true,
                ranked: true,
                private: true,
              },
              currentName: true,
              voteLength: true,
              gamePassword: true,
              reservedSlots: true,
              balanceClans: true,
              allowSkipMapVote: true,
              tempKickBanTime: true,
              autoRecordReplay: true,
              playerGameControl: true,
              enableMapVote: true,
              serverAdmins: true,
              serverDescription: true,
              website: true,
              contact: true,
              mapNoReplay: true,
              enableVoicechat: true,
            }
          }
        }
      );

      const mapped = res.content.map(x => {
        if(x.gameserverConfig)
        {
          return x;
        }

        const def = {...DEFAULT_GAMESERVER_CONFIG};
        def.gameserver = x;

        return def;

      });

      onFetchedData(mapped, res.pageCount);
    }
    catch(e)
    {
      console.error(e);
      onFetchedData([], 1);
    }
  }


  render() {
    return (
      <Host>
        <to4st-details
          name="Gameservers"
          columns={this.columns}
          hasSearch={true}               
          onUpdateEntities={e => this.updateGameserverConfigs(e.detail.page, e.detail.search, e.detail.orderBy, e.detail.orderDesc, e.detail.onFetchedData)}
          onSaveEntity={e => this.saveGameserverConfig(e.detail.entity as GameserverConfig, e.detail.transactionId, e.detail.afterEx)}
          onDeleteEntity={e => this.removeGameserverConfig(e.detail.entity as GameserverConfig, e.detail.onDeletedEntity)}
        ></to4st-details>
      </Host>
    );
  }
}
