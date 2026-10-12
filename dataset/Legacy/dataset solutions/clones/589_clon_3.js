var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

function extractAndParseNumber(sourceArray) {
    const stringValue = sourceArray.shift();
    return Number(stringValue);
}

var processedLines = fileContent.trim().split("\n");

while (true) {
    var currentExpectedTotal = extractAndParseNumber(processedLines);

    if (currentExpectedTotal === 0) {
        break;
    }

    var runningSumOfValues = 0;
    const numberOfItemsToSum = 10;

    for (let itemIndex = 0; itemIndex < numberOfItemsToSum; itemIndex++) {
        const itemValue = extractAndParseNumber(processedLines);
        runningSumOfValues += itemValue;
    }

    const finalDifference = currentExpectedTotal - runningSumOfValues;

    console.log(finalDifference);
}
