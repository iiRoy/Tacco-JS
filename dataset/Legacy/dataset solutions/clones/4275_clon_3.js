function parseNumericInput(inputString) {
    const inputLines = inputString.split("\n");
    const parsedNumbers = inputLines.map(lineContent => Number(lineContent));
    return parsedNumbers;
}

function calculateTransformedValue(initialInputData) {
    let currentAccumulatedValue = 1;
    const numberOfIterations = initialInputData[0];
    const comparisonThreshold = initialInputData[1];

    for (let iterationCounter = 0; iterationCounter < numberOfIterations; iterationCounter++) {
        let nextPotentialValue;
        if (currentAccumulatedValue >= comparisonThreshold) {
            nextPotentialValue = currentAccumulatedValue + comparisonThreshold;
        } else {
            nextPotentialValue = currentAccumulatedValue * 2;
        }
        currentAccumulatedValue = nextPotentialValue;
    }

    console.log(currentAccumulatedValue);
}

const fileSystemUtility = require("fs");
const standardInputFile = "/dev/stdin";
const rawInputContentString = fileSystemUtility.readFileSync(standardInputFile, "utf8").trim();

const processedNumericData = parseNumericInput(rawInputContentString);
calculateTransformedValue(processedNumericData);
