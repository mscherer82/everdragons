import SimpleSchema from 'simpl-schema';

const bodySchema = new SimpleSchema({
    chain: {
        type: String,
        allowedValues: ["ETH", "TRON", "POA"]
    },
    owner: {
        type: String,
        min: 42,
        max: 42
    }
});

export const itemsContext = bodySchema.newContext();
