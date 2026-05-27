const generatePermutations = (numElements) => {
    const permutationResults = [];
    const currentPath = [];
    const initialElements = Array.from({ length: numElements }, (_, i) => i);

    const recursivePermute = (elementsToPermute) => {
        if (elementsToPermute.length === 0) {
            permutationResults.push(currentPath.slice());
            return;
        }

        for (let i = 0; i < elementsToPermute.length; i++) {
            const chosenElement = elementsToPermute.splice(i, 1)[0];
            currentPath.push(chosenElement);
            recursivePermute(elementsToPermute);
            elementsToPermute.splice(i, 0, chosenElement); // Backtrack
            currentPath.pop(); // Backtrack
        }
    };

    recursivePermute(initialElements);
    return permutationResults;
};

const evaluateOrderPerformance = (orderSequence, dataEntries) => {
    let currentCumulativeWeight = 0;
    let currentTotalWeightedSum = 0;
    let orderIsFeasible = true;

    for (let k = 0; k < orderSequence.length; k++) {
        const itemIndex = orderSequence[k];
        const itemDetails = dataEntries[itemIndex];
        const itemWeight = itemDetails[1];
        const itemCapacity = itemDetails[2];

        if (currentCumulativeWeight > itemCapacity) {
            orderIsFeasible = false;
            break;
        }
        currentCumulativeWeight += itemWeight;
        currentTotalWeightedSum += itemWeight * (k + 1);
    }

    if (orderIsFeasible && currentCumulativeWeight > 0) {
        return currentTotalWeightedSum / currentCumulativeWeight;
    } else {
        return -1; // Indicate an infeasible or invalid order
    }
};

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split("\n");

while (true) {
    const numberOfEntries = Number(inputLines.shift());
    if (numberOfEntries === 0) {
        break;
    }

    const entryData = Array.from({ length: numberOfEntries }, () => {
        const lineParts = inputLines.shift().split(" ");
        return [lineParts[0], Number(lineParts[1]), Number(lineParts[2])];
    });

    const allPossibleOrders = generatePermutations(numberOfEntries);
    let highestRatio = 0;
    let optimalOrder = [];

    for (const currentOrder of allPossibleOrders) {
        const currentRatio = evaluateOrderPerformance(currentOrder, entryData);

        if (currentRatio > highestRatio) {
            highestRatio = currentRatio;
            optimalOrder = currentOrder;
        }
    }

    const resultNames = optimalOrder.map(itemIndex => entryData[itemIndex][0]);
    console.log(resultNames.reverse().join("\n"));
}
