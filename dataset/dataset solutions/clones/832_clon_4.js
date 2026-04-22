const acquireSourceData = () => require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

const restrictRange = (val) => Math.max(0, Math.min(255, val));

const computeNextLevelCosts = (priorLevelCosts, primaryComponent, secondaryComponents) => {
    const nextLevelPotentialCosts = Array(256).fill(Infinity);

    const allTransitions = [];
    for (let priorIdx = 0; priorIdx <= 255; ++priorIdx) {
        if (priorLevelCosts[priorIdx] !== Infinity) {
            for (const secondaryVal of secondaryComponents) {
                const unclampedTargetIdx = priorIdx + secondaryVal;
                const clampedTargetIdx = restrictRange(unclampedTargetIdx);
                const transitionCost = priorLevelCosts[priorIdx] + Math.pow(primaryComponent - clampedTargetIdx, 2);
                allTransitions.push({ target: clampedTargetIdx, cost: transitionCost });
            }
        }
    }

    for (const transition of allTransitions) {
        nextLevelPotentialCosts[transition.target] = Math.min(nextLevelPotentialCosts[transition.target], transition.cost);
    }

    return nextLevelPotentialCosts;
};

const processProblemInstance = (lineProvider) => {
    const dimensionLine = lineProvider.next().value.split(" ");
    const primaryDimension = parseInt(dimensionLine[0], 10);
    const secondaryDimension = parseInt(dimensionLine[1], 10);

    if (primaryDimension === 0 && secondaryDimension === 0) {
        return null;
    }

    const secondaryValueList = Array.from({ length: secondaryDimension }, () => parseInt(lineProvider.next().value, 10));
    const primaryValueList = Array.from({ length: primaryDimension }, () => parseInt(lineProvider.next().value, 10));

    const initialCostRow = Array(256).fill(Infinity);
    initialCostRow[128] = 0;

    const fullCostTable = primaryValueList.reduce((acc, currentPrimaryVal) => {
        const lastRow = acc[acc.length - 1];
        const newRow = computeNextLevelCosts(lastRow, currentPrimaryVal, secondaryValueList);
        acc.push(newRow);
        return acc;
    }, [initialCostRow]);

    const finalCosts = fullCostTable[primaryDimension];
    const minimalOverallCost = finalCosts.reduce((acc, val) => Math.min(acc, val), Infinity);
    
    return minimalOverallCost;
};

function* lineIterator(lines) {
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        yield lines[currentLineIndex++];
    }
}

const rawInputLines = acquireSourceData();
const inputLineGenerator = lineIterator(rawInputLines);

let currentResult;
while ((currentResult = processProblemInstance(inputLineGenerator)) !== null) {
    console.log(currentResult);
}