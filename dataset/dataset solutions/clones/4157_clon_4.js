function processValues(collection) {
    const elementFrequenciesMap = new Map();
    for (const item of collection) {
        elementFrequenciesMap.set(item, (elementFrequenciesMap.get(item) || 0) + 1);
    }

    const uniqueSortedElements = Array.from(elementFrequenciesMap.keys()).sort((val1, val2) => val1 - val2);

    const valuesArray = [];
    const countsArray = [];

    for (const elementKey of uniqueSortedElements) {
        valuesArray.push(elementKey);
        countsArray.push(elementFrequenciesMap.get(elementKey));
    }

    return [valuesArray, countsArray];
}

function executeProgram(programInput) {
    const inputLines = programInput.split("\n");

    // The first line (initialValueCount) is not used in the original logic.
    // const initialValueCount = parseInt(inputLines[0], 10);

    const numericalData = inputLines[1].split(" ").map(Number);

    const processedStatisticals = processValues(numericalData);

    const distinctNumericalValues = processedStatisticals[0];
    const correspondingCounts = processedStatisticals[1];

    let finalAccumulation = distinctNumericalValues.reduce((currentTotal, uniqueEntity, index) => {
        const entityOccurrenceCount = correspondingCounts[index];

        if (uniqueEntity < entityOccurrenceCount) {
            return currentTotal + (entityOccurrenceCount - uniqueEntity);
        } else if (uniqueEntity > entityOccurrenceCount) {
            return currentTotal + entityOccurrenceCount;
        }
        // If uniqueEntity === entityOccurrenceCount, no change to currentTotal
        return currentTotal;
    }, 0);

    console.log(finalAccumulation);
}

executeProgram(require("fs").readFileSync("/dev/stdin", "utf8"));