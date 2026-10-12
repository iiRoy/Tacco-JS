let processInput = (inputString) => {
    let targetValue = parseInt(inputString, 10) || 0;
    const powerValues = [1, 6, 9, 36, 81, 216, 729, 1296, 6561, 7776, 46656, 59049];
    let minimumCount = Number.MAX_SAFE_INTEGER;

    const updateMinimumCount = (currentCount) => {
        if (currentCount < minimumCount) {
            minimumCount = currentCount;
        }
    };

    const solveRecursive = (currentCount, remainingValue, currentPowerIndex) => {
        if (remainingValue <= 0) {
            updateMinimumCount(currentCount);
            return;
        }

        if (currentCount >= minimumCount) {
            return; // Pruning: current path is already worse than or equal to the best found
        }

        let effectiveIndex = currentPowerIndex;
        while (effectiveIndex >= 0 && powerValues[effectiveIndex] > remainingValue) {
            effectiveIndex--;
        }

        if (effectiveIndex < 0) {
            return; // No valid power can be subtracted from remainingValue
        }

        // Option 1: Subtract the largest possible power at or below effectiveIndex
        solveRecursive(currentCount + 1, remainingValue - powerValues[effectiveIndex], effectiveIndex);

        // Option 2: Try subtracting the next smaller power, if available
        if (effectiveIndex > 0) {
            solveRecursive(currentCount + 1, remainingValue - powerValues[effectiveIndex - 1], effectiveIndex - 1);
        }
    };

    solveRecursive(0, targetValue, powerValues.length - 1);

    console.log(minimumCount);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
