process.stdin.resume();
process.stdin.setEncoding('ascii');

let fullInputString = "";
let lineIterator;

process.stdin.on('data', (dataChunk) => {
    fullInputString += dataChunk;
});

process.on('SIGINT', () => {
    lineIterator = fullInputString.split("\n").values();
    runCalculation();
    process.exit();
});

process.stdin.on('end', () => {
    lineIterator = fullInputString.split("\n").values();
    runCalculation();
});

function acquireLine() {
    const { value, done } = lineIterator.next();
    if (done) {
        return null;
    }
    return value;
}

/////////////// ignore above this line ////////////////////

function runCalculation() {
    const EXTREME_VALUE = 1000000000;

    const configLineData = acquireLine().split(" ");
    const itemQuantity = parseInt(configLineData[0]);
    const targetAValue = parseInt(configLineData[1]);
    const targetBValue = parseInt(configLineData[2]);

    const itemDetails = [];
    itemDetails.push(null); // Placeholder for 0-index to match original's 1-indexed loops

    for (let currentItemIdx = 1; currentItemIdx <= itemQuantity; currentItemIdx++) {
        const detailLineData = acquireLine().split(" ");
        itemDetails.push({
            propA: parseInt(detailLineData[0]),
            propB: parseInt(detailLineData[1]),
            cost: parseInt(detailLineData[2])
        });
    }
    
    const STRIDE_VALUE = 11 * itemQuantity; // Replicates original's `11*N` in `getPos`
    const COST_MATRIX_SIZE = (STRIDE_VALUE + 1) * (STRIDE_VALUE + 1);
    const costMatrix = new Array(COST_MATRIX_SIZE).fill(EXTREME_VALUE);

    const getLinearIndex = (dimA, dimB) => {
        // Replicates the original's potentially buggy indexing: `i * 11 * N + j`
        // where `11 * N` is used as the stride, not `11 * N + 1`.
        return dimA * STRIDE_VALUE + dimB;
    };

    costMatrix[getLinearIndex(0, 0)] = 0;

    for (let currentItemIdx = 1; currentItemIdx <= itemQuantity; currentItemIdx++) {
        const currentItem = itemDetails[currentItemIdx];
        const itemPropA = currentItem.propA;
        const itemPropB = currentItem.propB;
        const itemCost = currentItem.cost;

        // Iterate capacities downwards for 0/1 knapsack behavior
        for (let currentSumA = 10 * itemQuantity; currentSumA >= 0; currentSumA--) {
            for (let currentSumB = 10 * itemQuantity; currentSumB >= 0; currentSumB--) {
                
                const previousSumA = currentSumA - itemPropA;
                const previousSumB = currentSumB - itemPropB;

                // This condition effectively replicates the original's behavior where
                // updates only occur if previous indices are non-negative, as negative
                // indices would result in `undefined` and prevent update.
                if (previousSumA >= 0 && previousSumB >= 0) {
                    const currentPosition = getLinearIndex(currentSumA, currentSumB);
                    const previousPosition = getLinearIndex(previousSumA, previousSumB);
                    
                    const existingCostAtCurrent = costMatrix[currentPosition];
                    const costFromPreviousState = costMatrix[previousPosition];

                    if (costFromPreviousState !== EXTREME_VALUE) { // Only consider if previous state was reachable
                        if (existingCostAtCurrent > costFromPreviousState + itemCost) {
                            costMatrix[currentPosition] = costFromPreviousState + itemCost;
                        }
                    }
                }
            }
        }
    }
    
    let finalMinimumCost = EXTREME_VALUE;

    for (let ratioFactor = 1; ratioFactor <= 10; ratioFactor++) {
        const soughtA = targetAValue * ratioFactor;
        const soughtB = targetBValue * ratioFactor;

        // Ensure indices are within the relevant bounds (0 to 10*N)
        if (soughtA <= 10 * itemQuantity && soughtB <= 10 * itemQuantity) {
            const correspondingPosition = getLinearIndex(soughtA, soughtB);
            const potentialCost = costMatrix[correspondingPosition];
            
            if (finalMinimumCost > potentialCost) {
                finalMinimumCost = potentialCost;
            }
        }
    }

    if (finalMinimumCost === EXTREME_VALUE) {
        console.log("-1");
    } else {
        console.log(finalMinimumCost.toString());
    }
}