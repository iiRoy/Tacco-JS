const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = rawData.trim().split("\n");

const parseInteger = (str) => parseInt(str, 10);

const numItems = parseInteger(lines.shift());
const [firstTerm, commonDiff] = lines.shift().split(" ").map(Number);

const mappingStore = {};

const numOperations = parseInteger(lines.shift());

const hasKey = (store, key) => Object.prototype.hasOwnProperty.call(store, key);

for (let opIndex = 0; opIndex < numOperations; opIndex++) {
    const [opType, key1, key2] = lines.shift().split(" ");

    const key1Exists = hasKey(mappingStore, key1);
    const key2Exists = hasKey(mappingStore, key2);

    if (opType === "1") {
        let valueForKey1 = key1Exists ? mappingStore[key1] : null;
        let valueForKey2 = key2Exists ? mappingStore[key2] : null;

        if (!key1Exists && !key2Exists) {
            mappingStore[key1] = key2;
            mappingStore[key2] = key1;
        } else if (key1Exists && !key2Exists) {
            mappingStore[key2] = valueForKey1;
            mappingStore[key1] = key2;
        } else if (!key1Exists && key2Exists) {
            mappingStore[key1] = valueForKey2;
            mappingStore[key2] = key1;
        } else {
            mappingStore[key1] = valueForKey2;
            mappingStore[key2] = valueForKey1;
        }
    } else {
        if (!key2Exists) {
            mappingStore[key1] = key2;
        } else {
            mappingStore[key1] = mappingStore[key2];
        }
    }
}

let finalKey = lines.shift();

if (hasKey(mappingStore, finalKey)) {
    finalKey = mappingStore[finalKey];
}

const numericFinalKey = parseInteger(finalKey);

const result = firstTerm + ((numericFinalKey - 1) * commonDiff);
console.log(result);
