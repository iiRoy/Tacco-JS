const fileSystem = require('fs');

const parseInputLine = (lineStr) => {
    const parts = lineStr.split(' ');
    const [targetN, costA, costB, costC, costD] = parts.map(val => parseInt(val, 10));
    return { targetN, costA, costB, costC, costD };
};

let minTotalCost;

const updateMinCost = (currentCost) => {
    if (minTotalCost === 0 || currentCost < minTotalCost) {
        minTotalCost = currentCost;
    }
};

let globalCostA, globalCostB, globalCostC, globalCostD;

const processDivisorOperation = (currentNum, accumulatedCost, divisor, operationCost) => {
    if (currentNum < divisor) {
        return;
    }

    let remainderVal = currentNum % divisor;
    let divisorResult = (currentNum - remainderVal) / divisor;

    if (remainderVal === 0 || divisorResult === 1) {
        const tempCalculatedCost = accumulatedCost + operationCost * divisorResult + globalCostD * remainderVal;
        updateMinCost(tempCalculatedCost);
    } else {
        calculateMinCost(divisorResult, accumulatedCost + operationCost + globalCostD * remainderVal);

        divisorResult = divisorResult + 1;
        remainderVal = currentNum - divisorResult * divisor;

        if (remainderVal === 0) {
            const tempCalculatedCost = accumulatedCost + operationCost * divisorResult + globalCostD;
            updateMinCost(tempCalculatedCost);
        } else {
            calculateMinCost(divisorResult, accumulatedCost + operationCost + globalCostD * remainderVal);
        }
    }
};

const calculateMinCost = (currentNum, accumulatedCost) => {
    processDivisorOperation(currentNum, accumulatedCost, 2, globalCostA);
    processDivisorOperation(currentNum, accumulatedCost, 3, globalCostB);

    /*
    processDivisorOperation(currentNum, accumulatedCost, 5, globalCostC);
    */
};

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf-8');
const lines = rawData.split('\n');

const testCaseCount = parseInt(lines[0], 10);

for (let caseIndex = 1; caseIndex <= testCaseCount; caseIndex++) {
    const { targetN, costA, costB, costC, costD } = parseInputLine(lines[caseIndex]);

    globalCostA = costA;
    globalCostB = costB;
    globalCostC = costC;
    globalCostD = costD;

    minTotalCost = 0;

    calculateMinCost(targetN, 0);

    console.log(minTotalCost);
}
