/* istanbul ignore file */
import { ObjectType, Field, Int, Float, registerEnumType } from "@nestjs/graphql";
import { Expose } from "class-transformer";

/**
 * Enum used to order playerStats
 */
export enum OrderPlayerBaseStats {
    sumKills = "sumkills", 
    sumDeaths = "sumdeaths",
    sumSuicides = "sumsuicides",
    sumDamage = "sumdamage",
    killDeath = "killdeath",
    averageScorePerRound = "averagescoreperround",
    averageDamagePerRound = "averagedamageperround",
    sumScore = "sumscore",
    roundsPlayed = "roundsplayed",
    gamesPlayed = "gamesplayed"
}

export const escapeOrderBy = (orderBy: OrderPlayerBaseStats | string) =>
{
    switch (orderBy)
    {
        case OrderPlayerBaseStats.sumDeaths:
            return OrderPlayerBaseStats.sumDeaths;
        case OrderPlayerBaseStats.sumScore:
            return OrderPlayerBaseStats.sumScore;
        case OrderPlayerBaseStats.sumDamage:
            return OrderPlayerBaseStats.sumDamage;
        case OrderPlayerBaseStats.killDeath:
            return OrderPlayerBaseStats.killDeath;
        case OrderPlayerBaseStats.sumSuicides:
            return OrderPlayerBaseStats.sumSuicides;
        case OrderPlayerBaseStats.averageDamagePerRound:
            return OrderPlayerBaseStats.averageDamagePerRound;
        case OrderPlayerBaseStats.averageScorePerRound:
            return OrderPlayerBaseStats.averageScorePerRound;
        case OrderPlayerBaseStats.roundsPlayed:
            return OrderPlayerBaseStats.roundsPlayed;
        case OrderPlayerBaseStats.gamesPlayed:
            return OrderPlayerBaseStats.gamesPlayed;
    }

    return OrderPlayerBaseStats.sumKills;
}

/**
 * Register enum type in graphQL
 */
registerEnumType(OrderPlayerBaseStats, {
    name: "OrderPlayerBaseStats",
});

/**
 * Object type of aggregated player statistics
 */
@ObjectType()
export class PlayerStatistics {

    /**
     * SteamId of player
     */
    @Field(() => String)
    @Expose()
    steamId64: string;

    /**
     * Current rank
     */
    @Field(() => Int)
    @Expose()
    rank: number;

    /**
     * Total kills
     */
    @Field(() => Int)
    @Expose()
    kills: number;

    /**
     * Total deaths
     */
    @Field(() => Int)
    @Expose()
    deaths: number;

    /**
     * Total suicides
     */
    @Field(() => Int)
    @Expose()
    suicides: number;

    /**
     * K/D
     */
    @Field(() => Float)
    @Expose()
    killDeathRatio: number;

    /**
     * Total score
     */
    @Field(() => Int)
    @Expose()
    totalScore: number;

    /**
     * Total damage
     */
    @Field(() => Float)
    @Expose()
    totalDamage: number;

    /**
     * Total number of games played
     */
    @Field(() => Int)
    @Expose()
    numberGamesPlayed: number;

    /**
     * Total number of rounds played
     */
    @Field(() => Int)
    @Expose()
    numberRoundsPlayed: number;

    /**
     * Average damage per round
     */
    @Field(() => Float)
    @Expose()
    avgDamagePerRound: number;

    /**
     * Average score per round
     */
    @Field(() => Float)
    @Expose()
    avgScorePerRound: number;

    constructor(partial: Partial<PlayerStatistics>) {
        Object.assign(this, partial);
    }
}

