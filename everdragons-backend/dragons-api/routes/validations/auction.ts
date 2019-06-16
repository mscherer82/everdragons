import SimpleSchema from 'simpl-schema';

const bodySchema = new SimpleSchema({
    dna: {
        type: String,
        min: 18,
        max: 18
    },
    chain: {
        type: String,
        allowedValues: ["POA", "TRON", "ETH"]
    }
});

export const auctionContext = bodySchema.newContext();
