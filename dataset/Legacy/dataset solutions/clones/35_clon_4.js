const LOWER_BOUND_DIGIT = 0;
const UPPER_BOUND_DIGIT = 9;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on("data", function(inputSegment) {
    const targetSumValues = String(inputSegment)
        .trim()
        .split('\n')
        .filter(Boolean)
        .map(lineContent => parseInt(lineContent[0]));

    targetSumValues.forEach(currentGoalSum => {
        let combinationTally = 0;

        const findDigitCombinations = (digitsCollected, currentDepthLevel, accumulatedSum) => {
            if (currentDepthLevel === 4) {
                if (accumulatedSum === currentGoalSum) {
                    combinationTally++;
                    console.log(digitsCollected, accumulatedSum, currentGoalSum);
                }
                return;
            }

            for (let nextPossibleDigit = LOWER_BOUND_DIGIT; nextPossibleDigit <= UPPER_BOUND_DIGIT; nextPossibleDigit++) {
                findDigitCombinations(
                    [...digitsCollected, nextPossibleDigit],
                    currentDepthLevel + 1,
                    accumulatedSum + nextPossibleDigit
                );
            }
        };

        findDigitCombinations([], 0, 0);

        console.log(combinationTally);
    });
});
