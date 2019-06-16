module.exports = class SyncState {
    constructor(stateCollection, name) {
        this.stateCollection = stateCollection;
        this.syncedBlock = 0;
        this.fieldName = name + "SyncState";
    }

    async update() {
        const result = (await this.stateCollection.findOne({name: this.fieldName}));
        this.syncedBlock = result && result.value;
    }

    async store(syncedBlock) {
        if(syncedBlock < 0) {
            syncedBlock = 0;
        }
        this.syncedBlock = syncedBlock;
        await this.stateCollection.updateOne({name: this.fieldName}, {$set: {value: syncedBlock}}, {upsert: true});
    }
};
