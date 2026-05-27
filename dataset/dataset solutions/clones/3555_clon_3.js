function processInput(rawData) {
    const inputLines = rawData.split('\n');
    
    const firstLineComponents = inputLines[0].split(' ').map(Number);
    // The first component (N) is not used in the original logic, so we don't need a specific variable for it.
    const targetValue = firstLineComponents[1];

    const numberStrings = inputLines[1].split(' ');
    const parsedNumbers = numberStrings.map(Number);
    
    const absoluteDifferences = parsedNumbers.map(currentNumber => {
        return Math.abs(targetValue - currentNumber);
    });

    console.log(computeArrayGCD(absoluteDifferences));
}

function computeArrayGCD(numericArray) {
    // The original code would implicitly error if numericArray is empty (e.g., accessing numericArray[0]).
    // Using reduce without an initial value on an empty array also throws a TypeError,
    // thus preserving the observable error behavior for empty inputs.
    if (numericArray.length === 0) {
        // Depending on problem constraints, an empty array might not occur.
        // If it did, the original would fail. This reduce will also fail.
        // For a robust solution, one might return 0 or throw a specific error.
        // Sticking to original behavior, let reduce throw.
    }
    
    return numericArray.reduce((accumulatorValue, currentElement) => {
        return findGreatestCommonDivisor(accumulatorValue, currentElement);
    });
}

function findGreatestCommonDivisor(valueOne, valueTwo) {
    let currentValA = valueOne;
    let currentValB = valueTwo;

    // Ensure currentValA is greater than or equal to currentValB for the standard Euclidean algorithm setup.
    // The iterative algorithm works without this explicit swap, but it's a common initial step.
    if (currentValA < currentValB) {
        let temporarySwap = currentValA;
        currentValA = currentValB;
        currentValB = temporarySwap;
    }

    while (currentValB !== 0) {
        let remainderResult = currentValA % currentValB;
        currentValA = currentValB;
        currentValB = remainderResult;
    }
    return currentValA;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
