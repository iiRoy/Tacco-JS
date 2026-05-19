var fileSystemModule = require("fs");

const standardInputPath = "/dev/stdin";

function getComparisonIndicator(firstValue, secondValue) {
    let comparisonResultSymbol;
    const valuesAreIdentical = (firstValue === secondValue);
    const firstIsLexicographicallySmaller = (firstValue < secondValue);

    if (valuesAreIdentical) {
        comparisonResultSymbol = '=';
    } else if (firstIsLexicographicallySmaller) {
        comparisonResultSymbol = '<';
    } else {
        comparisonResultSymbol = '>';
    }
    return comparisonResultSymbol;
}

var rawInputData = fileSystemModule.readFileSync(standardInputPath, "utf8");

var inputTokenList = rawInputData.split(' ');

const primaryToken = inputTokenList[0];
const secondaryToken = inputTokenList[1];

var finalComparisonSymbol = getComparisonIndicator(primaryToken, secondaryToken);

console.log(finalComparisonSymbol);
