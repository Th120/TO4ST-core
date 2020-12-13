import{r as e,h as t,H as a}from"./p-d36259ec.js";import"./p-70b7bd16.js";import{a as n}from"./p-51ed6d90.js";import"./p-1d19becb.js";import{e as s}from"./p-fde7e420.js";import"./p-c93254e9.js";import"./p-ee4feef9.js";const l=class{constructor(a){e(this,a),this.players=[],this.currentPage=1,this.currentPageCount=1,this.currentSearch="",this.orderDesc=!0,this.currentOrderBy="",this.hasValidNames=!1,this.apiClient={},this.columns=[{name:"SteamId64",hiddenMobile:()=>this.hasValidNames,tableContent:e=>t("p",null,t("a",{target:"_blank",href:"http://steamcommunity.com/profiles/"+e.steamId64},e.steamId64)),input:(e,a,n)=>{var s;return t("input",{type:"text",placeholder:"SteamId64",disabled:!n,value:null!==(s=null==e?void 0:e.steamId64)&&void 0!==s?s:"",class:"input",onChange:e=>a.emit({key:"steamId64",value:e.target.value.trim()})})}},{name:"Name",tableContent:e=>{var a;return t("p",null,t("a",{target:"_blank",href:"http://steamcommunity.com/profiles/"+e.steamId64},null===(a=e.steamUser)||void 0===a?void 0:a.name))},shouldBeVisible:()=>this.hasValidNames},{name:"Visible Role",tableContent:e=>t("p",null,e.visibleRole),input:(e,a)=>{var n;return t("input",{type:"text",placeholder:"Visible Role",value:null!==(n=null==e?void 0:e.visibleRole)&&void 0!==n?n:"",class:"input",onChange:e=>a.emit({key:"visibleRole",value:e.target.value.trim()})})}},{name:"Root Admin",tableContent:e=>t("p",null,this.getSymbol(e.rootAdmin)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.rootAdmin,onToggle:e=>a.emit({key:"rootAdmin",value:e.detail})})},{name:"Kick",tableContent:e=>t("p",null,this.getSymbol(e.kick)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.kick,onToggle:e=>a.emit({key:"kick",value:e.detail})})},{name:"Ban",tableContent:e=>t("p",null,this.getSymbol(e.ban)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.ban,onToggle:e=>a.emit({key:"ban",value:e.detail})})},{name:"Temp KickBan",tableContent:e=>t("p",null,this.getSymbol(e.tempKickBan)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.tempKickBan,onToggle:e=>a.emit({key:"tempKickBan",value:e.detail})})},{name:"Mute",tableContent:e=>t("p",null,this.getSymbol(e.mute)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.mute,onToggle:e=>a.emit({key:"mute",value:e.detail})})},{name:"Make Teams",tableContent:e=>t("p",null,this.getSymbol(e.makeTeams)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.makeTeams,onToggle:e=>a.emit({key:"makeTeams",value:e.detail})})},{name:"Reserved Slots",tableContent:e=>t("p",null,this.getSymbol(e.reservedSlots)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.reservedSlots,onToggle:e=>a.emit({key:"reservedSlots",value:e.detail})})},{name:"Broadcast Message",tableContent:e=>t("p",null,this.getSymbol(e.broadcastMessage)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.broadcastMessage,onToggle:e=>a.emit({key:"broadcastMessage",value:e.detail})})},{name:"Game Control",tableContent:e=>t("p",null,this.getSymbol(e.gameControl)),input:(e,a)=>t("to4st-switch",{value:null==e?void 0:e.gameControl,onToggle:e=>a.emit({key:"gameControl",value:e.detail})})}]}getSymbol(e){return t("i",e?{class:"fas fa-check"}:{class:"fas fa-times"})}async componentWillLoad(){await this.updateContent()}async updateContent(){try{const e=await this.apiClient.client.chain.query.registeredPlayers({options:{page:this.currentPage,search:this.currentSearch,pageSize:25}}).execute({pageCount:!0,content:{steamId64:!0,steamUser:{name:!0,avatarMediumUrl:!0},visibleRole:!0,rootAdmin:!0,kick:!0,ban:!0,tempKickBan:!0,mute:!0,makeTeams:!0,reservedSlots:!0,broadcastMessage:!0,gameControl:!0}});this.players=e.content,this.currentPageCount=e.pageCount,this.hasValidNames=this.players.some((e=>{var t;return null===(t=e.steamUser)||void 0===t?void 0:t.name}))}catch(e){console.error(e)}}async searchPlayer(e){this.currentSearch=e,await this.updateContent()}async savePlayer(e,t,a){try{await this.apiClient.client.chain.mutation.createUpdateRegisteredPlayer({registeredPlayer:{steamId64:e.steamId64,rootAdmin:e.rootAdmin,visibleRole:e.visibleRole,kick:e.kick,ban:e.ban,tempKickBan:e.tempKickBan,mute:e.mute,makeTeams:e.makeTeams,reservedSlots:e.reservedSlots,broadcastMessage:e.broadcastMessage,gameControl:e.gameControl}}).execute({steamId64:!1}),a.emit(),await this.updateContent()}catch(e){a.emit(s(e)),console.log(e)}}async goToPage(e){this.currentPage=e,await this.updateContent()}async removePlayer(e){try{await this.apiClient.client.chain.mutation.deleteRegisteredPlayer({steamId64:e.steamId64}).execute(!1),await this.updateContent()}catch(e){console.log(e)}}render(){return t(a,null,t("to4st-list",{name:"Registered Players",columns:this.columns,content:this.players,pagesCount:this.currentPageCount,currentPage:this.currentPage,onPagination:e=>this.goToPage(e.detail),onSaveItem:e=>this.savePlayer(e.detail.item,e.detail.isEdit,e.detail.afterSaveExecuted),onSearchItem:e=>this.searchPlayer(e.detail),onRemoveItem:e=>this.removePlayer(e.detail)}))}};(function(e,t,a,n){var s,l=arguments.length,i=l<3?t:null===n?n=Object.getOwnPropertyDescriptor(t,a):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,a,n);else for(var o=e.length-1;o>=0;o--)(s=e[o])&&(i=(l<3?s(i):l>3?s(t,a,i):s(t,a))||i);l>3&&i&&Object.defineProperty(t,a,i)})([n.Context("api")],l.prototype,"apiClient",void 0),l.style="";export{l as to4st_registered_players_list}