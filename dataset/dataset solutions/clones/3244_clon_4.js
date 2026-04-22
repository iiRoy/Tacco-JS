const performCalculation = (dataInput) => {
    const inputLines = dataInput.split('\n');
    const pairCount = parseInt(inputLines[0], 10);

    const initialPairs = inputLines.slice(1, pairCount + 1).map(entry => {
        const parts = entry.split(' ');
        return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
    });

    const firstCollection = initialPairs.map(pair => pair[0]);
    const secondCollection = initialPairs.map(pair => pair[1]);

    // Initial sum is undefined to match the original's behavior of `var o;`
    const finalResult = evaluateSequence(pairCount, pairCount, firstCollection, secondCollection, undefined);

    console.log(finalResult);
};

const determineBestIndex = (primaryCollection, secondaryCollection) => {
    // Replicates the original 'add' function's behavior for an empty array
    if (primaryCollection.length === 0) {
        return 0;
    }

    const peakValue = Math.max(...primaryCollection);
    let selectedPosition = 0; // Corresponds to 'chA' in the original code

    // The original loop condition `chA != k` effectively skips the `k=0` iteration for updating `chA`.
    // Thus, our loop for updates starts from the second element (index 1).
    for (let currentPos = 1; currentPos < primaryCollection.length; currentPos++) {
        // Condition from original: maxA == a[k] && chA != k && b[chA] <= b[k]
        // Our translation: peakValue === primaryCollection[currentPos] && (currentPos !== selectedPosition is implicit by loop start) && secondaryCollection[selectedPosition] <= secondaryCollection[currentPos]
        if (primaryCollection[currentPos] === peakValue && secondaryCollection[selectedPosition] <= secondaryCollection[currentPos]) {
            selectedPosition = currentPos;
        }
    }
    return selectedPosition;
};

const evaluateSequence = (originalLength, remainingCycles, currentPrimary, currentSecondary, currentSum) => {
    // Base case for recursion: no more cycles left
    if (remainingCycles === 0) {
        return currentSum;
    }

    const cycleNumber = originalLength - remainingCycles; // 0-indexed iteration number
    let chosenLocation;
    let valueApplied;

    if (cycleNumber % 2 === 0) { // Even cycle number (0, 2, 4...)
        chosenLocation = determineBestIndex(currentPrimary, currentSecondary);
        valueApplied = currentPrimary[chosenLocation];
        // Replicates original behavior: undefined + number results in NaN
        currentSum += valueApplied;
    } else { // Odd cycle number (1, 3, 5...)
        chosenLocation = determineBestIndex(currentSecondary, currentPrimary);
        valueApplied = currentSecondary[chosenLocation];
        // Replicates original behavior: undefined - number results in NaN
        currentSum -= valueApplied;
    }

    // Create new arrays by filtering out the chosen element,
    // functionally equivalent to 'splice' but using a different approach.
    const nextPrimary = currentPrimary.filter((_, idx) => idx !== chosenLocation);
    const nextSecondary = currentSecondary.filter((_, idx) => idx !== chosenLocation);

    // Recursive call for the next cycle
    return evaluateSequence(originalLength, remainingCycles - 1, nextPrimary, nextSecondary, currentSum);
};

performCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));