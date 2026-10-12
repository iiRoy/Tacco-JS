var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

function calculateTotalCost(costA, costB, costC, blockCapacity, blockCost, countAItems, countBItems, totalCItems) {
    let currentTotalCost = 0;
    const remainderC = totalCItems % blockCapacity;
    const fullBlocksC = Math.floor(totalCItems / blockCapacity);

    currentTotalCost += fullBlocksC * blockCapacity * blockCost;

    let slotsToProcess = blockCapacity - remainderC;

    const processRemainingSlots = (shouldAddCostPerSlot) => {
        let remainingIterations = slotsToProcess;
        while(remainingIterations > 0){
            if(countAItems > 0){
                countAItems--;
            } else if(countBItems > 0){
                countBItems--;
            }
            if (shouldAddCostPerSlot) {
                currentTotalCost += blockCost;
            }
            remainingIterations--;
        }
    };

    const conditionForBlockCost = remainderC * costC <= blockCapacity * blockCost;

    if(conditionForBlockCost){
        currentTotalCost += blockCapacity * blockCost;
        processRemainingSlots(false);
    } else {
        currentTotalCost += remainderC * blockCost;
        processRemainingSlots(true);
    }

    currentTotalCost += costA * countAItems + costB * countBItems;
    console.log(currentTotalCost);
}

while(true){
    const currentInputLine = lineBuffer.shift();
    if(currentInputLine === "0 0 0 0 0") break;

    const nextInputLine = lineBuffer.shift();
    const combinedInputString = currentInputLine + " " + nextInputLine;
    const parsedNumericValues = combinedInputString.split(" ").map(Number);

    calculateTotalCost(...parsedNumericValues);
}
