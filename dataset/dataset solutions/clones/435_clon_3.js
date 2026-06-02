const parseNumericLine = (inputBuffer) => {
    return inputBuffer.shift().split(' ').map(parseFloat);
};

const createPathMatrices = (sizeLimit) => {
    const pathMatrixA = [];
    const pathMatrixB = [];
    for (let nodeIndex = 0; nodeIndex <= sizeLimit; nodeIndex++) {
        pathMatrixA[nodeIndex] = [];
        pathMatrixB[nodeIndex] = [];
    }
    return { matrixOne: pathMatrixA, matrixTwo: pathMatrixB };
};

function processGraphData() {
    const infinityVal = 1e9;

    let currentLineData;
    let numNodes, maxVertexIdx;
    let nodeA, nodeB, edgeCost, edgeTime;
    let startNode, endNode, queryType;
    let outerLoopIdx, midLoopIdx, innerLoopIdx;

    while (true) {
        currentLineData = parseNumericLine(rawDataBuffer);
        numNodes = currentLineData[0];
        maxVertexIdx = currentLineData[1];

        const shouldTerminate = (numNodes === 0 && maxVertexIdx === 0);
        if (shouldTerminate) {
            break;
        }

        const { matrixOne: minCosts, matrixTwo: minTimes } = createPathMatrices(maxVertexIdx);

        for (outerLoopIdx = 0; outerLoopIdx < numNodes; outerLoopIdx++) {
            currentLineData = parseNumericLine(rawDataBuffer);
            nodeA = currentLineData[0];
            nodeB = currentLineData[1];
            edgeCost = currentLineData[2];
            edgeTime = currentLineData[3];

            const existingCostAtoB = minCosts[nodeA][nodeB] || infinityVal;
            const existingCostBtoA = minCosts[nodeB][nodeA] || infinityVal;
            minCosts[nodeA][nodeB] = Math.min(edgeCost, existingCostAtoB);
            minCosts[nodeB][nodeA] = Math.min(edgeCost, existingCostBtoA);

            const existingTimeAtoB = minTimes[nodeA][nodeB] || infinityVal;
            const existingTimeBtoA = minTimes[nodeB][nodeA] || infinityVal;
            minTimes[nodeA][nodeB] = Math.min(edgeTime, existingTimeAtoB);
            minTimes[nodeB][nodeA] = Math.min(edgeTime, existingTimeBtoA);
        }

        for (outerLoopIdx = 1; outerLoopIdx <= maxVertexIdx; outerLoopIdx++) {
            for (midLoopIdx = 1; midLoopIdx <= maxVertexIdx; midLoopIdx++) {
                for (innerLoopIdx = 1; innerLoopIdx <= maxVertexIdx; innerLoopIdx++) {
                    const costPathViaIntermediate = (minCosts[midLoopIdx][outerLoopIdx] || infinityVal) + (minCosts[outerLoopIdx][innerLoopIdx] || infinityVal);
                    const currentMinCost = minCosts[midLoopIdx][innerLoopIdx] || infinityVal;
                    minCosts[midLoopIdx][innerLoopIdx] = Math.min(currentMinCost, costPathViaIntermediate);

                    const timePathViaIntermediate = (minTimes[midLoopIdx][outerLoopIdx] || infinityVal) + (minTimes[outerLoopIdx][innerLoopIdx] || infinityVal);
                    const currentMinTime = minTimes[midLoopIdx][innerLoopIdx] || infinityVal;
                    minTimes[midLoopIdx][innerLoopIdx] = Math.min(currentMinTime, timePathViaIntermediate);
                }
            }
        }

        const numberOfQueries = parseFloat(rawDataBuffer.shift());
        for (outerLoopIdx = 0; outerLoopIdx < numberOfQueries; outerLoopIdx++) {
            currentLineData = parseNumericLine(rawDataBuffer);
            startNode = currentLineData[0];
            endNode = currentLineData[1];
            queryType = currentLineData[2];

            const selectedMatrix = (queryType === 0) ? minCosts : minTimes;
            console.log(selectedMatrix[startNode][endNode]);
        }
    }
}

let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawDataBuffer += chunk;
});
process.stdin.on('end', function() {
    rawDataBuffer = rawDataBuffer.split('\n');
    const processingStartTime = Date.now();
    processGraphData();
    console.log('time: ' + (Date.now() - processingStartTime));
});
