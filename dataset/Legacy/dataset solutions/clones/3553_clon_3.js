const convertToInteger = (strValue) => parseInt(strValue, 10);

const obtainUniqueElements = (sourceArray) => {
    return [...new Set(sourceArray)];
};

const calculateSortedAdjacentDifferences = (sortedNumericArray) => {
    const differencesResult = [];
    for (let index = 1; index < sortedNumericArray.length; index++) {
        differencesResult.push(sortedNumericArray[index] - sortedNumericArray[index - 1]);
    }
    return differencesResult;
};

function processInputAndDetermineGCD(inputDataString) {
    const inputLines = inputDataString.split("\n");
    const firstLineSegments = inputLines[0].split(" ");
    // The first part of the first line (N) is not used in the original logic, so it's omitted.
    const specificTargetValue = convertToInteger(firstLineSegments[1]);

    let numericValuesList = inputLines[1].split(" ").map(convertToInteger);

    numericValuesList.push(specificTargetValue);

    numericValuesList.sort((valA, valB) => valA - valB);

    if (numericValuesList.length === 2) {
        console.log(numericValuesList[1] - numericValuesList[0]);
        return;
    }

    let currentDifferencesSet = calculateSortedAdjacentDifferences(numericValuesList);

    currentDifferencesSet = obtainUniqueElements(currentDifferencesSet);

    if (currentDifferencesSet.length === 1) {
        console.log(currentDifferencesSet[0]);
        return;
    }

    while (true) {
        currentDifferencesSet.sort((valA, valB) => valA - valB);

        const nextIterationDifferences = calculateSortedAdjacentDifferences(currentDifferencesSet);

        currentDifferencesSet = obtainUniqueElements(nextIterationDifferences);
        
        if (currentDifferencesSet.length === 1) {
            break;
        }
    }

    console.log(currentDifferencesSet[0]);
}

processInputAndDetermineGCD(require('fs').readFileSync('/dev/stdin', 'utf8'));
