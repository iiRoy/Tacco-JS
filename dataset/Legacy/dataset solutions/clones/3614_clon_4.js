class FenwickTree {
    constructor(dimensionSize) {
        this.treeData = new Array(dimensionSize + 1).fill(0);
        this.treeDimension = dimensionSize;
    }

    adjust(index, valueChange) {
        let currentIdx = index;
        while (currentIdx <= this.treeDimension) {
            this.treeData[currentIdx] += valueChange;
            currentIdx += currentIdx & (-currentIdx);
        }
    }

    retrieveSum(index) {
        let currentSum = 0;
        let currentIdx = index;
        while (currentIdx > 0) {
            currentSum += this.treeData[currentIdx];
            currentIdx -= currentIdx & (-currentIdx);
        }
        return currentSum;
    }
}

var capturedLines = [];
var maxCoord, numPairs, numQueries;

var ioInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', function (inputLine) {
    capturedLines.push(inputLine);
});

ioInterface.on('close', function () {
    const initialParams = capturedLines[0].split(" ").map(Number);
    maxCoord = initialParams[0];
    numPairs = initialParams[1];
    numQueries = initialParams[2];

    const dataPoints = [];
    for (let i = 0; i < numPairs; i++) {
        const coords = capturedLines[i + 1].split(" ").map(Number);
        dataPoints.push({ xVal: coords[0], yVal: coords[1] });
    }

    const queryRequests = [];
    for (let i = 0; i < numQueries; i++) {
        const range = capturedLines[i + numPairs + 1].split(" ").map(Number);
        queryRequests.push({ rangeStart: range[0], rangeEnd: range[1], originalQueryIndex: i });
    }

    const processingEvents = [];

    for (const point of dataPoints) {
        processingEvents.push({ eventType: 0, xCoordinate: point.xVal, yCoordinate: point.yVal });
    }

    for (const request of queryRequests) {
        // The query is for count(l, r) where rangeStart <= l <= rangeEnd and rangeStart <= r <= rangeEnd
        // This is equivalent to:
        // f(rangeEnd, rangeEnd)
        // - f(rangeStart - 1, rangeEnd)
        // - f(rangeEnd, rangeStart - 1)
        // + f(rangeStart - 1, rangeStart - 1)
        // where f(X, Y) = count(l <= X, r <= Y)

        processingEvents.push({ eventType: 1, xCoordinate: request.rangeEnd, yCoordinate: request.rangeEnd, coefficient: 1, queryIdentifier: request.originalQueryIndex });
        processingEvents.push({ eventType: 1, xCoordinate: request.rangeStart - 1, yCoordinate: request.rangeEnd, coefficient: -1, queryIdentifier: request.originalQueryIndex });
        processingEvents.push({ eventType: 1, xCoordinate: request.rangeEnd, yCoordinate: request.rangeStart - 1, coefficient: -1, queryIdentifier: request.originalQueryIndex });
        processingEvents.push({ eventType: 1, xCoordinate: request.rangeStart - 1, yCoordinate: request.rangeStart - 1, coefficient: 1, queryIdentifier: request.originalQueryIndex });
    }

    processingEvents.sort((eventA, eventB) => {
        if (eventA.xCoordinate !== eventB.xCoordinate) {
            return eventA.xCoordinate - eventB.xCoordinate;
        }
        return eventA.eventType - eventB.eventType;
    });

    const finalResults = new Array(numQueries).fill(0);
    const yAxisBit = new FenwickTree(maxCoord);

    for (const currentEvent of processingEvents) {
        if (currentEvent.eventType === 0) {
            if (currentEvent.yCoordinate >= 1 && currentEvent.yCoordinate <= maxCoord) {
                yAxisBit.adjust(currentEvent.yCoordinate, 1);
            }
        } else {
            const effectiveYLookup = Math.min(currentEvent.yCoordinate, maxCoord);
            finalResults[currentEvent.queryIdentifier] += currentEvent.coefficient * yAxisBit.retrieveSum(effectiveYLookup);
        }
    }

    for (let i = 0; i < numQueries; i++) {
        console.log(finalResults[i]);
    }
});
