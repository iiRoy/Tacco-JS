const fileSystemModule = require("fs");
let dataStorage = [];
let currentMaxTracker = 0;

function processInputLine(inputLine) {
    const numericIdentifier = +inputLine;
    if (numericIdentifier) {
        let existingValue = dataStorage[numericIdentifier];
        let calculatedNewValue;

        if (existingValue == NaN) {
            calculatedNewValue = 1;
        } else {
            let tempForIncrement = existingValue;
            tempForIncrement++;
            calculatedNewValue = tempForIncrement;
        }
        dataStorage[numericIdentifier] = calculatedNewValue;

        currentMaxTracker = (function(currentMaximum, candidateValue) {
            return candidateValue > currentMaximum ? candidateValue : currentMaximum;
        })(currentMaxTracker, dataStorage[numericIdentifier]);
    }
}

const inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputLines = inputContent.split('\n');

inputLines.forEach(processInputLine);

function outputMatchingIndices(dataArray, targetValue) {
    dataArray.forEach(function(elementValue, elementIndex) {
        if (elementValue == targetValue) {
            console.log(elementIndex);
        }
    });
}

outputMatchingIndices(dataStorage, currentMaxTracker);
