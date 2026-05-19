var rawDataString = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawDataString.split('\n');

const extractAndParseNumbers = (sourceLines, startingIndex, count) => {
    const numericValues = [];
    for (let i = 0; i < count; i++) {
        const currentLineContent = sourceLines[startingIndex + i];
        const parsedValue = Number(currentLineContent);
        numericValues.push(parsedValue);
    }
    return numericValues;
};

const determineMinimumValue = (valueCollection) => {
    if (valueCollection.length === 0) {
        return Infinity; // Consistent with Math.min() on empty set
    }
    return Math.min(...valueCollection);
};

var pizzaPrices = extractAndParseNumbers(inputLines, 0, 3);
var juicePrices = extractAndParseNumbers(inputLines, 3, 2);

var lowestPizzaOption = determineMinimumValue(pizzaPrices);
var lowestJuiceOption = determineMinimumValue(juicePrices);

var combinedMinimumCost = lowestPizzaOption + lowestJuiceOption;
var finalDiscountedPrice = combinedMinimumCost - 50;

console.log(finalDiscountedPrice);
