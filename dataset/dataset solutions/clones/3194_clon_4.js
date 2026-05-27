'use strict'

function processInput(rawText) {
    let parsedNumbers = rawText.split(/\s+/).map(Number);

    const targetSum = parsedNumbers.shift();
    const availableDigitCount = parsedNumbers.shift();
    const inputDigits = parsedNumbers;

    const digitCosts = [false, 2, 5, 5, 4, 5, 6, 3, 7, 6];

    const costToMaxDigit = new Map();
    for (let k = 0; k < availableDigitCount; k++) {
        const currentDigit = inputDigits[k];
        const currentCost = digitCosts[currentDigit];
        if (!costToMaxDigit.has(currentCost) || currentDigit > costToMaxDigit.get(currentCost)) {
            costToMaxDigit.set(currentCost, currentDigit);
        }
    }

    function getCanonicalStringArray(digitCountsMap) {
        const result = Array(10).fill('');
        for (let d = 1; d <= 9; d++) {
            const count = digitCountsMap.get(d) || 0;
            if (count > 0) {
                result[d] = String(d).repeat(count);
            }
        }
        return result;
    }

    function compareSolutions(currentBest, potentialSolution) {
        if (!currentBest || !currentBest.reachable) {
            return potentialSolution;
        }

        const currentBestStrings = getCanonicalStringArray(currentBest.digitCounts);
        const potentialSolutionStrings = getCanonicalStringArray(potentialSolution.digitCounts);

        const currentBestJoinedLength = currentBestStrings.join().length;
        const potentialSolutionJoinedLength = potentialSolutionStrings.join().length;

        if (potentialSolutionJoinedLength > currentBestJoinedLength) {
            return potentialSolution;
        }
        if (potentialSolutionJoinedLength < currentBestJoinedLength) {
            return currentBest;
        }

        for (let d = 9; d >= 1; d--) {
            const currentCountStr = currentBestStrings[d];
            const potentialCountStr = potentialSolutionStrings[d];

            if (potentialCountStr.length > currentCountStr.length) {
                return potentialSolution;
            }
            if (potentialCountStr.length < currentCountStr.length) {
                return currentBest;
            }
        }

        return currentBest;
    }

    const memoizedSolutions = Array(targetSum + 1).fill(null);
    memoizedSolutions[0] = { reachable: true, digitCounts: new Map() };

    for (let currentSum = 1; currentSum <= targetSum; currentSum++) {
        for (let currentCost = 1; currentCost <= 9; currentCost++) {
            if (currentSum - currentCost >= 0) {
                const previousState = memoizedSolutions[currentSum - currentCost];
                if (previousState && previousState.reachable && costToMaxDigit.has(currentCost)) {
                    const actualDigit = costToMaxDigit.get(currentCost);

                    const potentialSolution = {
                        reachable: true,
                        digitCounts: new Map(previousState.digitCounts)
                    };
                    potentialSolution.digitCounts.set(actualDigit, (potentialSolution.digitCounts.get(actualDigit) || 0) + 1);

                    memoizedSolutions[currentSum] = compareSolutions(memoizedSolutions[currentSum], potentialSolution);
                }
            }
        }
    }

    let resultString = '';
    const finalSolution = memoizedSolutions[targetSum];

    if (finalSolution && finalSolution.reachable) {
        const finalCounts = finalSolution.digitCounts;
        for (let d = 9; d >= 1; d--) {
            const count = finalCounts.get(d) || 0;
            if (count > 0) {
                resultString += String(d).repeat(count);
            }
        }
    }

    console.log(resultString);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
