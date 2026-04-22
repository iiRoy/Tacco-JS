const fileOperations = require('fs');

const parseProblemData = (dataText) => {
    const separatedLines = dataText.trim().split('\n');
    const problemCollection = [];
    let linePointer = 0;

    for (; linePointer < separatedLines.length; ) {
        const firstPart = separatedLines[linePointer];
        if (firstPart === '0 0 0 0 0') {
            break;
        }
        const secondPart = separatedLines[linePointer + 1];
        const combinedParts = (firstPart + ' ' + secondPart).split(' ').map(Number);
        problemCollection.push(combinedParts);
        linePointer += 2;
    }
    return problemCollection;
};

const determineMinimumCost = (pricingAndQuantities) => {
    const [
        unitCostA,
        unitCostB,
        unitCostC,
        batchUnitCount,
        batchUnitCost,
        initialQuantityA,
        initialQuantityB,
        requiredUnitsC
    ] = pricingAndQuantities;

    const calculateStrategyOne = () => {
        const remainingUnits = requiredUnitsC % batchUnitCount;
        const completeBatches = Math.floor(requiredUnitsC / batchUnitCount);
        return (
            initialQuantityA * unitCostA +
            initialQuantityB * unitCostB +
            completeBatches * batchUnitCount * batchUnitCost +
            remainingUnits * unitCostC
        );
    };

    const calculateStrategyTwo = () => {
        if (requiredUnitsC >= batchUnitCount) {
            return initialQuantityA * unitCostA + initialQuantityB * unitCostB + requiredUnitsC * batchUnitCost;
        } else {
            const neededForFullBatch = batchUnitCount - requiredUnitsC;
            let currentQuantityA = initialQuantityA;
            let currentQuantityB = initialQuantityB;

            const consumedFromB = Math.min(currentQuantityB, neededForFullBatch);
            currentQuantityB -= consumedFromB;
            const remainingNeeded = neededForFullBatch - consumedFromB;

            const consumedFromA = Math.min(currentQuantityA, remainingNeeded);
            currentQuantityA -= consumedFromA;

            return (
                currentQuantityA * unitCostA +
                currentQuantityB * unitCostB +
                batchUnitCount * batchUnitCost
            );
        }
    };

    const costOptionOne = calculateStrategyOne();
    const costOptionTwo = calculateStrategyTwo();

    return Math.min(costOptionOne, costOptionTwo);
};

const initiateComputation = () => {
    const rawDataBuffer = fileOperations.readFileSync('/dev/stdin', 'utf8');
    const processedProblemSets = parseProblemData(rawDataBuffer);

    const finalOutcomes = processedProblemSets.map(determineMinimumCost);

    finalOutcomes.forEach(resultValue => console.log(resultValue));
};

initiateComputation();