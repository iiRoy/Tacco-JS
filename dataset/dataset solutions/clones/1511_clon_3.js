function processInput(rawData) {
    const cleanedInput = rawData.trim();
    const targetNumber = parseInt(cleanedInput, 10);

    let totalPairsCount = 0;
    const iterationLimit = targetNumber;

    for (let currentC = 1; currentC < iterationLimit; currentC++) {
       const differenceValue = targetNumber - currentC;
       const divisorsForDifference = getDivisorCount(differenceValue);
       totalPairsCount += divisorsForDifference;
    }

    console.log(totalPairsCount);
}

function getDivisorCount(valueToFactor) {
    if (valueToFactor <= 0) {
        return 0;
    }

    let currentDivisorCount = 0;
    const searchLimit = Math.floor(Math.sqrt(valueToFactor));

    for (let factorCandidate = 1; factorCandidate <= searchLimit; factorCandidate++) {
        if (valueToFactor % factorCandidate === 0) {
            if (factorCandidate * factorCandidate === valueToFactor) {
                currentDivisorCount += 1;
            } else {
                currentDivisorCount += 2;
            }
        }
    }
    return currentDivisorCount;
}
 
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
