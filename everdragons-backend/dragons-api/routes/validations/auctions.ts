import SimpleSchema from 'simpl-schema';

const querySchema = new SimpleSchema({
    chain: {
        type: String,
        allowedValues: ["POA", "TRON", "ETH"]
    },
    type: {
        type: Number,
        allowedValues: [1, 2]
    }
});

const sortSchema = new SimpleSchema({
    prestige: {
        type: Number,
        allowedValues: [1, -1],
        optional: true
    },
    experience: {
        type: Number,
        allowedValues: [1, -1],
        optional: true
    },
    currentPrice: {
        type: Number,
        allowedValues: [1, -1],
        optional: true
    }
});


const bodySchema = new SimpleSchema({
    query: {
        type: querySchema
    },
    sort: {
        type: sortSchema,
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

export const auctionsContext = bodySchema.newContext();
