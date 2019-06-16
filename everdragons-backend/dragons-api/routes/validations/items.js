"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var simpl_schema_1 = require("simpl-schema");
var bodySchema = new simpl_schema_1.default({
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
exports.itemsContext = bodySchema.newContext();
//# sourceMappingURL=items.js.map