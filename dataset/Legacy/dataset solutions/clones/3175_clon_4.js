function computeMinCost(itemCount, goalValues, itemLengths) {
    let minOverallCost = Number.MAX_SAFE_INTEGER;

    const totalCombinations = Math.pow(4, itemCount);

    for (let combinationIndex = 0; combinationIndex < totalCombinations; ++combinationIndex) {
        let currentSumA = 0;
        let currentSumB = 0;
        let currentSumC = 0;
        let currentOperationCost = 0;

        let assignmentPattern = combinationIndex;

        for (let itemIndex = 0; itemIndex < itemCount; ++itemIndex) {
            const assignmentType = assignmentPattern % 4;
            const itemValue = itemLengths[itemIndex];
            assignmentPattern = Math.floor(assignmentPattern / 4);

            switch (assignmentType) {
                case 1: // Assign to A
                    currentSumA += itemValue;
                    currentOperationCost += 10;
                    break;
                case 2: // Assign to B
                    currentSumB += itemValue;
                    currentOperationCost += 10;
                    break;
                case 3: // Assign to C
                    currentSumC += itemValue;
                    currentOperationCost += 10;
                    break;
                // case 0: // Don't assign, no cost, no sum change
                //     break;
            }
        }

        if (currentSumA > 0 && currentSumB > 0 && currentSumC > 0) {
            const deviationCost = Math.abs(goalValues[0] - currentSumA) +
                                  Math.abs(goalValues[1] - currentSumB) +
                                  Math.abs(goalValues[2] - currentSumC) - 30;
            const totalCombinationCost = currentOperationCost + deviationCost;
            minOverallCost = Math.min(minOverallCost, totalCombinationCost);
        }
    }

    return minOverallCost;
}

function processInput(rawInput) {
    const lineData = rawInput.split('\n');
    const [numItemsStr, targetAStr, targetBStr, targetCStr] = lineData[0].split(' ');
    const numItems = parseInt(numItemsStr, 10);
    const targetA = parseInt(targetAStr, 10);
    const targetB = parseInt(targetBStr, 10);
    const targetC = parseInt(targetCStr, 10);

    const sourceItems = lineData.slice(1).map(val => parseInt(val, 10));

    const finalResult = computeMinCost(numItems, [targetA, targetB, targetC], sourceItems);
    console.log(finalResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
