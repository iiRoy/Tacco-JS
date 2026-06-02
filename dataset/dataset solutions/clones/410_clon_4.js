function obtainArrangements(elementsToOrder) {
    const allPossibleOrderings = [];

    function explorePath(depth, currentPath) {
        if (depth === elementsToOrder.length) {
            allPossibleOrderings.push([...currentPath]);
            return;
        }

        for (let elementCandidate of elementsToOrder) {
            if (!currentPath.includes(elementCandidate)) {
                currentPath.push(elementCandidate);
                explorePath(depth + 1, currentPath);
                currentPath.pop();
            }
        }
    }

    explorePath(0, []);
    return allPossibleOrderings;
}

const precomputedOrderings = [];

precomputedOrderings[0] = 0;

for (let count = 0; count < 10; count++) {
    const sequenceForPermutation = Array.from({ length: count + 1 }, (_, i) => i);
    precomputedOrderings[count + 1] = obtainArrangements(sequenceForPermutation);
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

while (true) {
    const itemCount = parseInt(inputLines.shift(), 10);

    if (itemCount === 0) break;

    const itemDetails = Array.from({ length: itemCount }, () => {
        const parts = inputLines.shift().split(" ");
        return [parts[0], parseInt(parts[1], 10), parseInt(parts[2], 10)];
    });

    const currentOrderings = precomputedOrderings[itemCount];

    let highestRatio = 0;
    let chosenOrdering = [];

    currentOrderings.forEach(currentOrdering => {
        const evaluation = currentOrdering.reduce((accumulator, itemIdentifier, positionIndex) => {
            if (!accumulator.isFeasible) return accumulator;

            const currentItemData = itemDetails[itemIdentifier];
            const itemWeight = currentItemData[1];
            const itemCapacity = currentItemData[2];

            const newTotalWeight = accumulator.totalWeight + itemWeight;

            if (newTotalWeight > itemCapacity) {
                return { isFeasible: false, totalWeight: 0, cumulativeWeightedSum: 0 };
            }

            return {
                isFeasible: true,
                totalWeight: newTotalWeight,
                cumulativeWeightedSum: accumulator.cumulativeWeightedSum + (itemWeight * (positionIndex + 1))
            };
        }, { isFeasible: true, totalWeight: 0, cumulativeWeightedSum: 0 });

        if (evaluation.isFeasible) {
            const currentRatio = evaluation.cumulativeWeightedSum / evaluation.totalWeight;
            if (currentRatio > highestRatio) {
                highestRatio = currentRatio;
                chosenOrdering = currentOrdering;
            }
        }
    });

    console.log(chosenOrdering.map(idx => itemDetails[idx][0]).reverse().join("\n"));
}
