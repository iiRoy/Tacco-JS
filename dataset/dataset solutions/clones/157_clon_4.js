const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const symbolToValue = new Map([
    ['I', 1],
    ['V', 5],
    ['X', 10],
    ['L', 50],
    ['C', 100],
    ['D', 500],
    ['M', 1000]
]);

function convertRomanToInteger(romanSequence, valueLookup) {
    let finalSum = 0;
    let previousSymbolValue = 0;

    for (let position = romanSequence.length - 1; position >= 0; position--) {
        const currentSymbol = romanSequence[position];
        const currentSymbolValue = valueLookup.get(currentSymbol);

        if (currentSymbolValue < previousSymbolValue) {
            finalSum -= currentSymbolValue;
        } else {
            finalSum += currentSymbolValue;
        }
        previousSymbolValue = currentSymbolValue;
    }
    return finalSum;
}

const romanNumeralLines = rawData.trim().split('\n');

romanNumeralLines.forEach(function(romanEntry) {
    const integerResult = convertRomanToInteger(romanEntry, symbolToValue);
    console.log(integerResult);
});
