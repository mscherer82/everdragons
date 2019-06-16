import SimpleSchema from 'simpl-schema';

const querySchema = new SimpleSchema({
    chain: {
        type: String,
        allowedValues: ["POA", "TRON", "ETH"]
    },
    type: {
        type: Number,
        allowedValues: [1, 2],
        optional: true
    },
    ethOwner: {
        type: String,
        min: 42,
        max: 42,
        optional: true,
        custom() {
            if(this.field("query.chain").value === "ETH" && (!this.isSet || this.value.substr(0, 2) !== "0x")) {
                return "invalid";
            }
        }
    },
    poaOwner: {
        type: String,
        min: 42,
        max: 42,
        optional: true,
        custom() {
            if(this.field("query.chain").value === "POA" && (!this.isSet || this.value.substr(0, 2) !== "0x")) {
                return "invalid";
            }
        }
    },
    tronOwner: {
        type: String,
        min: 42,
        max: 42,
        optional: true,
        custom() {
            if(this.field("query.chain").value === "TRON" && (!this.isSet || this.value.substr(0, 2) !== "41")) {
                return "invalid";
            }
        }
    }
});

const bodySchema = new SimpleSchema({
    query: {
        type: querySchema
    },
    sort: {
        type: Object,
        optional: true
    },
    "sort.prestige": {
        type: Number,
        allowedValues: [1, -1],
        optional: true
    },
    "sort.experience": {
        type: Number,
        allowedValues: [1, -1],
        optional: true
    },
    limit: {
        type: Number,
        max: 10,
        min: 0,
        optional: true
    },
    offset: {
        type: Number,
        min: 0,
        optional: true
    }
});

export const dragonsContext = bodySchema.newContext();
