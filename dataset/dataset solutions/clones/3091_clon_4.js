const MOD_CONSTANT = 1000000007;

function acquireInputData(sourceInput) {
    let tokenArray = sourceInput.trim().split(/\s+/).map(Number);
    let currentPosition = 0;

    return {
        retrieveNext: () => {
            if (currentPosition >= tokenArray.length) {
                return undefined;
            }
            return tokenArray[currentPosition++];
        }
    };
}

function calculateResult(primaryInput) {
    const inputReader = acquireInputData(primaryInput);

    const numberCount = inputReader.retrieveNext();
    const initialValue = inputReader.retrieveNext();

    const valueSet = [];
    for (let iteration = 0; iteration < numberCount; iteration++) {
        valueSet.push(inputReader.retrieveNext());
    }

    valueSet.sort((valA, valB) => valA - valB);

    const factorialCache = new Array(numberCount + 1);
    factorialCache[0] = 1;
    for (let idx = 1; idx <= numberCount; idx++) {
        factorialCache[idx] = (factorialCache[idx - 1] * idx) % MOD_CONSTANT;
    }

    if (valueSet[0] === 1) {
        console.log(0);
    } else {
        console.log(solveRecursive(initialValue, numberCount, valueSet, factorialCache));
    }
}

function solveRecursive(currentFocusValue, remainingItems, sortedReferenceSet, precomputedFactorials) {
    if (currentFocusValue < sortedReferenceSet[0]) {
        return (currentFocusValue * precomputedFactorials[remainingItems]) % MOD_CONSTANT;
    }

    let runningSum = 0;
    let upperBoundary = 0;
    
    let foundIndex = sortedReferenceSet.findIndex(element => element >= currentFocusValue);
    if (foundIndex === -1) {
        upperBoundary = sortedReferenceSet.length;
    } else {
        upperBoundary = foundIndex;
    }

    for (let itemIndex = 0; itemIndex < upperBoundary; itemIndex++) {
        runningSum = (runningSum + solveRecursive(currentFocusValue % sortedReferenceSet[itemIndex], remainingItems - 1, sortedReferenceSet, precomputedFactorials)) % MOD_CONSTANT;
    }

    return runningSum;
}

calculateResult(require("node:fs").readFileSync(0, "utf8"));