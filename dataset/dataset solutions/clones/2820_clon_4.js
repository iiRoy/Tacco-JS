const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

let processedContent = "";
let initialPointer = 0;
let finalPointer = sourceData.length - 1;

while (initialPointer <= finalPointer && sourceData[initialPointer] === ' ') {
    initialPointer++;
}
while (finalPointer >= initialPointer && sourceData[finalPointer] === ' ') {
    finalPointer--;
}

if (initialPointer <= finalPointer) {
    processedContent = sourceData.substring(initialPointer, finalPointer + 1);
} else {
    processedContent = "";
}

let valueContainerA = "";
let valueContainerB = "";
let separatorEncountered = false;
let currentSegment = 0;

for (let iterator = 0; iterator < processedContent.length; ++iterator) {
    const characterUnit = processedContent[iterator];
    if (characterUnit === ' ') {
        if (!separatorEncountered) {
            separatorEncountered = true;
            currentSegment = 1;
        }
    } else {
        if (currentSegment === 0) {
            valueContainerA += characterUnit;
        } else {
            valueContainerB += characterUnit;
        }
    }
}

let numericValueAlpha = 0;
let numericValueBeta = 0;

if (valueContainerA.length > 0) {
    numericValueAlpha = Number(valueContainerA);
} else {
    numericValueAlpha = NaN;
}

if (valueContainerB.length > 0) {
    numericValueBeta = Number(valueContainerB);
} else {
    numericValueBeta = NaN;
}

let finalOutcome;
const numericalDifference = numericValueAlpha - numericValueBeta;

if (isNaN(numericalDifference)) {
    finalOutcome = 0;
} else {
    const comparisonIndicator = Math.sign(numericalDifference);
    const resultMapping = [0, 10, 10];
    finalOutcome = resultMapping[comparisonIndicator + 1];
}

console.log(finalOutcome);