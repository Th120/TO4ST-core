import{S as e}from"./p-9812df09.js";const a=(e,a)=>Object.assign(Object.assign({},e.gameserverConfig?e.gameserverConfig:a),{gameserver:e});class t{static get(a){return{gameservers:async(t,n,r,o,s)=>{const c=await a.client.query(((a,t,n,r,o)=>e.query({gameservers:[{options:{pageSize:t,page:a,search:n,orderDesc:r,orderBy:o||"currentName"}},{pageCount:!0,totalCount:!0,content:{id:!0,authKey:!0,currentName:!0,description:!0,lastContact:!0,gameserverConfig:{currentMatchConfig:{id:!0,configName:!0,gameMode:{name:!0},configHash:!0,matchEndLength:!0,warmUpLength:!0,friendlyFireScale:!0,mapLength:!0,roundLength:!0,preRoundLength:!0,roundEndLength:!0,roundLimit:!0,allowGhostcam:!0,playerVoteThreshold:!0,autoBalanceTeams:!0,playerVoteTeamOnly:!0,maxTeamDamage:!0,enablePlayerVote:!0,autoSwapTeams:!0,midGameBreakLength:!0,nadeRestriction:!0,globalVoicechat:!0,muteDeadToTeam:!0,ranked:!0,private:!0},currentName:!0,voteLength:!0,gamePassword:!0,reservedSlots:!0,balanceClans:!0,allowSkipMapVote:!0,tempKickBanTime:!0,autoRecordReplay:!0,playerGameControl:!0,enableMapVote:!0,serverAdmins:!0,serverDescription:!0,website:!0,contact:!0,mapNoReplay:!0,enableVoicechat:!0}}}]}))(t,n,r,o,s));return[c.gameservers.content.map((e=>(e=>Object.assign(Object.assign({},e),{lastContact:new Date(e.lastContact)}))(e))),c.gameservers.pageCount,c.gameservers.totalCount]},createUpdateGameserverConfig:async(e,t)=>{a.setTransactionId(t),await a.client.mutation({createUpdateGameserverConfig:[{gameserverConfig:e},{gameserver:{id:!0}}]})},deleteGameserverConfig:async e=>{await a.client.mutation({deleteGameserverConfig:[{gameserverId:e},!0]})},createUpdateGameserver:async(e,t)=>{a.setTransactionId(t),await a.client.mutation({createUpdateGameserver:[{gameserver:e},{id:!0}]})},deleteGameserver:async e=>{await a.client.mutation({deleteGameserver:[{gameserverId:e},!0]})},gamemodes:async()=>{const t=(await a.client.query(e.query({gameModes:{pageCount:!0,totalCount:!0,content:{name:!0}}}))).gameModes;return[t.content,t.pageCount,t.totalCount]},matchConfigs:async(t,n,r,o)=>{const s=await a.client.query(((a,t,n,r)=>e.query({matchConfigs:[{options:{page:a,pageSize:t,configName:n,orderDesc:r}},{pageCount:!0,totalCount:!0,content:{id:!0,configName:!0,gameMode:{name:!0},configHash:!0,matchEndLength:!0,warmUpLength:!0,friendlyFireScale:!0,mapLength:!0,roundLength:!0,preRoundLength:!0,roundEndLength:!0,roundLimit:!0,allowGhostcam:!0,playerVoteThreshold:!0,autoBalanceTeams:!0,playerVoteTeamOnly:!0,maxTeamDamage:!0,enablePlayerVote:!0,autoSwapTeams:!0,midGameBreakLength:!0,nadeRestriction:!0,globalVoicechat:!0,muteDeadToTeam:!0,ranked:!0,private:!0}}]}))(t,n,r,o));return[s.matchConfigs.content,s.matchConfigs.pageCount,s.matchConfigs.totalCount]},deleteMatchConfig:async e=>{await a.client.mutation({deleteMatchConfig:[{options:{id:e}},!0]})},createUpdateMatchConfig:async(e,t)=>{a.setTransactionId(t),await a.client.mutation({createUpdateMatchConfig:[{matchConfig:e},{id:!0}]})}}}}export{t as G,a as e}