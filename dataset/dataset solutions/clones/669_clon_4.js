const rawInputText = require('fs').readFileSync('/dev/stdin', 'utf8');

function* problemSetParser(lineSegments) {
    let linePointer = 0;
    while (linePointer < lineSegments.length) {
        const currentCount = Number(lineSegments[linePointer++]);
        if (currentCount === 0) {
            return;
        }
        const problemEntries = [];
        for (let i = 0; i < currentCount; i++) {
            problemEntries.push(lineSegments[linePointer++].split(' ').map(Number));
        }
        yield { entryCount: currentCount, dataPairs: problemEntries };
    }
}

const rawLineSegments = rawInputText.trim().split('\n');
const problemSequence = problemSetParser(rawLineSegments);

for (const currentProblemSet of problemSequence) {
    const dataPairsForProblem = currentProblemSet.dataPairs;

    const initialAggregateValue = dataPairsForProblem.reduce((accumulator, currentPair) => accumulator + currentPair[0], 0);

    const orderedDataPairs = [...dataPairsForProblem].sort((pairOne, pairTwo) => pairTwo[1] - pairOne[1]);

    const validationOutcome = orderedDataPairs.reduce((currentValidationState, currentDataPair) => {
        if (!currentValidationState.isValid) {
            return currentValidationState;
        }

        const [pairValue, pairThreshold] = currentDataPair;

        if (currentValidationState.currentAggregate > pairThreshold) {
            return { isValid: false, currentAggregate: currentValidationState.currentAggregate };
        }

        return { isValid: true, currentAggregate: currentValidationState.currentAggregate - pairValue };
    }, { isValid: true, currentAggregate: initialAggregateValue });

    console.log(validationOutcome.isValid ? "Yes" : "No");
}
