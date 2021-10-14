import {
  Component,
  ComponentInterface,
  Host,
  h,
  EventEmitter,
  State,
  Watch,
} from "@stencil/core";

import { TApiClient } from "../../libs/api";
import { app } from "../../global/context";
import { extractGraphQLErrors } from "../../libs/utils";
import { ColumnDetailProps } from "../general-ui-stuff/to4st-details/to4st-details";
import {
  extractGameserverConfig,
  GameserverService,
  TGameserver,
  TGameserverConfig,
  TMatchConfig,
} from "../../services/gameserver.service";
import { GameserverConfigOrder } from "../../libs/client/zeus";

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
} as Omit<TGameserverConfig, "gameserver">;

@Component({
  tag: "to4st-gameserver-config-list",
  styleUrl: "to4st-gameserver-config-list.scss",
  shadow: false,
})
export class To4stGameserverConfigList implements ComponentInterface {
  @app.Context("api") apiClient!: TApiClient;

  @app.Context("matchConfigs") matchConfigs!: TMatchConfig[];

  /**
   * Handle matchConfigs refresh
   */
  @app.Observe("matchConfigs")
  onMatchConfigsUpdated() {
    if (this.matchConfigs !== undefined) {
      if (
        !this.defaultGameserverConfig.currentMatchConfig &&
        this.matchConfigs.length > 0
      ) {
        this.defaultGameserverConfig.currentMatchConfig = this.matchConfigs[0];
      }

      this.columns = [...this.columns]; // needed to rerender details component
    }
  }

  @State() defaultGameserverConfig = DEFAULT_GAMESERVER_CONFIG;

  @State() columns = [
    {
      name: "Current Name",
      tableContent: (gameserverCfg) => (
        <p>{gameserverCfg?.gameserver?.currentName}</p>
      ),
      detailInput: (item, cb) => (
        <input
          type="text"
          placeholder="Current Name"
          value={item?.currentName ?? ""}
          class="input"
          onChange={(event) =>
            cb("currentName", (event.target as HTMLInputElement).value.trim())
          }
        />
      ),
      sortable: true,
    },
    {
      name: "Id",
      tableContent: (gameserverCfg) => <p>{gameserverCfg?.gameserver?.id}</p>,
      hiddenMobile: () => true,
    },
    {
      name: "Has config",
      tableContent: (gameserverCfg) => (
        <p>{this.getSymbol(!!gameserverCfg?.gameserver?.gameserverConfig)}</p>
      ),
      hiddenMobile: () => true,
      sortable: () => true,
    },
    {
      name: "Current Match Config",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => (
        <div class="select">
          <select
            onChange={(e) =>
              cb("currentMatchConfig", {
                id: this.matchConfigs.find(
                  (x) =>
                    x.configName ===
                    (e.target as HTMLSelectElement).value.trim()
                )?.id,
              })
            }
          >
            {this.matchConfigs.map((x) => (
              <option
                selected={item?.currentMatchConfig?.configName === x.configName}
              >
                {x.configName}
              </option>
            ))}
          </select>
        </div>
      ),
    },
    {
      name: "Game Password",
      shouldBeVisible: () => false,
      detailInput: (item, cb) => (
        <input
          type="text"
          placeholder="Game Password"
          value={item?.gamePassword ?? ""}
          class="input"
          onChange={(event) =>
            cb("gamePassword", (event.target as HTMLInputElement).value.trim())
          }
        />
      ),
    },
    {
      name: "Reserved Slots",
      detailInput: (item, cb) => (
        <input
          type="number"
          placeholder="Reserved slots"
          min="0"
          max="100"
          value={item?.reservedSlots ?? 0}
          class="input"
          onChange={(event) =>
            cb(
              "reservedSlots",
              parseInt((event.target as HTMLInputElement).value)
            )
          }
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Balance Clans",
      detailInput: (item, cb) => (
        <to4st-switch
          value={item?.balanceClans}
          onToggle={(event) => cb("balanceClans", event.detail)}
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Allow Skip Mapvote",
      detailInput: (item, cb) => (
        <to4st-switch
          value={item?.allowSkipMapVote}
          onToggle={(event) => cb("allowSkipMapVote", event.detail)}
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Temp Kick Ban Time",
      detailInput: (item, cb) => (
        <input
          type="number"
          placeholder="Temp Kick Ban Time"
          min="1"
          value={item?.tempKickBanTime ?? 0}
          class="input"
          onChange={(event) =>
            cb(
              "tempKickBanTime",
              parseInt((event.target as HTMLInputElement).value)
            )
          }
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Auto Record Replay",
      detailInput: (item, cb) => (
        <to4st-switch
          value={item?.autoRecordReplay}
          onToggle={(event) => cb("autoRecordReplay", event.detail)}
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Player Game Control",
      detailInput: (item, cb) => (
        <to4st-switch
          value={item?.playerGameControl}
          onToggle={(event) => cb("playerGameControl", event.detail)}
        />
      ),
      shouldBeVisible: () => false,
      tooltip: () =>
        "Players can vote for match actions (reset, map change, pause)",
    },
    {
      name: "Enable Mapvote",
      detailInput: (item, cb) => (
        <to4st-switch
          value={item?.enableMapVote}
          onToggle={(event) => cb("enableMapVote", event.detail)}
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Vote Length",
      detailInput: (item, cb) => (
        <input
          type="number"
          placeholder="Vote Length"
          min="5"
          value={item?.voteLength ?? 0}
          class="input"
          onChange={(event) =>
            cb("voteLength", parseInt((event.target as HTMLInputElement).value))
          }
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Server Admins",
      detailInput: (item, cb) => (
        <input
          type="text"
          placeholder="Server Admins"
          value={item?.serverAdmins ?? ""}
          class="input"
          onChange={(event) =>
            cb("serverAdmins", (event.target as HTMLInputElement).value.trim())
          }
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Server Description",
      detailInput: (item, cb) => (
        <input
          type="text"
          placeholder="Server Description"
          value={item?.serverDescription ?? ""}
          class="input"
          onChange={(event) =>
            cb(
              "serverDescription",
              (event.target as HTMLInputElement).value.trim()
            )
          }
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Website",
      detailInput: (item, cb) => (
        <input
          type="text"
          placeholder="Website"
          value={item?.website ?? ""}
          class="input"
          onChange={(event) =>
            cb("website", (event.target as HTMLInputElement).value.trim())
          }
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Contact",
      detailInput: (item, cb) => (
        <input
          type="text"
          placeholder="Contact"
          value={item?.contact ?? ""}
          class="input"
          onChange={(event) =>
            cb("contact", (event.target as HTMLInputElement).value.trim())
          }
        />
      ),
      shouldBeVisible: () => false,
    },
    {
      name: "Map No Replay",
      detailInput: (item, cb) => (
        <input
          type="number"
          placeholder="Map No Replay"
          min="0"
          max="30"
          value={item?.mapNoReplay ?? 0}
          class="input"
          onChange={(event) =>
            cb(
              "warmUpLength",
              parseInt((event.target as HTMLInputElement).value)
            )
          }
        />
      ),
      shouldBeVisible: () => false,
      tooltip: () => "A map can't be voted for the given count of map switches",
    },
    {
      name: "Enable Voicechat",
      detailInput: (item, cb) => (
        <to4st-switch
          value={item?.enableVoicechat}
          onToggle={(event) => cb("enableVoicechat", event.detail)}
        />
      ),
      shouldBeVisible: () => false,
    },
  ] as ColumnDetailProps<TGameserverConfig>[];

  async saveGameserverConfig(
    entity: any,
    transactionId: string,
    afterEx: EventEmitter<string>
  ) {
    const o = entity as TGameserverConfig;

    try {
      await GameserverService.get(this.apiClient).createUpdateGameserverConfig(
        {
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
          enableVoicechat: o.enableVoicechat,
        },
        transactionId
      );

      afterEx.emit("");
    } catch (e) {
      afterEx.emit(extractGraphQLErrors(e));
      console.error(e);
    }
  }

  /**
   * Get symbol to render bool
   * @param checked
   */
  getSymbol(checked: boolean) {
    return checked ? (
      <i class="fas fa-check"></i>
    ) : (
      <i class="fas fa-times"></i>
    );
  }

  async removeGameserverConfig(entity: any, onDeletedEntity: () => void) {
    const o = entity as TGameserverConfig;
    try {
      await GameserverService.get(this.apiClient).deleteGameserverConfig(
        o.gameserver.id
      );
    } catch (e) {
      console.error(e);
    }
    onDeletedEntity();
  }

  async updateGameserverConfigs(
    page: number,
    search: string,
    orderBy: string,
    orderDesc: boolean,
    onFetchedData: (data: any[], pageCount: number) => void
  ) {
    try {
      const [gameservers, pageCount] = await await GameserverService.get(
        this.apiClient
      ).gameservers(
        page,
        PAGE_SIZE,
        search,
        orderDesc,
        orderBy as GameserverConfigOrder
      );
      const mapped = gameservers.map((x) => ({
        ...DEFAULT_GAMESERVER_CONFIG,
        ...extractGameserverConfig(x, DEFAULT_GAMESERVER_CONFIG),
      }));

      onFetchedData(mapped, pageCount);
    } catch (e) {
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
          defaultCreateObject={this.defaultGameserverConfig}
          mapOrderByAssign={(raw) => {
            if (raw === "Current Name") {
              return GameserverConfigOrder.currentName as string;
            }

            return GameserverConfigOrder.hasConfig as string;
          }}
          canItemBeDeleted={(item: TGameserverConfig) =>
            !!item?.gameserver?.gameserverConfig
          }
          onUpdateEntities={(e) =>
            this.updateGameserverConfigs(
              e.detail.page,
              e.detail.search,
              e.detail.orderBy,
              e.detail.orderDesc,
              e.detail.onFetchedData
            )
          }
          onSaveEntity={(e) =>
            this.saveGameserverConfig(
              e.detail.entity as TGameserverConfig,
              e.detail.transactionId,
              e.detail.afterEx
            )
          }
          onDeleteEntity={(e) =>
            this.removeGameserverConfig(
              e.detail.entity as TGameserverConfig,
              e.detail.onDeletedEntity
            )
          }
        ></to4st-details>
      </Host>
    );
  }
}
