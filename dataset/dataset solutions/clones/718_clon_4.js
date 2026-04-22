function computeTetrahedralValue(order) {
    return (order * (order + 1) * (order + 2)) / 6;
}

const primaryCollection = [];
const secondaryCollection = [];
const highestOrder = 180;

for (let currentOrder = 1; currentOrder <= highestOrder; ++currentOrder) {
    const value = computeTetrahedralValue(currentOrder);
    primaryCollection.push(value);
    if ((currentOrder - 1) % 4 === 0) {
        secondaryCollection.push(value);
    }
}

const maximumTarget = 1000000;

const primaryCostMap = new Map();
const secondaryCostMap = new Map();

primaryCostMap.set(0, 0);
secondaryCostMap.set(0, 0);

function determineMinimumCombinations(itemSet, costRegistry) {
    for (const itemUnit of itemSet) {
        for (let currentSum = itemUnit; currentSum < maximumTarget; ++currentSum) {
            const costOfPreviousSum = costRegistry.get(currentSum - itemUnit);
            if (costOfPreviousSum !== undefined) {
                const existingCost = costRegistry.get(currentSum);
                if (existingCost === undefined || costOfPreviousSum + 1 < existingCost) {
                    costRegistry.set(currentSum, costOfPreviousSum + 1);
                }
            }
        }
    }
}

determineMinimumCombinations(primaryCollection, primaryCostMap);
determineMinimumCombinations(secondaryCollection, secondaryCostMap);

function ProcessQueries(rawInputPayload) {
    const numericQueries = rawInputPayload.trim().split("\n").map(Number);
    const outputBuffer = [];

    for (const queryValue of numericQueries) {
        if (queryValue === 0) {
            break;
        }
        const resultForPrimary = primaryCostMap.get(queryValue);
        const resultForSecondary = secondaryCostMap.get(queryValue);

        const primaryResultString = resultForPrimary === undefined ? "Infinity" : resultForPrimary;
        const secondaryResultString = resultForSecondary === undefined ? "Infinity" : resultForSecondary;

        outputBuffer.push(`${primaryResultString} ${secondaryResultString}`);
    }
    console.log(outputBuffer.join("\n"));
}

ProcessQueries(require("fs").readFileSync("/dev/stdin", "utf8"));