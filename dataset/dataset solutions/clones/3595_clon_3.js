const determineCentralNumericValue = (dataSequence) => {
    if (!Array.isArray(dataSequence) || dataSequence.length === 0) {
        return null;
    }

    const validNumericElements = dataSequence
        .map(element => parseFloat(element))
        .filter(num => Number.isFinite(num));

    if (validNumericElements.length === 0) {
        return null;
    }

    const sortedNumbersCollection = [...validNumericElements].sort((valA, valB) => valA - valB);

    const midPointIndex = Math.floor(sortedNumbersCollection.length / 2);

    return sortedNumbersCollection[midPointIndex];
};

function ProcessInputData(rawInputDataString) {
    const parsedInputLines = rawInputDataString.trim().split('\n');

    if (parsedInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two.");
        return;
    }

    const totalElementCount = parseInt(parsedInputLines[0], 10);

    if (isNaN(totalElementCount) || totalElementCount <= 0) {
        console.error("Error: Invalid or non-positive element count specified.");
        return;
    }

    const initialNumericValues = parsedInputLines[1]
                                    .split(' ')
                                    .filter(Boolean)
                                    .map(val => Number(val));

    if (initialNumericValues.length !== totalElementCount) {
        console.warn(`Warning: Declared element count (${totalElementCount}) does not match actual parsed values (${initialNumericValues.length}). Proceeding with parsed values.`);
    }

    const collectedSubarrayMedians = [];

    for (let startIdx = 0; startIdx < totalElementCount; startIdx++) {
        for (let endIdx = startIdx + 1; endIdx <= totalElementCount; endIdx++) {
            const currentSubarray = initialNumericValues.slice(startIdx, endIdx);

            const currentMedianResult = determineCentralNumericValue(currentSubarray);

            if (currentMedianResult !== null && currentMedianResult !== undefined) {
                collectedSubarrayMedians.push(currentMedianResult);
            }
        }
    }

    let finalOverallMedian = null;
    if (collectedSubarrayMedians.length > 0) {
        finalOverallMedian = determineCentralNumericValue(collectedSubarrayMedians);
    } else {
        console.warn("No subarray medians were collected to compute a final overall median.");
    }

    console.log(finalOverallMedian);
}

const obtainStandardInputContent = () => {
    try {
        const fileSystem = require("fs");
        const inputPath = "/dev/stdin";
        return fileSystem.readFileSync(inputPath, "utf8");
    } catch (ioError) {
        console.error(`Failed to read from standard input: ${ioError.message}`);
        return "";
    }
};

ProcessInputData(obtainStandardInputContent());