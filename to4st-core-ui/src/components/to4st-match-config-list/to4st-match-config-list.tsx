import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State
} from "@stencil/core";


import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";
import { ColumnDetailProps } from "../general-ui-stuff/to4st-details/to4st-details";
import { APIClient } from "../../libs/api";
import { MatchConfig, GameMode, GameserverConfig } from "../../libs/api-client/schema";

const PAGE_SIZE = 15;

const DEFAULT_MATCH_CONFIG = {
  gameMode: {
    name: "Classic"
  } as GameMode,
  matchEndLength: 10,
  warmUpLength: 30,
  friendlyFireScale: 20,
  mapLength: 20,
  roundLength: 180,
  preRoundLength: 6,
  roundEndLength: 5,
  roundLimit: 24,
  allowGhostcam: true,
  playerVoteThreshold: 60,
  autoBalanceTeams: true,
  playerVoteTeamOnly: false,
  maxTeamDamage: 520,
  enablePlayerVote: true,
  autoSwapTeams: false,
  midGameBreakLength: 0,
  nadeRestriction: true,
  globalVoicechat: false,
  muteDeadToTeam: false,
  ranked: false,
  private: false
} as Partial<MatchConfig>;


@Component({
  tag: "to4st-match-config-list",
  styleUrl: "to4st-match-config-list.scss",
  shadow: false
})
export class To4stMatchConfigList implements ComponentInterface {

  @app.Context("api") apiClient!: APIClient;
  @app.Context("matchConfigs") matchConfigs!: MatchConfig[];

  @State() gameModes: GameMode[] = [];

  @State() columns = [
    {
      name: "Id",
      tableContent: config => <p>{config?.id}</p>,
    },
    {
      name: "Config Name",
      tableContent: config => <p>{config?.configName}</p>,
      detailInput: (item, cb) => <input type="text" placeholder="Config Name" value={item?.configName ?? ""} class="input" onChange={event => cb("configName", (event.target as HTMLInputElement).value.trim()) } />,
      input: (item, cb) => <input type="text" placeholder="Config Name" value={item?.configName ?? ""} class="input" onChange={event => cb.emit({key: "configName", value: (event.target as HTMLInputElement).value.trim()}) } />,
      sortable: true
    },
    {
      name: "Game Mode",
      tableContent: config => <p>{config?.gameMode?.name}</p>,
      detailInput: (item, cb) => <div class="select"><select onChange={e => cb("gameMode", {name: (e.target as HTMLSelectElement).value.trim()})}>{this.gameModes.map(x => <option selected={item?.gameMode?.name === x.name}>{x.name}</option>)}</select></div>
    },
    {
      name: "Config Hash",
      tableContent: config => <p>{config?.configHash}</p>,
      hiddenMobile: () => true
    },
    {
      name: "Matchend Length",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Matchend Length" min="1" max="60" value={item?.matchEndLength ?? 0} class="input" onChange={event => cb("matchendLength", parseInt((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Warm Up Length",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Warm Up Length" min="1" max="300" value={item?.warmUpLength ?? 0} class="input" onChange={event => cb("warmUpLength", parseInt((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Friendly Fire Scale",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Friendly Fire Scale" min="0" max="100" step="0.5" value={item?.friendlyFireScale ?? 0} class="input" onChange={event => cb("friendlyFireScale", parseFloat((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Map Length",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Map Length" min="1" max="99" value={item?.mapLength ?? 0} class="input" onChange={event => cb("mapLength", parseInt((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Round Length",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Round Length" min="1" max="3599" value={item?.roundLength ?? 0} class="input" onChange={event => cb("roundLength", parseInt((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Pre Round Length",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Pre Round Length" min="1" max="20" value={item?.preRoundLength ?? 0} class="input" onChange={event => cb("preRoundLength", parseInt((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Round End Length",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Round End Length" min="1" max="20" value={item?.roundEndLength ?? 0} class="input" onChange={event => cb("roundEndLength", parseInt((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Round Limit",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Round Limit" min="0" max="99" value={item?.roundLimit ?? 0} class="input" onChange={event => cb("roundLimit", parseInt((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Allow Ghostcam",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.allowGhostcam} onToggle={event => cb("allowGhostcam", event.detail)} />,
    },
    {
      name: "Player Vote Threshold",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" min="0" max="100" step="0.5" placeholder="Friendly Fire Scale" value={item?.playerVoteThreshold ?? 0} class="input" onChange={event => cb("playerVoteThreshold", parseFloat((event.target as HTMLInputElement).value)) } />,
    },
    {
      name: "Auto Balance Teams",
      detailInput: (item, cb) => <to4st-switch value={item?.autoBalanceTeams} onToggle={event => cb("autoBalanceTeams", event.detail)} />,
      shouldBeVisible: () => false,
      tooltip: () => "Swaps players automatically to keep teams even"
    },
    {
      name: "Player Vote Team Only",
      detailInput: (item, cb) => <to4st-switch value={item?.playerVoteTeamOnly} onToggle={event => cb("playerVoteTeamOnly", event.detail)} />,
      shouldBeVisible: () => false,
    },
    {
      name: "Max Team Damage",
      detailInput: (item, cb) => <input type="number" placeholder="Max Team Damage" min="0" max="99999" value={item?.maxTeamDamage ?? 0} class="input" onChange={event => cb("maxTeamDamage", parseInt((event.target as HTMLInputElement).value)) } />,
      shouldBeVisible: () => false,
    },
    {
      name: "Enable Player Vote",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.enablePlayerVote} onToggle={event => cb("enablePlayerVote", event.detail)} />,
      tooltip: () => "Players can vote other players out"
    },
    {
      name: "Auto Swap Teams",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.autoSwapTeams} onToggle={event => cb("autoSwapTeams", event.detail)} />,
      tooltip: () => "If a roundlimit is used the players swap teams after half of the rounds"
    },
    {
      name: "Mid Game Break Length",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <input type="number" placeholder="Mid Game Break Length" min="0" max="300" value={item?.midGameBreakLength ?? 0} class="input" onChange={event => cb("midGameBreakLength", parseInt((event.target as HTMLInputElement).value)) } />,
      tooltip: () => "If a roundlimit is used the game pauses for given seconds when half of the rounds are over"
    },
    {
      name: "Nade Restriction",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.nadeRestriction} onToggle={event => cb("nadeRestriction", event.detail)} />,
      tooltip: () => "Only one nade of each kind can be bought at round begin"
    },
    {
      name: "Global Voicechat",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.globalVoicechat} onToggle={event => cb("globalVoicechat", event.detail)} />,
    },
    {
      name: "Mute Dead To Team",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.muteDeadToTeam} onToggle={event => cb("muteDeadToTeam", event.detail)} />,
    },
    {
      name: "Ranked",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.ranked} onToggle={event => cb("ranked", event.detail)} />,
      tooltip: () => "Allows to seperate ranked / unranked player stats"
    },
    {
      name: "Private",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => <to4st-switch value={item?.private} onToggle={event => cb("private", event.detail)} />,
      tooltip: () => "Server requires password or reserved slot access"
    }
  ] as ColumnDetailProps<MatchConfig>[];

  async componentWillLoad()
  {
    (async () => {
      const found = await this.apiClient.client.chain.query.gameModes.execute({
        pageCount: true,
        content: {
          name: true
        }
      });

      this.gameModes = found.content;

    })().catch(e => console.error("error while loading gameModes", e))
  }

  async saveMatchConfig(entity: any, transactionId: string, afterEx: EventEmitter<string>) 
  {
    let o = entity as MatchConfig;

    if(!o.id) // create only inits with a name
    {
      o = {...o, ...DEFAULT_MATCH_CONFIG};
    }

    try {
      this.apiClient.setTransactionId(transactionId);
      await this.apiClient.client.chain.mutation.createUpdateMatchConfig({matchConfig: {
        id: o.id,
        configName: o.configName,
        gameMode: {
          name: o.gameMode.name,
        } as GameMode,
        matchEndLength: o.matchEndLength,
        warmUpLength: o.warmUpLength,
        friendlyFireScale: o.friendlyFireScale,
        mapLength: o.mapLength, 
        roundLength: o.roundLength,
        preRoundLength: o.preRoundLength,
        roundEndLength: o.roundEndLength,
        roundLimit: o.roundLimit,
        allowGhostcam: o.allowGhostcam,
        playerVoteThreshold: o.playerVoteThreshold,
        autoBalanceTeams: o.autoBalanceTeams,
        playerVoteTeamOnly: o.playerVoteTeamOnly,
        maxTeamDamage: o.maxTeamDamage,
        enablePlayerVote: o.enablePlayerVote,
        autoSwapTeams: o.autoSwapTeams,
        midGameBreakLength: o.midGameBreakLength,
        nadeRestriction: o.nadeRestriction,
        globalVoicechat: o.globalVoicechat,
        muteDeadToTeam: o.muteDeadToTeam, 
        ranked: o.ranked,
        private: o.private
      }}).execute({id: false});
        afterEx.emit("");
    } catch (e) {
      afterEx.emit(extractGraphQLErrors(e));
      console.error(e);
    }
  }


  async removeMatchConfig(entity: any, onDeletedEntity: () => void)
  {
    const o = entity as MatchConfig;
    try {
      await this.apiClient.client.chain.mutation.deleteMatchConfig({options: {id: o.id}}).execute(false);
    } catch (e) {
      console.error(e);
    }

    onDeletedEntity();
  }

  async updateMatchConfigs(page: number, search: string, orderBy: string, orderDesc: boolean, onFetchedData: (data: any[], pageCount: number) => void)
  {
    try 
    {
      const res = await this.apiClient.client.chain.query.matchConfigs({options: {page: page, pageSize: PAGE_SIZE, configName: search, orderDesc: orderDesc}}).execute({
        pageCount: true, 
        content: {
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
        }
      });

      this.matchConfigs = res.content;

      onFetchedData(res.content, res.pageCount);
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
          name="Match Configs"
          columns={this.columns}
          hasSearch={true}
          mapPreSerializeEntity={(item: MatchConfig) => {
              const {id, ...copyWithoutId} = item; 
              return {
                mapped: copyWithoutId,
                fileName: item.configName
              };
            }
          }    
          useDefaultListCreate={true}
          onUpdateEntities={e => this.updateMatchConfigs(e.detail.page, e.detail.search, e.detail.orderBy, e.detail.orderDesc, e.detail.onFetchedData)}
          onSaveEntity={e => this.saveMatchConfig(e.detail.entity as GameserverConfig, e.detail.transactionId, e.detail.afterEx)}
          onDeleteEntity={e => this.removeMatchConfig(e.detail.entity as GameserverConfig, e.detail.onDeletedEntity)}
        ></to4st-details>
      </Host>
    );
  }
}
