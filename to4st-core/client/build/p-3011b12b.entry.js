import{r as t,h as e,H as a}from"./p-89d64653.js";import"./p-18a1d9b0.js";import{a as s}from"./p-53397e03.js";import{e as n}from"./p-b4a30ea7.js";import{G as i}from"./p-212dc3b2.js";import"./p-01c079a6.js";import"./p-ee768a2e.js";import"./p-9812df09.js";const o=class{constructor(a){t(this,a),this.servers=[],this.currentPage=1,this.currentPageCount=1,this.currentSearch="",this.orderDesc=!0,this.apiClient={},this.columns=[{name:"Id",hiddenMobile:()=>!0,tableContent:t=>e("p",null,t.id)},{name:"Current Name",tableContent:t=>e("p",null,t.currentName),sortable:!0},{name:"Key",tableContent:t=>e("p",null,t.authKey),input:(t,a)=>{var s;return e("input",{type:"text",placeholder:"Leave blank to auto-generate",value:null!==(s=null==t?void 0:t.authKey)&&void 0!==s?s:"",class:"input",onChange:t=>a.emit({key:"authKey",value:t.target.value.trim()})})}},{name:"Description",tableContent:t=>e("p",null,t.description),input:(t,a)=>{var s;return e("input",{type:"text",placeholder:"Description",value:null!==(s=null==t?void 0:t.description)&&void 0!==s?s:"",class:"input",onChange:t=>a.emit({key:"description",value:t.target.value.trim()})})}},{name:"Last Contact",hiddenMobile:()=>!0,tableContent:t=>{var a;return e("p",null,null===(a=t.lastContact)||void 0===a?void 0:a.toLocaleString())},sortable:!0}],this.filters=[]}async componentWillLoad(){await this.updateContent()}async updateContent(){try{const[t,e]=await i.get(this.apiClient).gameservers(this.currentPage,25,this.currentSearch,this.orderDesc,this.currentOrderBy);this.servers=t,this.currentPageCount=e}catch(t){console.error(t)}}async searchGameserver(t){this.currentSearch=t,await this.updateContent()}async saveGameserver(t,e,a,s){try{await i.get(this.apiClient).createUpdateGameserver({id:t.id,authKey:t.authKey,description:t.description,currentName:t.currentName},s),a.emit(),await this.updateContent()}catch(t){a.emit(n(t)),console.error(t)}}async goToPage(t){this.currentPage=t,await this.updateContent()}async removeGameserver(t){try{await i.get(this.apiClient).deleteGameserver(t.id),await this.updateContent()}catch(t){console.error(t)}}orderBy(t,e){this.orderDesc=e,this.currentOrderBy="Last Contact"===t?"lastContact":"currentName",this.updateContent()}render(){return e(a,null,e("to4st-list",{name:"Gameservers",columns:this.columns,content:this.servers,pagesCount:this.currentPageCount,currentPage:this.currentPage,onChangedOrder:t=>this.orderBy(t.detail.orderBy,t.detail.orderDesc),onPagination:t=>this.goToPage(t.detail),onSaveItem:t=>this.saveGameserver(t.detail.item,t.detail.isEdit,t.detail.afterSaveExecuted,t.detail.transactionId),onSearchItem:t=>this.searchGameserver(t.detail),onRemoveItem:t=>this.removeGameserver(t.detail)}))}};(function(t,e,a,s){var n,i=arguments.length,o=i<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,a):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,a,s);else for(var r=t.length-1;r>=0;r--)(n=t[r])&&(o=(i<3?n(o):i>3?n(e,a,o):n(e,a))||o);i>3&&o&&Object.defineProperty(e,a,o)})([s.Context("api")],o.prototype,"apiClient",void 0),o.style="";export{o as to4st_gameserver_list}