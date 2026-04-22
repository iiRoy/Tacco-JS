class IndexTree {
    constructor(dimension) {
        this.data = new Uint32Array(dimension + 1).fill(0);
        this.limit = dimension;
    }

    updateValue(idx, delta) {
        let currentIdx = idx;
        while (currentIdx <= this.limit) {
            this.data[currentIdx] += delta;
            currentIdx += currentIdx & (-currentIdx);
        }
    }

    retrieveSum(idx) {
        let cumulativeSum = 0;
        let currentIdx = idx;
        while (currentIdx > 0) {
            cumulativeSum += this.data[currentIdx];
            currentIdx -= currentIdx & (-currentIdx);
        }
        return cumulativeSum;
    }

    getRangeSum(low, high) {
        if (low > high) return 0;
        return this.retrieveSum(high) - this.retrieveSum(low - 1);
    }
}

let collectedLines = [];
let maxDimensionSize, operationCountSize, queryCountSize;
let queryOutcomesArray;

const ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', (inputLine) => {
    collectedLines.push(inputLine);
});

ioInterface.on('close', () => {
    processInputAndGenerateSolution();
});

function processInputAndGenerateSolution() {
    const initialParameters = collectedLines[0].split(" ").map(Number);
    maxDimensionSize = initialParameters[0];
    operationCountSize = initialParameters[1];
    queryCountSize = initialParameters[2];

    const pointEvents = [];
    const queryDecompositionEvents = [];
    queryOutcomesArray = new Array(queryCountSize).fill(0);

    for (let i = 0; i < operationCountSize; i++) {
        const coordinatePair = collectedLines[i + 1].split(" ").map(Number);
        pointEvents.push({ eventType: 'add_coord_point', xPosition: coordinatePair[0], yPosition: coordinatePair[1] });
    }

    for (let i = 0; i < queryCountSize; i++) {
        const rangePair = collectedLines[i + operationCountSize + 1].split(" ").map(Number);
        const startVal = rangePair[0];
        const endVal = rangePair[1];
        
        queryDecompositionEvents.push({ eventType: 'process_range', xPosition: startVal - 1, yRangeStart: startVal, yRangeEnd: endVal, queryIdentifier: i, multiplier: -1 });
        queryDecompositionEvents.push({ eventType: 'process_range', xPosition: endVal, yRangeStart: startVal, yRangeEnd: endVal, queryIdentifier: i, multiplier: 1 });
    }

    const allProcessingEvents = [...pointEvents, ...queryDecompositionEvents];
    allProcessingEvents.sort((eventA, eventB) => {
        if (eventA.xPosition !== eventB.xPosition) {
            return eventA.xPosition - eventB.xPosition;
        }
        const orderMap = { 'add_coord_point': 0, 'process_range': 1 };
        return orderMap[eventA.eventType] - orderMap[eventB.eventType];
    });

    const yAxisBit = new IndexTree(maxDimensionSize);

    for (const currentEvent of allProcessingEvents) {
        if (currentEvent.eventType === 'add_coord_point') {
            yAxisBit.updateValue(currentEvent.yPosition, 1);
        } else if (currentEvent.eventType === 'process_range') {
            const currentRangeCount = yAxisBit.getRangeSum(currentEvent.yRangeStart, currentEvent.yRangeEnd);
            queryOutcomesArray[currentEvent.queryIdentifier] += currentRangeCount * currentEvent.multiplier;
        }
    }

    for (let i = 0; i < queryCountSize; i++) {
        console.log(queryOutcomesArray[i]);
    }
}