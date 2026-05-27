process.stdin.resume();
process.stdin.setEncoding('ascii');

let rawInputBuffer = "";
let inputLines = [];
let currentLineIndex = 0;

process.stdin.on('data', function (data) {
    rawInputBuffer += data;
});

process.on('SIGINT', function(){
    inputLines = rawInputBuffer.split("\n");
    executeSolution();
    process.exit();
});

process.stdin.on('end', function () {
    inputLines = rawInputBuffer.split("\n");
    executeSolution();    
});

function retrieveNextLine() {
    return inputLines[currentLineIndex++];
}

function executeSolution() {
    const MAX_POSSIBLE_COST = 1000000000;

    const initialParams = retrieveNextLine().split(" ");
    const N_ITEMS = parseInt(initialParams[0]);
    const TARGET_A_RATIO = parseInt(initialParams[1]);
    const TARGET_B_RATIO = parseInt(initialParams[2]);

    const itemProperties = [];
    for (let itemIdx = 0; itemIdx < N_ITEMS; itemIdx++) {
        const itemData = retrieveNextLine().split(" ");
        itemProperties.push({
            valA: parseInt(itemData[0]),
            valB: parseInt(itemData[1]),
            cost: parseInt(itemData[2])
        });
    }

    const maxAccumulatedA = 10 * N_ITEMS;
    const maxAccumulatedB = 10 * N_ITEMS;

    const minCostMatrix = Array.from({ length: maxAccumulatedA + 1 }, () => 
        Array(maxAccumulatedB + 1).fill(MAX_POSSIBLE_COST)
    );
    minCostMatrix[0][0] = 0;

    itemProperties.forEach(currentItem => {
        for (let currentSumA = maxAccumulatedA; currentSumA >= 0; currentSumA--) {
            for (let currentSumB = maxAccumulatedB; currentSumB >= 0; currentSumB--) {
                const previousSumA = currentSumA - currentItem.valA;
                const previousSumB = currentSumB - currentItem.valB;

                if (previousSumA >= 0 && previousSumB >= 0) {
                    const costFromPreviousState = minCostMatrix[previousSumA][previousSumB];
                    
                    if (costFromPreviousState !== MAX_POSSIBLE_COST) {
                        minCostMatrix[currentSumA][currentSumB] = Math.min(
                            minCostMatrix[currentSumA][currentSumB],
                            costFromPreviousState + currentItem.cost
                        );
                    }
                }
            }
        }
    });

    let finalMinimumCost = MAX_POSSIBLE_COST;
    for (let multiplier = 1; multiplier <= 10; multiplier++) {
        const requiredSumA = TARGET_A_RATIO * multiplier;
        const requiredSumB = TARGET_B_RATIO * multiplier;

        if (requiredSumA <= maxAccumulatedA && requiredSumB <= maxAccumulatedB) {
            finalMinimumCost = Math.min(
                finalMinimumCost,
                minCostMatrix[requiredSumA][requiredSumB]
            );
        }
    }

    if (finalMinimumCost === MAX_POSSIBLE_COST) {
        console.log("-1");
    } else {
        console.log(finalMinimumCost.toString());
    }
}
