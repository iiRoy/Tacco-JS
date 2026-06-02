const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let dataPointer = 0;

function obtainPermutations(count) {
    const initialElements = Array.from({ length: count }, (_, i) => i);

    function generateRecursive(currentElements) {
        if (currentElements.length === 0) {
            return [[]];
        }

        const firstElement = currentElements[0];
        const remainingElements = currentElements.slice(1);

        const permutationsOfRemaining = generateRecursive(remainingElements);
        const allPerms = [];

        for (const perm of permutationsOfRemaining) {
            for (let i = 0; i <= perm.length; i++) {
                const newPerm = [...perm.slice(0, i), firstElement, ...perm.slice(i)];
                allPerms.push(newPerm);
            }
        }
        return allPerms;
    }
    return generateRecursive(initialElements);
}

while (true) {
    const itemCount = parseInt(inputData[dataPointer++], 10);
    if (itemCount === 0) break;

    const itemDetails = Array.from({ length: itemCount }, () => {
        const parts = inputData[dataPointer++].split(' ');
        return {
            label: parts[0],
            weight: parseInt(parts[1], 10),
            limit: parseInt(parts[2], 10)
        };
    });

    const allPossibleOrders = obtainPermutations(itemCount);

    const bestResult = allPossibleOrders.reduce((accumulator, currentOrder) => {
        const { currentWeightSum, weightedPositionSum, isValidOrder } = currentOrder.reduce((acc, itemIndex, pos) => {
            if (!acc.isValidOrder) {
                return acc;
            }

            const currentItem = itemDetails[itemIndex];

            if (acc.currentWeightSum > currentItem.limit) {
                return { ...acc, isValidOrder: false };
            }
            return {
                currentWeightSum: acc.currentWeightSum + currentItem.weight,
                weightedPositionSum: acc.weightedPositionSum + currentItem.weight * (pos + 1),
                isValidOrder: true
            };
        }, { currentWeightSum: 0, weightedPositionSum: 0, isValidOrder: true });

        if (isValidOrder) {
            const currentAverage = weightedPositionSum / currentWeightSum;
            if (currentAverage > accumulator.maxAverage) {
                return {
                    maxAverage: currentAverage,
                    optimalOrder: currentOrder
                };
            }
        }
        return accumulator;
    }, { maxAverage: 0, optimalOrder: [] });

    const outputNames = bestResult.optimalOrder.map(idx => itemDetails[idx].label);
    console.log(outputNames.reverse().join('\n'));
}
