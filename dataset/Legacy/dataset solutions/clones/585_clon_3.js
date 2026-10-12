let minimumLength = Infinity;

function reduceString(inputStr) {
    const removalPattern = /(1{4,}|2{4,}|3{4,})/g;
    let currentProcessedString = inputStr;
    let previousLength;

    do {
        previousLength = currentProcessedString.length;
        currentProcessedString = currentProcessedString.replace(removalPattern, "");
    } while (currentProcessedString.length !== previousLength);

    minimumLength = Math.min(minimumLength, currentProcessedString.length);
}

function extractNumericArray(sourceLines, count) {
    const numericValues = [];
    for (let i = 0; i < count; i++) {
        const value = parseInt(sourceLines.shift(), 10);
        numericValues.push(value);
    }
    return numericValues;
}

function generateAndProcessPermutations(baseArray, arraySize) {
    for (let currentIdx = 0; currentIdx < arraySize; currentIdx++) {
        const arrayVariantA = [...baseArray];
        const arrayVariantB = [...baseArray];

        if (currentIdx < arraySize - 1) {
            arrayVariantA[currentIdx] = arrayVariantA[currentIdx + 1];
        }

        if (currentIdx > 0) {
            arrayVariantB[currentIdx] = arrayVariantB[currentIdx - 1];
        }

        reduceString(arrayVariantA.join(""));
        reduceString(arrayVariantB.join(""));
    }
}

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputDataLines = rawInputData.trim().split("\n");

while (true) {
    const numberOfElements = parseInt(inputDataLines.shift(), 10);

    if (numberOfElements === 0) {
        break;
    }

    minimumLength = Infinity;

    const initialNumericArray = extractNumericArray(inputDataLines, numberOfElements);

    generateAndProcessPermutations(initialNumericArray, numberOfElements);

    console.log(minimumLength);
}
