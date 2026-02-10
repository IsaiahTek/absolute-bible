import { BaseModel } from "./BaseModel";

export class TabHistory extends BaseModel{
    constructor(){
        super();
        this.table = "tab_histories";
        this.createTable("id");
    }
    public fetch = async(offset=0, amount=30)=>{
        const queryObject = await this.prepareFetch(offset, amount);
        return queryObject.results;
    }
    public add = async(tabHistory: AddTabHistory)=>{
        (await this.store).add({tab: JSON.stringify(tabHistory.tab), date: tabHistory.date});
    }
    public update = async(tabHistory: AddTabHistory) => {
        (await this.store).put({id: tabHistory.tab.tabID, tab: JSON.stringify(tabHistory.tab), date: tabHistory.date})
    }
    
}