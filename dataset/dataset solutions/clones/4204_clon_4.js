'use strict';

let rawData = require("fs").readFileSync("/dev/stdin", "utf8");
let processedData = rawData.trim();

function evaluatePattern(textSegment) {
    const patternBlueprint = [
        { symbol: 'A', optional: true },
        { symbol: 'K', optional: false },
        { symbol: 'I', optional: false },
        { symbol: 'H', optional: true },
        { symbol: 'B', optional: false },
        { symbol: 'A', optional: true },
        { symbol: 'R', optional: false },
        { symbol: 'A', optional: true }
    ];

    let textPointer = 0;

    for (let i = 0; i < patternBlueprint.length; i++) {
        const currentSpec = patternBlueprint[i];
        const charInText = textSegment[textPointer];

        if (charInText === currentSpec.symbol) {
            textPointer++;
        } else if (!currentSpec.optional) {
            return false;
        }
    }

    return true;
}

let outcome = evaluatePattern(processedData) ? "YES" : "NO";
console.log(outcome);
