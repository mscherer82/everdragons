"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var simpl_schema_1 = require("simpl-schema");
var querySchema = new simpl_schema_1.default({
    chain: {
        type: String,
        allowedValues: ["POA", "TRON", "ETH"]
    },
    type: {
        type: Number,
        allowedValues: [1, 2]
    }
});
var sortSchema = new simpl_schema_1.default({
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
var bodySchema = new simpl_schema_1.default({
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
exports.auctionsContext = bodySchema.newContext();
//# sourceMappingURL=auctions.js.map