const fileSystemModuleReference = require('fs');

const STANDARD_INPUT_PATH = '/dev/stdin';
const RESULT_SCALING_FACTOR = 100.0;

let rawInputContent;

try {
    rawInputContent = fileSystemModuleReference.readFileSync(STANDARD_INPUT_PATH, 'utf8');
} catch (fileReadError) {
    console.error("ERROR: Failed to read input from standard path. Details:", fileReadError.message);
    process.exit(1);
}

if (!rawInputContent || rawInputContent.trim().length === 0) {
    console.error("ERROR: The input stream provided no valid data or was empty.");
    process.exit(1);
}

const trimmedInputString = rawInputContent.trim();
const inputDataLines = trimmedInputString.split("\n");

const configurationLineString = inputDataLines.shift();

if (!configurationLineString) {
    console.error("ERROR: The configuration line was missing from the input data.");
    process.exit(1);
}

const configTokens = configurationLineString.split(" ");

if (configTokens.length < 3) {
    console.error(`ERROR: Expected 3 configuration parameters, but found ${configTokens.length}.`);
    process.exit(1);
}

const initialNValue = parseInt(configTokens[0], 10);
const totalMCount = parseInt(configTokens[1], 10);
const centralPValue = parseInt(configTokens[2], 10);

const adjustedNBoundary = initialNValue - 1;
const referencePPoint = centralPValue;

const processedNumericValues = [];

for (let dataLineIndex = 0; dataLineIndex < totalMCount; dataLineIndex++) {
    const currentDataLine = inputDataLines.shift();

    if (currentDataLine === undefined || currentDataLine === null) {
        console.warn(`WARNING: Input data exhausted before reading ${totalMCount} items. Processed ${dataLineIndex} items.`);
        break;
    }

    const currentNumericDatum = parseInt(currentDataLine, 10);

    if (isNaN(currentNumericDatum)) {
        console.warn(`WARNING: Skipping non-numeric input "${currentDataLine}" at index ${dataLineIndex}.`);
        continue;
    }

    if (currentNumericDatum !== referencePPoint) {
        processedNumericValues.push(currentNumericDatum);
    }
}

processedNumericValues.push(referencePPoint);

processedNumericValues.sort(function(valueA, valueB) {
    return valueA - valueB;
});

let minimumCalculatedCost = Number.POSITIVE_INFINITY;

const selectMinimum = (valOne, valTwo) => {
    return Math.min(valOne, valTwo);
};

processedNumericValues.forEach(function(currentValueInCollection, currentIndex) {

    if (currentValueInCollection <= referencePPoint) {
        if (currentIndex > 0) {
            const previousValue = processedNumericValues[currentIndex - 1];

            const distanceFactor = (referencePPoint - currentValueInCollection) * 2;
            const boundaryAdjustment = (adjustedNBoundary - referencePPoint + 1);
            const candidateCost1 = distanceFactor + boundaryAdjustment + previousValue;

            minimumCalculatedCost = selectMinimum(minimumCalculatedCost, candidateCost1);
        }
    }

    if (currentValueInCollection >= referencePPoint) {
        if (currentIndex < processedNumericValues.length - 1) {
            const nextValue = processedNumericValues[currentIndex + 1];

            const reverseDistanceFactor = (currentValueInCollection - referencePPoint) * 2;
            const fixedOffset = referencePPoint;
            const nextBoundaryAdjustment = (adjustedNBoundary - nextValue + 1);
            const candidateCost2 = reverseDistanceFactor + fixedOffset + nextBoundaryAdjustment;

            minimumCalculatedCost = selectMinimum(minimumCalculatedCost, candidateCost2);
        }
    }
});

console.log(minimumCalculatedCost * RESULT_SCALING_FACTOR);