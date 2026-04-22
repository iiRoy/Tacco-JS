const checkFeasibility = (upperLimit, valueSequence, requiredSplits) => {
    if (valueSequence.length === 0) {
        return requiredSplits > 0;
    }

    const anyValueExceedsLimit = valueSequence.reduce((isOver, currentVal) => isOver || (currentVal > upperLimit), false);
    if (anyValueExceedsLimit) {
        return false;
    }

    const processResult = valueSequence.reduce((state, currentEntry) => {
        if (!state.possible) return state;

        if (state.currentAccumulation + currentEntry === upperLimit) {
            const nextSplitCount = state.splitCounter + 1;
            return {
                splitCounter: nextSplitCount,
                currentAccumulation: 0,
                possible: (nextSplitCount < requiredSplits)
            };
        } else if (state.currentAccumulation + currentEntry > upperLimit) {
            const nextSplitCount = state.splitCounter + 1;
            return {
                splitCounter: nextSplitCount,
                currentAccumulation: currentEntry,
                possible: (nextSplitCount < requiredSplits)
            };
        } else {
            return {
                splitCounter: state.splitCounter,
                currentAccumulation: state.currentAccumulation + currentEntry,
                possible: true
            };
        }
    }, { splitCounter: 0, currentAccumulation: 0, possible: true });

    return processResult.possible;
};

const findOptimalBound = (lowExtreme, highExtreme, feasibilityFunction, sequence, targetSplits) => {
    if (lowExtreme > highExtreme) {
        return lowExtreme;
    }

    const midpoint = Math.floor((lowExtreme + highExtreme) / 2);

    if (feasibilityFunction(midpoint, sequence, targetSplits)) {
        return findOptimalBound(lowExtreme, midpoint - 1, feasibilityFunction, sequence, targetSplits);
    } else {
        return findOptimalBound(midpoint + 1, highExtreme, feasibilityFunction, sequence, targetSplits);
    }
};

const processNumericalChallenges = () => {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const dataLines = rawInput.trim().split(/\s*\n\s*/);

    let currentLinePointer = 0;
    const allResults = [];

    while (true) {
        const configLine = dataLines[currentLinePointer++];
        if (configLine === "0 0") break;

        const [requiredSplitsVal, elementCountVal] = configLine.split(/\s+/).map(Number);

        const sequenceData = [];
        for (let k = 0; k < elementCountVal; k++) {
            sequenceData.push(Number(dataLines[currentLinePointer++]));
        }

        const initialLowerLimit = 0;
        const initialUpperLimit = 1500000;

        const finalAnswer = findOptimalBound(initialLowerLimit, initialUpperLimit, checkFeasibility, sequenceData, requiredSplitsVal);
        allResults.push(finalAnswer);
    }
    allResults.forEach(res => console.log(res));
};

processNumericalChallenges();