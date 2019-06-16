const part = (str, p, l = 2) => {
    return str.substr(str.length - (p + l), l)
};

module.exports = {

    extractDNA(dna) {
        const result = {};

        // DNA:
        // Type	            256	8
        // Layer 1 – Wings	256	8
        // Layer 2 – Tail	256	8
        // Layer 3 – Body	256	8
        // Layer 4 – Legs	256	8
        // Layer 5 – Head	256	8
        // Layer 6 – Horns	256	8
        // Layer 7 – Eyes	256	8
        // Layer 8 – t.b.d.	256	8

        if(dna.substr(0, 2) === "0x") {
            dna = dna.substr(2);
        }
        dna = dna.padStart(16, "0");

        result.type = parseInt(part(dna, 0), 16);
        result.layers = [];
        for (let i = 0; i < 7; i++) {
            result.layers[i] = (parseInt(part(dna,i * 2 + 2), 16) % 23) + 1;
        }
        return result;
    },
    extractAttributes(attributes) {

        const result = {};

        // Attributes
        // Version          32  5
        // Color	        64  6
        // Domain	         8	3
        // Power Source	    32	5
        if(attributes.substr(0, 2) === "0x") {
            attributes = attributes.substr(2);
        }
        attributes = attributes.padStart(6, "0");

        result.version = parseInt(part(attributes, 0, 2), 16) & 0x1F;
        result.color = (parseInt(part(attributes,0, 3), 16) >> 5) & 0x3F;
        result.domain = (parseInt(part(attributes,0,6), 16) >> 11) & 0x07;
        result.powerSource = (parseInt(part(attributes,0,6), 16) >> 14) & 0x1F;
        return result;
    }
};
