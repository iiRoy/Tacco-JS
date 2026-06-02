const inputState = {
    rawInputData: "",
    inputLines: [],
    currentLineIndex: 0
};

process.stdin.resume();
process.stdin.setEncoding('ascii');

process.stdin.on('data', function (dataChunk) {
    inputState.rawInputData += dataChunk;
});

function processInputAndExecute() {
    inputState.inputLines = inputState.rawInputData.split("\n");
    mainProgram();
}

process.on('SIGINT', function(){
    processInputAndExecute();
    process.exit();
});

process.stdin.on('end', function () {
    processInputAndExecute();
});

function fetchNextLine() {
    return inputState.inputLines[inputState.currentLineIndex++];
}

/////////////// ignore above this line ////////////////////

function mainProgram() {
    const MAX_COST = 1000000000;

    let lineParts = fetchNextLine().split(" ");
    const numItems = parseInt(lineParts[0]);
    const targetA = parseInt(lineParts[1]);
    const targetB = parseInt(lineParts[2]);

    const itemAValues = [0];
    const itemBValues = [0];
    const itemCosts = [0];

    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        lineParts = fetchNextLine().split(" ");
        itemAValues.push(parseInt(lineParts[0]));
        itemBValues.push(parseInt(lineParts[1]));
        itemCosts.push(parseInt(lineParts[2]));
    }
    
    const maxDimensionValue = 11 * numItems;
    const dpArraySize = maxDimensionValue * maxDimensionValue;

    const minCosts = new Array(dpArraySize).fill(MAX_COST);
    minCosts[0] = 0;

    const calculateFlatIndex = (dimA, dimB) => {
        return dimA * maxDimensionValue + dimB;
    };

    for (let itemIdx = 1; itemIdx <= numItems; itemIdx++) {
        const currentItemA = itemAValues[itemIdx];
        const currentItemB = itemBValues[itemIdx];
        const currentItemCost = itemCosts[itemIdx];

        for (let currentA = 10 * numItems; currentA >= 0; currentA--) {
            for (let currentB = 10 * numItems; currentB >= 0; currentB--) {
                if (currentA - currentItemA >= 0 || currentB - currentItemB >= 0) {
                    const currentIdx = calculateFlatIndex(currentA, currentB);
                    const prevIdx = calculateFlatIndex(currentA - currentItemA, currentB - currentItemB);
                    
                    const costFromPreviousState = minCosts[prevIdx];
                    
                    if (minCosts[currentIdx] > costFromPreviousState + currentItemCost) {
                        minCosts[currentIdx] = costFromPreviousState + currentItemCost;
                    }
                }
            }
        }
    }
    
    let finalMinCost = MAX_COST;

    for (let multiplier = 1; multiplier <= 10; multiplier++) {
        const scaledTargetA = targetA * multiplier;
        const scaledTargetB = targetB * multiplier;

        const targetIdx = calculateFlatIndex(scaledTargetA, scaledTargetB);
        
        if (finalMinCost > minCosts[targetIdx]) {
            finalMinCost = minCosts[targetIdx];
        }
    }
    
    if (finalMinCost === MAX_COST) {
        console.log("-1\n");
    } else {
        console.log(finalMinCost.toString());
    }
}
