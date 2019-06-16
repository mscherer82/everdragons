const database = require("./database");

class SyncState {
    constructor(chain, service) {
        this.syncStateCollection = database.getSyncStateCollection();
        if(!this.syncStateCollection) {
            throw "stateCollection can't be null";
        }
        this.syncedBlock = 0;
        this.fieldName = chain.toLowerCase() + service + "SyncState";
    }

    async load() {
        const result = (await this.syncStateCollection.findOne({name: this.fieldName}));
        this.syncedBlock = result && result.value;
    }

    async store(syncedBlock) {
        if(syncedBlock < 0) {
            syncedBlock = 0;
        }
        this.syncedBlock = syncedBlock;
        await this.syncStateCollection.updateOne({name: this.fieldName}, {$set: {value: syncedBlock}}, {upsert: true});
    }
}

module.exports = {
    async getSyncState(chain, service) {
        let syncState = new SyncState(chain, service);
        await syncState.load();
        return syncState;
    }
};
