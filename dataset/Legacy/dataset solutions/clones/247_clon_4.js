const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = sourceData.split('\n');

function computePascalRowModuloTen(rowIdentifier) {
    if (rowIdentifier < 0) {
        return [];
    }
    const coefficientValues = new Array(rowIdentifier + 1).fill(0);
    coefficientValues[0] = 1;

    for (let currentR = 1; currentR <= rowIdentifier; currentR++) {
        for (let currentC = currentR; currentC > 0; currentC--) {
            coefficientValues[currentC] = (coefficientValues[currentC - 1] + coefficientValues[currentC]) % 10;
        }
    }
    return coefficientValues;
}

let currentEntry;
while ((currentEntry = dataRows.shift()) !== undefined) {
    const digitSequence = currentEntry.split('').map(Number);
    const sequenceLength = digitSequence.length;

    if (sequenceLength === 1) {
        console.log(digitSequence[0]);
        continue;
    }

    const exponentValue = sequenceLength - 1;
    const pascalCoefficientSet = computePascalRowModuloTen(exponentValue);

    let finalResultAccumulator = 0;
    for (let k = 0; k < sequenceLength; k++) {
        finalResultAccumulator = (finalResultAccumulator + pascalCoefficientSet[k] * digitSequence[k]) % 10;
    }
    console.log(finalResultAccumulator);
}
