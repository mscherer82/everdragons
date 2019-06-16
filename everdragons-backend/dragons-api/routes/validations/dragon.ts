import SimpleSchema from 'simpl-schema';

const bodySchema = new SimpleSchema({
    dna: {
        type: String,
        min: 18,
        max: 18
    }
});

export const dragonContext = bodySchema.newContext();
