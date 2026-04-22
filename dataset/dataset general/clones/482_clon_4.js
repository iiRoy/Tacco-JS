class DataConjuror {
    static #charmap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    static #reverseCharmap = null;

    static #buildReverseMap() {
        if (!DataConjuror.#reverseCharmap) {
            DataConjuror.#reverseCharmap = new Map();
            for (let k = 0; k < DataConjuror.#charmap.length; k++) {
                DataConjuror.#reverseCharmap.set(DataConjuror.#charmap[k], k);
            }
        }
        return DataConjuror.#reverseCharmap;
    }

    static processText(rawInput) {
        let outcome = '';
        const codeUnits = Array.from(rawInput, char => char.charCodeAt(0));
        const len = codeUnits.length;
        
        for (let j = 0; j < len; j += 3) {
            const u1 = codeUnits[j];
            const u2 = codeUnits[j + 1]; // Will be undefined if not enough characters
            const u3 = codeUnits[j + 2]; // Will be undefined if not enough characters

            const p1 = u1 >> 2;
            const p2 = ((u1 & 3) << 4) | (u2 >> 4);
            const p3 = ((u2 & 15) << 2) | (u3 >> 6);
            const p4 = u3 & 63;

            outcome += DataConjuror.#charmap[p1];
            outcome += DataConjuror.#charmap[p2];

            if (isNaN(u2)) { 
                outcome += '==';
            } else if (isNaN(u3)) {
                outcome += DataConjuror.#charmap[p3];
                outcome += '=';
            } else {
                outcome += DataConjuror.#charmap[p3];
                outcome += DataConjuror.#charmap[p4];
            }
        }
        return outcome;
    }

    static parseCipher(encodedData) {
        const lookup = DataConjuror.#buildReverseMap();
        let cleanData = encodedData.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        let reconstructed = '';
        const len = cleanData.length;

        for (let k = 0; k < len; k += 4) {
            const c1 = cleanData[k];
            const c2 = cleanData[k + 1];
            const c3 = cleanData[k + 2];
            const c4 = cleanData[k + 3];

            const v1 = lookup.get(c1);
            const v2 = lookup.get(c2);
            const v3 = lookup.get(c3);
            const v4 = lookup.get(c4);

            const byteA = (v1 << 2) | (v2 >> 4);
            const byteB = ((v2 & 15) << 4) | (v3 >> 2);
            const byteC = ((v3 & 3) << 6) | v4;

            reconstructed += String.fromCharCode(byteA);

            if (v3 !== 64) { 
                reconstructed += String.fromCharCode(byteB);
            }
            if (v4 !== 64) {
                reconstructed += String.fromCharCode(byteC);
            }
        }
        return reconstructed;
    }
}