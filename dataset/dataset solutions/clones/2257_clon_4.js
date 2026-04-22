function processRawData(rawData) {
    const lines = rawData.split('\n');
    const parameters = lines[0].split(' ').map(Number);
    const valueSequence = lines[1].split(' ').map(Number);

    const parameterA = parameters[0];
    const parameterB = parameters[1];

    const sortedSequence = valueSequence.sort((first, second) => second - first);

    return { parameterA, parameterB, sortedSequence };
}

function determineCombinations(totalElements, chosenElements) {
    if (chosenElements < 0 || chosenElements > totalElements) {
        return 0;
    }
    if (chosenElements === 0 || chosenElements === totalElements) {
        return 1;
    }
    if (chosenElements > totalElements / 2) {
        chosenElements = totalElements - chosenElements;
    }

    let currentResult = 1;
    for (let current = 0; current < chosenElements; current++) {
        currentResult = currentResult * (totalElements - current) / (current + 1);
    }
    return currentResult;
}

function computeOverallDifference(inputPayload) {
    const primeModulus = 1000000007;

    const { parameterA, parameterB, sortedSequence } = processRawData(inputPayload);

    let largestComponentSum = 0;
    let smallestComponentSum = 0;

    const largestComponentIndices = Array.from({ length: sortedSequence.length - parameterB + 1 }, (_, idx) => idx);
    largestComponentSum = largestComponentIndices.reduce((accumulator, currentIdx) => {
        const itemValue = sortedSequence[currentIdx];
        const combinationTerm = determineCombinations(parameterA - currentIdx - 1, parameterB - 1);
        return accumulator + itemValue * combinationTerm;
    }, 0);

    const smallestComponentIndices = Array.from({ length: sortedSequence.length - (parameterB - 1) }, (_, idx) => idx + (parameterB - 1));
    smallestComponentSum = smallestComponentIndices.reduce((accumulator, currentIdx) => {
        const itemValue = sortedSequence[currentIdx];
        const combinationTerm = determineCombinations(currentIdx, parameterB - 1);
        return accumulator + itemValue * combinationTerm;
    }, 0);

    let finalCalculation = largestComponentSum - smallestComponentSum;
    finalCalculation = (finalCalculation % primeModulus + primeModulus) % primeModulus;

    console.log(finalCalculation);
}

(function initiateComputation() {
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    computeOverallDifference(rawInputData);
})();