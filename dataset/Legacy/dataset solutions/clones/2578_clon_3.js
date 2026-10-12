function processInput(rawData) {
    const RADIX_BASE = 10;

    var numElements = parseInt(rawData[0], RADIX_BASE);

    var rawValueStrings = rawData.slice(1);
    var valuesArray = rawValueStrings.map(valStr => parseInt(valStr, RADIX_BASE));

    var totalSum = valuesArray[0];

    for (var currentIdx = 1; currentIdx < numElements - 1; currentIdx++) {
        let previousElementValue = valuesArray[currentIdx - 1];
        let currentElementValue = valuesArray[currentIdx];
        totalSum += Math.min(previousElementValue, currentElementValue);
    }

    if (numElements > 1) {
        let valueBeforeLast = valuesArray[numElements - 2];
        totalSum += valueBeforeLast;
    }

    console.log(totalSum);
}

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const encodingType = "utf8";
const inputSeparatorRegex = /\n|\s/;

processInput(fileSystemModule.readFileSync(standardInputPath, encodingType).trim().split(inputSeparatorRegex));
