const symbolInterpretations = new Map([
    ['I', 1], ['V', 5], ['X', 10], ['L', 50],
    ['C', 100], ['D', 500], ['M', 1000]
]);

function processRomanSegment(expressionSequence) {
    let cumulativeValue = 0;
    let priorSymbolMagnitude = 0;

    for (let charPointer = expressionSequence.length - 1; charPointer >= 0; charPointer--) {
        const currentCharacter = expressionSequence[charPointer];
        const currentMagnitude = symbolInterpretations.get(currentCharacter);

        if (currentMagnitude === undefined) {
             // This case should ideally not be reached if segments are properly formed.
             continue;
        }

        if (currentMagnitude < priorSymbolMagnitude) {
            cumulativeValue -= currentMagnitude;
        } else {
            cumulativeValue += currentMagnitude;
        }
        priorSymbolMagnitude = currentMagnitude;
    }
    return cumulativeValue;
}

const inputData = require("fs").readFileSync("/dev/stdin", "utf8");

let currentRomanChunk = '';
let processedOutputs = [];

for (let inputIndex = 0; inputIndex <= inputData.length; inputIndex++) {
    const currentCharacter = inputIndex < inputData.length ? inputData[inputIndex] : undefined;

    if (currentCharacter !== undefined && symbolInterpretations.has(currentCharacter)) {
        currentRomanChunk += currentCharacter;
    } else {
        if (currentRomanChunk.length > 0) {
            processedOutputs.push(processRomanSegment(currentRomanChunk));
        } else {
            if (inputIndex > 0 || inputData.length === 0) {
                processedOutputs.push(0);
            }
        }
        currentRomanChunk = '';
    }
}

processedOutputs.forEach(val => console.log(val));