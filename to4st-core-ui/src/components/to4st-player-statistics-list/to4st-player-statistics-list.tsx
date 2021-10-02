import { Component, ComponentInterface, Host, h, State } from "@stencil/core";

import { app } from "../../global/context";
import { TApiClient } from "../../libs/api";
import {
  GraphQLTypes,
  InputType,
  OrderPlayerBaseStats,
  Selectors,
} from "../../libs/client/zeus";
import { TAppInfoApi } from "../../services/app-config.service";

const playerStatsQuery = (
  page: number,
  orderDesc: boolean,
  orderBy: OrderPlayerBaseStats
) =>
  Selectors.query({
    playerStatistics: [
      {
        options: {
          pageSize: 25,
          page: page,
          orderDesc: orderDesc,
          orderBy: orderBy,
          ranked: true,
          cachedIfPossible: true,
        },
      },
      {
        pageCount: true,
        content: {
          rank: true,
          kills: true,
          deaths: true,
          killDeathRatio: true,
          avgDamagePerRound: true,
          avgScorePerRound: true,
          suicides: true,
          steamId64: true,
          totalDamage: true,
          totalScore: true,
          numberGamesPlayed: true,
          numberRoundsPlayed: true,
          steamUser: { name: true, avatarMediumUrl: true },
        },
      },
    ],
  });

export type TPlayerStatistics = InputType<
  GraphQLTypes["Query"],
  ReturnType<typeof playerStatsQuery>
>["playerStatistics"]["content"][number];

/**
 * Player stats list
 */
@Component({
  tag: "to4st-player-statistics-list",
  styleUrl: "to4st-player-statistics-list.scss",
  shadow: false,
})
export class To4stPlayerStatistics implements ComponentInterface {
  /**
   * Content
   */
  @State() playerstats = [] as TPlayerStatistics[];

  /**
   * Current page
   */
  @State() currentPage = 1;

  /**
   * Page count
   */
  @State() currentPageCount = 1;

  /**
   * Ordered descending?
   */
  @State() orderDesc = true;

  /**
   * Current order key
   */
  @State() currentOrderBy = OrderPlayerBaseStats.sumKills;

  /**
   * Has valid steeam names
   */
  @State() hasValidNames = false;

  /**
   * All steam names are valid, steamIds can be hidden
   */
  @State() allNamesValid = false;

  /**
   * All images are valid
   */
  @State() allImagesValid = false;

  /**
   * Currently waiting for stats request
   */
  @State() loadingData = false;

  /**
   * Current appConfig
   */
  @app.Context("appConfig") appConfig!: TAppInfoApi;

  /**
   * API client
   */
  @app.Context("api") apiClient!: TApiClient;

  /**
   * Is admin
   */
  @app.Context("isAdmin") isAdmin = false;

  /**
   * Columns of player stats
   */
  columns = [
    {
      name: "",
      hiddenMobile: () => true,
      shouldBeVisible: () => this.allNamesValid,
      tableContent: (player) => (
        <a
          target="_blank"
          href={`http://steamcommunity.com/profiles/${player.steamId64}`}
        >
          <img src={player.steamUser?.avatarMediumUrl} width="48" height="48" />
        </a>
      ),
    },
    {
      name: "SteamId64",
      hiddenMobile: () => this.hasValidNames,
      shouldBeVisible: () => !this.allNamesValid,
      tableContent: (player) => (
        <p>
          <a
            target="_blank"
            href={`http://steamcommunity.com/profiles/${player.steamId64}`}
          >
            {player.steamId64}
          </a>
        </p>
      ),
    },
    {
      name: "Rank",
      tableContent: (player) => <p>{player.rank}</p>,
    },
    {
      name: "Name",
      tableContent: (player) => (
        <p>
          <a
            target="_blank"
            href={`http://steamcommunity.com/profiles/${player.steamId64}`}
          >
            {player.steamUser?.name}
          </a>
        </p>
      ),
      shouldBeVisible: () => this.hasValidNames,
    },
    {
      name: "Kills",
      tableContent: (player) => <p>{player.kills}</p>,
      sortable: true,
    },
    {
      name: "Deaths",
      tableContent: (player) => <p>{player.deaths}</p>,
      sortable: true,
    },
    {
      name: "Suicides",
      tableContent: (player) => <p>{player.suicides}</p>,
      hiddenMobile: () => true,
      sortable: true,
    },
    {
      name: "K/D",
      tableContent: (player) => <p>{player.killDeathRatio?.toFixed(2)}</p>,
      sortable: true,
    },
    {
      name: "Score",
      tableContent: (player) => <p>{player.totalScore}</p>,
      sortable: true,
    },
    {
      name: "Damage",
      tableContent: (player) => <p>{Math.round(player.totalDamage)}</p>,
      sortable: true,
    },
    {
      name: "Avg Damage / Round",
      tableContent: (player) => <p>{player.avgDamagePerRound?.toFixed(0)}</p>,
      sortable: true,
    },
    {
      name: "Avg Score / Round",
      tableContent: (player) => <p>{player.avgScorePerRound?.toFixed(0)}</p>,
      sortable: true,
    },
    {
      name: "Games",
      tableContent: (player) => <p>{player.numberGamesPlayed}</p>,
      hiddenMobile: () => true,
      sortable: true,
    },
    {
      name: "Rounds",
      tableContent: (player) => <p>{player.numberRoundsPlayed}</p>,
      hiddenMobile: () => true,
      sortable: true,
    },
  ];

  /**
   * Handle appConfig updates
   */
  @app.Observe("appConfig")
  async onAppConfigUpdated() {
    await this.updateContent();
  }

  /**
   * Update when client updated
   */
  @app.Observe("api")
  async onClientUpdated() {
    await this.updateContent();
  }

  /**
   * Update list
   */
  async updateContent() {
    if ((this.isAdmin || this.appConfig?.publicStats) && !!this.apiClient) {
      this.loadingData = true;
      try {
        const res = (
          await this.apiClient.client.query(
            playerStatsQuery(
              this.currentPage,
              this.orderDesc,
              this.currentOrderBy
            )
          )
        ).playerStatistics;

        this.playerstats = res.content;
        this.currentPageCount = res.pageCount;
        this.allNamesValid = this.playerstats.every((x) => x.steamUser?.name);
        this.allImagesValid = this.playerstats.every(
          (x) => x.steamUser?.avatarMediumUrl
        );
        this.hasValidNames =
          this.allNamesValid || this.playerstats.some((x) => x.steamUser?.name);
      } catch (e) {
        console.error(e);
      }

      this.loadingData = false;
    }
  }

  /**
   * Handle order
   * @param orderBy column name
   * @param orderDesc
   */
  async orderBy(orderBy: string, orderDesc: boolean) {
    if (orderBy === "Score") {
      this.currentOrderBy = OrderPlayerBaseStats.sumScore;
    } else if (orderBy === "Damage") {
      this.currentOrderBy = OrderPlayerBaseStats.sumDamage;
    } else if (orderBy === "Deaths") {
      this.currentOrderBy = OrderPlayerBaseStats.sumDeaths;
    } else if (orderBy === "Suicides") {
      this.currentOrderBy = OrderPlayerBaseStats.sumSuicides;
    } else if (orderBy === "Games") {
      this.currentOrderBy = OrderPlayerBaseStats.gamesPlayed;
    } else if (orderBy === "Rounds") {
      this.currentOrderBy = OrderPlayerBaseStats.roundsPlayed;
    } else if (orderBy === "K/D") {
      this.currentOrderBy = OrderPlayerBaseStats.killDeath;
    } else if (orderBy === "Avg Score / Round") {
      this.currentOrderBy = OrderPlayerBaseStats.averageScorePerRound;
    } else if (orderBy === "Avg Damage / Round") {
      this.currentOrderBy = OrderPlayerBaseStats.averageDamagePerRound;
    } else {
      this.currentOrderBy = OrderPlayerBaseStats.sumKills;
    }

    this.orderDesc = orderDesc;

    this.updateContent();
  }

  /**
   * Go to page
   * @param page
   */
  async gotoPage(page: number) {
    this.currentPage = page;
    this.updateContent();
  }

  /**
   * Render stats
   */
  render() {
    return (
      <Host>
        <to4st-list
          name="Player Statistics"
          columns={this.columns}
          content={this.playerstats}
          currentPage={this.currentPage}
          pagesCount={this.currentPageCount}
          hasSearch={false}
          loadingInputBlock={this.loadingData}
          onPagination={(x) => this.gotoPage(x.detail)}
          onChangedOrder={(x) =>
            this.orderBy(x.detail.orderBy, x.detail.orderDesc)
          }
          hasCreate={false}
          hasUpdate={false}
        ></to4st-list>
      </Host>
    );
  }
}
