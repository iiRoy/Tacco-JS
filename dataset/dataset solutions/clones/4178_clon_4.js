const acquireAndProcess = (inputFeed) => {
    const dataSegments = inputFeed.split('\n');
    const entityCount = Number(dataSegments[0].split(' ')[0]);
    const initialNumericEntities = dataSegments[1].split(' ').map(Number);

    const extremumDetails = initialNumericEntities.reduce((accumulator, currentValue, currentIndex) => {
        if (currentValue > accumulator.dominantValue) {
            accumulator.dominantValue = currentValue;
            accumulator.dominantIndex = currentIndex;
        }
        if (currentValue < accumulator.subordinateValue) {
            accumulator.subordinateValue = currentValue;
            accumulator.subordinateIndex = currentIndex;
        }
        return accumulator;
    }, { dominantValue: -1000001, dominantIndex: -1, subordinateValue: 1000001, subordinateIndex: -1 });

    const currentDominant = extremumDetails.dominantValue;
    const currentSubordinate = extremumDetails.subordinateValue;
    const dominantPosition = extremumDetails.dominantIndex;
    const subordinatePosition = extremumDetails.subordinateIndex;

    let recordedActions = [];
    let mutableEntities = [...initialNumericEntities];

    const executeValuePropagation = (sourceValue, sourcePosition) => {
        const propagationActions = [];
        const transformedEntities = mutableEntities.map((element, elementIndex) => {
            if (elementIndex !== sourcePosition) {
                propagationActions.push([sourcePosition + 1, elementIndex + 1]);
                return element + sourceValue;
            }
            return element;
        });
        recordedActions = recordedActions.concat(propagationActions);
        mutableEntities = transformedEntities;
    };

    const applyAscendingOrder = (currentIterationIndex) => {
        if (currentIterationIndex >= entityCount) return;
        if (currentIterationIndex > 0 && mutableEntities[currentIterationIndex] < mutableEntities[currentIterationIndex - 1]) {
            recordedActions.push([currentIterationIndex, currentIterationIndex + 1]);
            mutableEntities[currentIterationIndex] = mutableEntities[currentIterationIndex - 1] + mutableEntities[currentIterationIndex];
        }
        applyAscendingOrder(currentIterationIndex + 1);
    };

    const applyDescendingOrder = (currentIterationIndex) => {
        if (currentIterationIndex < 0) return;
        if (currentIterationIndex < entityCount - 1 && mutableEntities[currentIterationIndex] > mutableEntities[currentIterationIndex + 1]) {
            recordedActions.push([currentIterationIndex + 2, currentIterationIndex + 1]);
            mutableEntities[currentIterationIndex] = mutableEntities[currentIterationIndex + 1] + mutableEntities[currentIterationIndex];
        }
        applyDescendingOrder(currentIterationIndex - 1);
    };

    if (currentDominant >= Math.abs(currentSubordinate)) {
        executeValuePropagation(currentDominant, dominantPosition);
        applyAscendingOrder(0);
    } else {
        executeValuePropagation(currentSubordinate, subordinatePosition);
        applyDescendingOrder(entityCount - 1);
    }

    const outputStrings = recordedActions.map(action => `${action[0]} ${action[1]}`);
    return [recordedActions.length, ...outputStrings].join('\n');
};

const initiateOperation = (sourceData) => {
    console.log(acquireAndProcess(sourceData));
};

initiateOperation(require("fs").readFileSync("/dev/stdin", "utf8"));