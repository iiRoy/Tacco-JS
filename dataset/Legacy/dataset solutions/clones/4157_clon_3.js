function processArrayForFrequencies(inputArray) {
    let distinctElements = [];
    let elementFrequencies = [];
    let lastElementEncountered;

    inputArray.sort(); // Preserving original sort behavior (lexicographical for numbers)

    for (let i = 0; i < inputArray.length; i++) {
        const currentElement = inputArray[i];

        if (currentElement !== lastElementEncountered) {
            distinctElements.push(currentElement);
            elementFrequencies.push(1);
        } else {
            const lastFrequencyIndex = elementFrequencies.length - 1;
            elementFrequencies[lastFrequencyIndex]++;
        }
        lastElementEncountered = currentElement;
    }

    return [distinctElements, elementFrequencies];
}

function ProcessInputAndCalculate(rawInputString) {
    let inputLines = rawInputString.split("\n");

    let inputSizeValue = parseInt(inputLines[0], 10);

    let stringNumberTokens = inputLines[1].split(" ");
    let parsedNumbersArray = [];

    for (let k = 0; k < stringNumberTokens.length; k++) {
        const currentToken = stringNumberTokens[k];
        parsedNumbersArray.push(parseInt(currentToken, 10));
    }

    let frequencyAnalysisResult = processArrayForFrequencies(parsedNumbersArray);

    let totalAdjustmentsNeeded = 0;

    let uniqueValues = frequencyAnalysisResult[0];
    let valueCounts = frequencyAnalysisResult[1];

    for (let j = 0; j < uniqueValues.length; j++) {
        const currentUniqueValue = uniqueValues[j];
        const currentOccurrences = valueCounts[j];

        const difference = currentUniqueValue - currentOccurrences;

        if (difference !== 0) {
            if (difference < 0) {
                totalAdjustmentsNeeded += currentOccurrences - currentUniqueValue;
            } else {
                totalAdjustmentsNeeded += currentOccurrences;
            }
        }
    }

    console.log(totalAdjustmentsNeeded);
}

ProcessInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
