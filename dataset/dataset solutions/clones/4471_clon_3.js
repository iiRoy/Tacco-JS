function calculateSumOfTopElements(dataCollection, totalCountParameter, elementsToSum) {
    if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
        return 0;
    }

    if (elementsToSum <= 0) {
        return 0;
    }

    const actualArrayLength = dataCollection.length;
    const effectiveElementsToExtract = Math.min(elementsToSum, actualArrayLength);

    if (effectiveElementsToExtract === 0) {
        return 0;
    }

    const startingIndexForSlice = actualArrayLength - effectiveElementsToExtract;
    const relevantElements = dataCollection.slice(startingIndexForSlice);
    const accumulatedValue = relevantElements.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return accumulatedValue;
}

const numericComparator = (valA, valB) => {
    return valA - valB;
};

function parseAndOrderNumerics(inputStrings) {
    if (!Array.isArray(inputStrings) || inputStrings.length === 0) {
        return [];
    }

    const parsedNumbers = inputStrings.map(strVal => {
        const num = parseInt(strVal, 10);
        return num;
    });

    parsedNumbers.sort(numericComparator);

    return parsedNumbers;
}

function processInputAndDisplayResult(rawInputPayload) {
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim().length === 0) {
        return;
    }

    const inputLines = rawInputPayload.split("\n");

    if (inputLines.length < 2) {
        return;
    }

    const configurationLine = inputLines[0];
    const configurationSegments = configurationLine.split(" ");

    if (configurationSegments.length < 3) {
        return;
    }

    const arrayLengthParameter = parseInt(configurationSegments[1], 10);
    const elementsToSumParameter = parseInt(configurationSegments[2], 10);

    if (isNaN(arrayLengthParameter) || arrayLengthParameter < 0 ||
        isNaN(elementsToSumParameter) || elementsToSumParameter < 0) {
        return;
    }

    const dataElementsString = inputLines[1];
    const rawDataStrings = dataElementsString.split(" ");

    if (rawDataStrings.length !== arrayLengthParameter) {
        // Proceeding with available data despite length mismatch.
    }

    const numericallyOrderedData = parseAndOrderNumerics(rawDataStrings);

    const finalCalculatedSum = calculateSumOfTopElements(
        numericallyOrderedData,
        arrayLengthParameter,
        elementsToSumParameter
    );

    console.log(`The aggregated value is: ${finalCalculatedSum}`);
}

const STANDARD_INPUT_PATH = "/dev/stdin";

let fileContent = '';
try {
    const fileSystemModule = require("fs");
    fileContent = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, "utf8");
} catch (readError) {
    return;
}

processInputAndDisplayResult(fileContent);