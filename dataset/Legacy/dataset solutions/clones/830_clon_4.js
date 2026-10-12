const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

function* provideInputLines(sourceString) {
    const lines = sourceString.trim().split("\n");
    let currentLinePointer = 0;
    while (currentLinePointer < lines.length) {
        yield lines[currentLinePointer++];
    }
}

const determineNextStateCosts = (priorStateCosts, currentNElement, mDeltas) => {
    const subsequentStateCosts = Array(256).fill(Infinity);

    priorStateCosts.forEach((costFromPrior, priorStateIndex) => {
        if (costFromPrior === Infinity) {
            return;
        }

        mDeltas.forEach(mChange => {
            const potentialNextState = priorStateIndex + mChange;
            const constrainedNextState = Math.max(0, Math.min(255, potentialNextState));
            const incrementalCost = costFromPrior + Math.pow(currentNElement - constrainedNextState, 2);

            subsequentStateCosts[constrainedNextState] = Math.min(subsequentStateCosts[constrainedNextState], incrementalCost);
        });
    });
    return subsequentStateCosts;
};

const lineIterator = provideInputLines(sourceData);

while (true) {
    const dimensionsLine = lineIterator.next().value;
    const [countNStr, countMStr] = dimensionsLine.split(" ");
    const countN = parseInt(countNStr, 10);
    const countM = parseInt(countMStr, 10);

    if (countN === 0 && countM === 0) {
        break;
    }

    const mValues = Array.from({ length: countM }, () => parseInt(lineIterator.next().value, 10));

    const nValues = Array.from({ length: countN }, () => parseInt(lineIterator.next().value, 10));

    const initialCostRow = Array(256).fill(Infinity);
    initialCostRow[128] = 0;

    const allCalculatedCostRows = nValues.reduce((accumulatorCostRows, currentNValue) => {
        const previousRow = accumulatorCostRows[accumulatorCostRows.length - 1];
        const nextRow = determineNextStateCosts(previousRow, currentNValue, mValues);
        accumulatorCostRows.push(nextRow);
        return accumulatorCostRows;
    }, [initialCostRow]);

    const finalCostRow = allCalculatedCostRows[countN];

    const overallMinimumResult = Math.min(...finalCostRow);

    console.log(overallMinimumResult);
}
