const evaluateStream = (inputFeed) => {
    const finalTally = inputFeed.split('').reduce((accumulatedCounts, currentUnit) => {
        if (currentUnit === 'S') {
            accumulatedCounts.plusOne++;
        } else if (currentUnit === 'T') {
            if (accumulatedCounts.plusOne > 0) {
                accumulatedCounts.plusOne--;
            } else {
                accumulatedCounts.minusOne++;
            }
        }
        return accumulatedCounts;
    }, { plusOne: 0, minusOne: 0 });

    return finalTally.plusOne + finalTally.minusOne;
};

const initiateProcessing = (rawContent) => {
    const finalOutcome = evaluateStream(rawContent);
    console.log(finalOutcome);
};

initiateProcessing(require('fs').readFileSync('/dev/stdin', 'utf8'));