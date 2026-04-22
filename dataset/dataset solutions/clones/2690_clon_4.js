function processor(sourceText) {
    const lines = sourceText.split("\n");
    const firstLineData = lines[0].split(" ").map(Number);
    const limitValue = firstLineData[1];
    const numericSequence = lines[1].split(" ").map(Number);

    function determineMaximum(sequence) {
        return Math.max(...sequence);
    }

    function calculateEquilibriumPoint(sequence) {
        const orderedSequence = [...sequence].sort(); // Replicates original lexicographical sort
        let rightPointer = orderedSequence.length - 1;
        let accumulatedRight = orderedSequence[rightPointer];
        let accumulatedLeft = 0;

        function findBalance(currentLeftIndex, currentRightIndex, leftSum, rightSum) {
            if (currentLeftIndex >= currentRightIndex) {
                return Math.min(leftSum, rightSum);
            }

            const nextLeftSum = leftSum + currentLeftIndex;

            if (nextLeftSum <= rightSum) {
                return findBalance(currentLeftIndex + 1, currentRightIndex, nextLeftSum, rightSum);
            } else {
                let newRightIndex = currentRightIndex - 1;
                let tempRightSum = rightSum;
                while (tempRightSum < nextLeftSum && newRightIndex > currentLeftIndex) {
                    tempRightSum += orderedSequence[newRightIndex];
                    newRightIndex--;
                }
                return findBalance(currentLeftIndex + 1, newRightIndex, nextLeftSum, tempRightSum);
            }
        }
        
        return findBalance(0, rightPointer, 0, accumulatedRight);
    }

    function checkFeasibility(divisorCandidate, sequence, maxAllowedSum) {
        const costPairs = [];
        let remainingBudget = 2 * maxAllowedSum;

        for (const element of sequence) {
            const remainderOne = element % divisorCandidate;
            if (remainderOne === 0) continue;

            const remainderTwo = divisorCandidate - remainderOne;

            if (maxAllowedSum < Math.min(remainderOne, remainderTwo)) {
                return false;
            }

            remainingBudget -= Math.min(remainderOne, remainderTwo);
            if (remainingBudget < 0) {
                return false;
            }
            costPairs.push([remainderOne, remainderTwo]);
        }

        function explorePossibilities(pairs, targetSum) {
            let reachableStates = new Set(); // Stores "leftSum,rightSum"
            reachableStates.add("0,0");

            for (const [val1, val2] of pairs) {
                const nextStates = new Set();
                for (const stateString of reachableStates) {
                    const [currentLeft, currentRight] = stateString.split(',').map(Number);

                    // Option 1: Add val1 to leftSum
                    if (currentLeft + val1 <= targetSum) {
                        nextStates.add(`${currentLeft + val1},${currentRight}`);
                    }
                    // Option 2: Add val2 to rightSum
                    if (currentRight + val2 <= targetSum) {
                        nextStates.add(`${currentLeft},${currentRight + val2}`);
                    }
                }
                reachableStates = nextStates;
            }

            for (const stateString of reachableStates) {
                const [finalLeft, finalRight] = stateString.split(',').map(Number);
                if (finalLeft === finalRight) {
                    return true;
                }
            }
            return false;
        }

        return explorePossibilities(costPairs, maxAllowedSum);
    }

    const peakElement = determineMaximum(numericSequence);
    const equilibriumBound = calculateEquilibriumPoint(numericSequence);
    const upperBound = Math.min(peakElement + limitValue, equilibriumBound);

    function findAppropriateDivisor(currentCandidate) {
        if (currentCandidate <= 1) {
            return 1;
        }
        if (checkFeasibility(currentCandidate, numericSequence, limitValue)) {
            return currentCandidate;
        }
        return findAppropriateDivisor(currentCandidate - 1);
    }

    const result = findAppropriateDivisor(upperBound);
    console.log(result);
}

processor(require('fs').readFileSync('/dev/stdin', 'utf8'));