function calculateAdjustedCeiling(numericValue) {
    const incrementedValue = numericValue + 1;
    const dividedByTwo = incrementedValue / 2;
    const flooredResult = Math.floor(dividedByTwo);
    const finalAdjustedValue = flooredResult - 1;
    return finalAdjustedValue;
}

function processInput(inputString) {
    const parsedValue = parseInt(inputString, 10);
    const computedResult = calculateAdjustedCeiling(parsedValue);
    console.log(computedResult);
}

const fileSystemHandler = require('fs');
const rawInputContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
processInput(rawInputContent);
