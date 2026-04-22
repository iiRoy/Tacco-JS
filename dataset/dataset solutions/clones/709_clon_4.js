const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

function locateFinalizingOperator(
    currentOperatorIndex,
    currentResourcePool,
    operatorWorkloadsMap,
    totalOperators,
    targetWorkloadValue
) {
    const operatorCurrentLoad = operatorWorkloadsMap.get(currentOperatorIndex) || 0;

    if (operatorCurrentLoad === targetWorkloadValue) {
        return currentOperatorIndex;
    }

    let nextResourcePool;
    const updatedWorkloadsMap = new Map(operatorWorkloadsMap);

    if (currentResourcePool > 0) {
        updatedWorkloadsMap.set(currentOperatorIndex, operatorCurrentLoad + 1);
        nextResourcePool = currentResourcePool - 1;
    } else {
        nextResourcePool = operatorCurrentLoad;
        updatedWorkloadsMap.set(currentOperatorIndex, 0);
    }

    const nextOperatorIndex = (currentOperatorIndex + 1) % totalOperators;

    return locateFinalizingOperator(
        nextOperatorIndex,
        nextResourcePool,
        updatedWorkloadsMap,
        totalOperators,
        targetWorkloadValue
    );
}

function processEntryList(remainingEntries, accumulatedResults = []) {
    if (remainingEntries.length <= 1) {
        return accumulatedResults;
    }
    
    const currentEntryLine = remainingEntries[0];
    const [numOperators, targetTaskCount] = currentEntryLine.split(' ').map(Number);

    const completedOperatorIdentifier = locateFinalizingOperator(
        0,
        targetTaskCount,
        new Map(),
        numOperators,
        targetTaskCount
    );

    return processEntryList(
        remainingEntries.slice(1),
        accumulatedResults.concat(completedOperatorIdentifier)
    );
}

const processedSegments = dataSource.trim().split('\n');
const finalOutcomes = processEntryList(processedSegments);

finalOutcomes.forEach(outcome => console.log(outcome));