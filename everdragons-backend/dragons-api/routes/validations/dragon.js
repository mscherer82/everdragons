"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var simpl_schema_1 = require("simpl-schema");
var bodySchema = new simpl_schema_1.default({
    dna: {
        type: String,
        min: 18,
        max: 18
    }
});
exports.dragonContext = bodySchema.newContext();
//# sourceMappingURL=dragon.js.map