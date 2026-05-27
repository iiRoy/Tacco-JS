var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawInputData.trim().split("\n");

while (true) {
    var itemCount = Number(inputLines.shift());
    if (itemCount === 0) break;

    var processedItems = [];
    for (var i = 0; i < itemCount; i++) {
        var lineParts = inputLines.shift().split(" ");
        processedItems.push([lineParts[0], Number(lineParts[1]), Number(lineParts[2])]);
    }

    processedItems.sort((a, b) => b[1] - a[1]);

    var highestRatio = 0;
    var resultSequence = [];

    const searchStates = [];

    const initialAvailableIndices = new Set(Array.from({ length: itemCount }, (_, idx) => idx));
    searchStates.push({
        currentPath: [],
        currentTotalWeight: 0,
        currentWeightedSum: 0,
        availableItems: initialAvailableIndices
    });

    while (searchStates.length > 0) {
        const currentState = searchStates.pop();

        if (currentState.availableItems.size === 0) {
            if (currentState.currentTotalWeight > 0) {
                const currentRatio = currentState.currentWeightedSum / currentState.currentTotalWeight;
                if (currentRatio > highestRatio) {
                    highestRatio = currentRatio;
                    resultSequence = currentState.currentPath;
                }
            }
            continue;
        }

        const sortedNextCandidates = Array.from(currentState.availableItems).sort((a, b) => a - b);

        for (const nextItemIndex of sortedNextCandidates) {
            const itemData = processedItems[nextItemIndex];
            const itemWeight = itemData[1];
            const itemCapacity = itemData[2];

            if (currentState.currentTotalWeight <= itemCapacity) {
                const nextPath = [...currentState.currentPath, nextItemIndex];
                const nextTotalWeight = currentState.currentTotalWeight + itemWeight;
                const nextWeightedSum = currentState.currentWeightedSum + itemWeight * (currentState.currentPath.length + 1);

                const updatedAvailableItems = new Set(currentState.availableItems);
                updatedAvailableItems.delete(nextItemIndex);

                searchStates.push({
                    currentPath: nextPath,
                    currentTotalWeight: nextTotalWeight,
                    currentWeightedSum: nextWeightedSum,
                    availableItems: updatedAvailableItems
                });
            }
        }
    }

    console.log(resultSequence.map(idx => processedItems[idx][0]).reverse().join("\n"));
}
