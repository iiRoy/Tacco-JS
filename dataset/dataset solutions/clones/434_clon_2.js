var nodeCount, adjList;

function executeProgram() {
    while (true) {
        var edgeCount = readNextToken();
        nodeCount = readNextToken();
        if (nodeCount === 0 && edgeCount === 0) {
            break;
        }

        adjList = [];
        loopThrough(nodeCount, function(idx) {
            adjList[idx] = [];
        });
        loopThrough(edgeCount, function() {
            var nodeA = readNextToken() - 1;
            var nodeB = readNextToken() - 1;
            var costOne = readNextToken();
            var costTwo = readNextToken();
            adjList[nodeA].push([costOne, costTwo, nodeB]);
            adjList[nodeB].push([costOne, costTwo, nodeA]);
        });

        var queryCount = readNextToken();
        loopThrough(queryCount, function() {
            var sourceNode = readNextToken() - 1;
            var targetNode = readNextToken() - 1;
            var costType = readNextToken();
            displayOutput(calculateShortestPath(sourceNode, targetNode, costType));
        });
    }
}

function calculateShortestPath(sourceNode, targetNode, costType) {
    var minHeap = [];

    function insertIntoHeap(elementToInsert) {
        var currentPosition = minHeap.length;
        while (currentPosition > 0) {
            var parentPosition = (currentPosition - 1) >> 1;

            if (minHeap[parentPosition] <= elementToInsert) {
                break;
            }

            minHeap[currentPosition] = minHeap[parentPosition];
            currentPosition = parentPosition;
        }
        minHeap[currentPosition] = elementToInsert;
    }

    function extractMinFromHeap() {
        var minElement = minHeap[0];

        var lastElement = minHeap[minHeap.length - 1];
        var heapCurrentSize = --minHeap.length;

        if (!heapCurrentSize) {
            return minElement;
        }

        var heapifyIndex = 0;
        while (heapifyIndex * 2 + 1 < heapCurrentSize) {
            var childOneIndex = heapifyIndex * 2 + 1;
            var childTwoIndex = heapifyIndex * 2 + 2;

            if (childTwoIndex < heapCurrentSize && minHeap[childTwoIndex] < minHeap[childOneIndex]) {
                childOneIndex = childTwoIndex;
            }

            if (minHeap[childOneIndex] >= lastElement) {
                break;
            }

            minHeap[heapifyIndex] = minHeap[childOneIndex];
            heapifyIndex = childOneIndex;
        }
        minHeap[heapifyIndex] = lastElement;

        return minElement;
    }

    function isHeapEmpty() {
        return !minHeap.length;
    }

    var distValues = [];
    loopThrough(nodeCount, function(idx) {
        distValues[idx] = Infinity;
    });

    distValues[sourceNode] = 0;
    insertIntoHeap([0, sourceNode]);
    while (!isHeapEmpty()) {
        var poppedNodeInfo = extractMinFromHeap();

        if (poppedNodeInfo[0] > distValues[poppedNodeInfo[1]]) {
            continue;
        }

        loopThrough(adjList[poppedNodeInfo[1]].length, function(idx) {
            var currentGraphEdge = adjList[poppedNodeInfo[1]][idx];
            if (distValues[currentGraphEdge[2]] > distValues[poppedNodeInfo[1]] + currentGraphEdge[costType]) {
                distValues[currentGraphEdge[2]] = distValues[poppedNodeInfo[1]] + currentGraphEdge[costType];
                insertIntoHeap([distValues[currentGraphEdge[2]], currentGraphEdge[2]]);
            }
        });
    }

    return distValues[targetNode];
}

function loopThrough(loopStart, loopEnd, iterationCallback) {
    if (iterationCallback == null) {
        iterationCallback = loopEnd;
        loopEnd = loopStart;
        loopStart = 0;
    }
    for (var idx = loopStart; idx < loopEnd; ++idx) {
        iterationCallback(idx);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var rawInputBuffer = '';
var bufferPointer = 0;

function readNextToken(dataType) {
    if (dataType === 'string') {
        return rawInputBuffer[bufferPointer++];
    } else {
        return +rawInputBuffer[bufferPointer++];
    }
}

function displayOutput(valueToPrint) {
    console.log(valueToPrint);
}

process.stdin.on('data', function(dataChunk) {
    rawInputBuffer += dataChunk;
});
process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    executeProgram();
});
