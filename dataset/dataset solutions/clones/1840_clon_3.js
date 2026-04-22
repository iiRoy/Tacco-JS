const fileSystemModule = require('fs');

const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');

const inputLines = rawInputData.split('\n');

const totalTestCases = Number(inputLines[0]);

let minOverallCostForCurrentCase;

let costMemoMap;

function calculateMinTransformationCost(currentNum, currentPathCost, costDivTwo, costDivThree, costUnitChange) {
    if (currentPathCost >= minOverallCostForCurrentCase) {
        return;
    }

    if (currentNum === 0) {
        minOverallCostForCurrentCase = Math.min(minOverallCostForCurrentCase, currentPathCost);
        return;
    }

    if (currentNum === 1) {
        minOverallCostForCurrentCase = Math.min(minOverallCostForCurrentCase, currentPathCost + costUnitChange);
        return;
    }

    if (currentNum < 0) {
        return;
    }

    if (costMemoMap.has(currentNum) && costMemoMap.get(currentNum) <= currentPathCost) {
        return;
    }
    costMemoMap.set(currentNum, currentPathCost);

    if (currentNum >= 2) {
        const remainderWhenDividingByTwo = currentNum % 2;
        const quotientWhenDividingByTwo = Math.floor(currentNum / 2);

        if (remainderWhenDividingByTwo === 0 || quotientWhenDividingByTwo === 1) {
            const calculatedCost = currentPathCost + costDivTwo * quotientWhenDividingByTwo + costUnitChange * remainderWhenDividingByTwo;
            minOverallCostForCurrentCase = Math.min(minOverallCostForCurrentCase, calculatedCost);
        } else {
            calculateMinTransformationCost(
                quotientWhenDividingByTwo,
                currentPathCost + costDivTwo + costUnitChange * remainderWhenDividingByTwo,
                costDivTwo, costDivThree, costUnitChange
            );

            const nextQuotientTwo = quotientWhenDividingByTwo + 1;
            const unitChangesForNextMultipleTwo = Math.abs(currentNum - nextQuotientTwo * 2);

            if (unitChangesForNextMultipleTwo === 0) {
                const directCostForNextMultiple = currentPathCost + costDivTwo * nextQuotientTwo;
                minOverallCostForCurrentCase = Math.min(minOverallCostForCurrentCase, directCostForNextMultiple);
            } else {
                calculateMinTransformationCost(
                    nextQuotientTwo,
                    currentPathCost + costDivTwo + costUnitChange * unitChangesForNextMultipleTwo,
                    costDivTwo, costDivThree, costUnitChange
                );
            }
        }
    }

    if (currentNum >= 3) {
        const remainderWhenDividingByThree = currentNum % 3;
        const quotientWhenDividingByThree = Math.floor(currentNum / 3);

        if (remainderWhenDividingByThree === 0 || quotientWhenDividingByThree === 1) {
            const calculatedCost = currentPathCost + costDivThree * quotientWhenDividingByThree + costUnitChange * remainderWhenDividingByThree;
            minOverallCostForCurrentCase = Math.min(minOverallCostForCurrentCase, calculatedCost);
        } else {
            calculateMinTransformationCost(
                quotientWhenDividingByThree,
                currentPathCost + costDivThree + costUnitChange * remainderWhenDividingByThree,
                costDivTwo, costDivThree, costUnitChange
            );

            const nextQuotientThree = quotientWhenDividingByThree + 1;
            const unitChangesForNextMultipleThree = Math.abs(currentNum - nextQuotientThree * 3);

            if (unitChangesForNextMultipleThree === 0) {
                const directCostForNextMultiple = currentPathCost + costDivThree * nextQuotientThree;
                minOverallCostForCurrentCase = Math.min(minOverallCostForCurrentCase, directCostForNextMultiple);
            } else {
                calculateMinTransformationCost(
                    nextQuotientThree,
                    currentPathCost + costDivThree + costUnitChange * unitChangesForNextMultipleThree,
                    costDivTwo, costDivThree, costUnitChange
                );
            }
        }
    }
}


for (let caseIndex = 1; caseIndex <= totalTestCases; caseIndex++) {
    const currentCaseValues = inputLines[caseIndex].split(' ');

    const targetNum = Number(currentCaseValues[0]);
    const costDivTwo = Number(currentCaseValues[1]);
    const costDivThree = Number(currentCaseValues[2]);
    const costUnitChange = Number(currentCaseValues[4]);

    minOverallCostForCurrentCase = Number.MAX_SAFE_INTEGER;

    costMemoMap = new Map();

    calculateMinTransformationCost(targetNum, 0, costDivTwo, costDivThree, costUnitChange);

    console.log(minOverallCostForCurrentCase);
}