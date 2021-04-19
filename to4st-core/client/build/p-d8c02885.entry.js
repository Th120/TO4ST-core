import{r as t,h as e,H as a}from"./p-d36259ec.js";import"./p-70b7bd16.js";import{a as n}from"./p-bc64f1f3.js";import"./p-0bc4f624.js";import{e as s}from"./p-6d473d66.js";import"./p-63cac319.js";import"./p-50238e6f.js";const l=class{constructor(a){t(this,a),this.players=[],this.currentPage=1,this.currentPageCount=1,this.currentSearch="",this.orderDesc=!0,this.currentOrderBy="",this.hasValidNames=!1,this.apiClient={},this.columns=[{name:"SteamId64",hiddenMobile:()=>this.hasValidNames,tableContent:t=>e("p",null,e("a",{target:"_blank",href:"http://steamcommunity.com/profiles/"+t.steamId64},t.steamId64)),input:(t,a,n)=>{var s;return e("input",{type:"text",placeholder:"SteamId64",disabled:!n,value:null!==(s=null==t?void 0:t.steamId64)&&void 0!==s?s:"",class:"input",onChange:t=>a.emit({key:"steamId64",value:t.target.value.trim()})})}},{name:"Name",tableContent:t=>{var a;return e("p",null,e("a",{target:"_blank",href:"http://steamcommunity.com/profiles/"+t.steamId64},null===(a=t.steamUser)||void 0===a?void 0:a.name))},shouldBeVisible:()=>this.hasValidNames},{name:"Visible Role",tableContent:t=>e("p",null,t.visibleRole),input:(t,a)=>{var n;return e("input",{type:"text",placeholder:"Visible Role",value:null!==(n=null==t?void 0:t.visibleRole)&&void 0!==n?n:"",class:"input",onChange:t=>a.emit({key:"visibleRole",value:t.target.value.trim()})})}},{name:"Root Admin",tableContent:t=>e("p",null,this.getSymbol(t.rootAdmin)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.rootAdmin,onToggle:t=>a.emit({key:"rootAdmin",value:t.detail})})},{name:"Kick",tableContent:t=>e("p",null,this.getSymbol(t.kick)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.kick,onToggle:t=>a.emit({key:"kick",value:t.detail})})},{name:"Ban",tableContent:t=>e("p",null,this.getSymbol(t.ban)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.ban,onToggle:t=>a.emit({key:"ban",value:t.detail})})},{name:"Temp KickBan",tableContent:t=>e("p",null,this.getSymbol(t.tempKickBan)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.tempKickBan,onToggle:t=>a.emit({key:"tempKickBan",value:t.detail})})},{name:"Mute",tableContent:t=>e("p",null,this.getSymbol(t.mute)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.mute,onToggle:t=>a.emit({key:"mute",value:t.detail})})},{name:"Make Teams",tableContent:t=>e("p",null,this.getSymbol(t.makeTeams)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.makeTeams,onToggle:t=>a.emit({key:"makeTeams",value:t.detail})})},{name:"Reserved Slots",tableContent:t=>e("p",null,this.getSymbol(t.reservedSlots)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.reservedSlots,onToggle:t=>a.emit({key:"reservedSlots",value:t.detail})})},{name:"Broadcast Message",tableContent:t=>e("p",null,this.getSymbol(t.broadcastMessage)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.broadcastMessage,onToggle:t=>a.emit({key:"broadcastMessage",value:t.detail})})},{name:"Game Control",tableContent:t=>e("p",null,this.getSymbol(t.gameControl)),input:(t,a)=>e("to4st-switch",{value:null==t?void 0:t.gameControl,onToggle:t=>a.emit({key:"gameControl",value:t.detail})})}]}getSymbol(t){return e("i",t?{class:"fas fa-check"}:{class:"fas fa-times"})}async componentWillLoad(){await this.updateContent()}async updateContent(){try{const t=await this.apiClient.client.chain.query.registeredPlayers({options:{page:this.currentPage,search:this.currentSearch,pageSize:25}}).execute({pageCount:!0,content:{steamId64:!0,steamUser:{name:!0,avatarMediumUrl:!0},visibleRole:!0,rootAdmin:!0,kick:!0,ban:!0,tempKickBan:!0,mute:!0,makeTeams:!0,reservedSlots:!0,broadcastMessage:!0,gameControl:!0}});this.players=t.content,this.currentPageCount=t.pageCount,this.hasValidNames=this.players.some((t=>{var e;return null===(e=t.steamUser)||void 0===e?void 0:e.name}))}catch(t){console.error(t)}}async searchPlayer(t){this.currentSearch=t,await this.updateContent()}async savePlayer(t,e,a){try{await this.apiClient.client.chain.mutation.createUpdateRegisteredPlayer({registeredPlayer:{steamId64:t.steamId64,rootAdmin:t.rootAdmin,visibleRole:t.visibleRole,kick:t.kick,ban:t.ban,tempKickBan:t.tempKickBan,mute:t.mute,makeTeams:t.makeTeams,reservedSlots:t.reservedSlots,broadcastMessage:t.broadcastMessage,gameControl:t.gameControl}}).execute({steamId64:!1}),a.emit(),await this.updateContent()}catch(t){a.emit(s(t)),console.error(t)}}async goToPage(t){this.currentPage=t,await this.updateContent()}async removePlayer(t){try{await this.apiClient.client.chain.mutation.deleteRegisteredPlayer({steamId64:t.steamId64}).execute(!1),await this.updateContent()}catch(t){console.error(t)}}render(){return e(a,null,e("to4st-list",{name:"Registered Players",columns:this.columns,content:this.players,pagesCount:this.currentPageCount,currentPage:this.currentPage,onPagination:t=>this.goToPage(t.detail),onSaveItem:t=>this.savePlayer(t.detail.item,t.detail.isEdit,t.detail.afterSaveExecuted),onSearchItem:t=>this.searchPlayer(t.detail),onRemoveItem:t=>this.removePlayer(t.detail)}))}};(function(t,e,a,n){var s,l=arguments.length,i=l<3?e:null===n?n=Object.getOwnPropertyDescriptor(e,a):n;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(t,e,a,n);else for(var o=t.length-1;o>=0;o--)(s=t[o])&&(i=(l<3?s(i):l>3?s(e,a,i):s(e,a))||i);l>3&&i&&Object.defineProperty(e,a,i)})([n.Context("api")],l.prototype,"apiClient",void 0),l.style="";export{l as to4st_registered_players_list}