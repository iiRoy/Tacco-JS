const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.split('\n');

function parseInteger(str) {
    return parseInt(str, 10);
}

const firstLineParts = inputLines[0].split(' ');
const numNodes = parseInteger(firstLineParts[0]);
const numEdges = parseInteger(firstLineParts[1]);
const initialHeight = parseInteger(firstLineParts[2]);

let idx;
let nodeHeights = new Array(numNodes);
let adjList = new Array(numNodes);

for (idx = 0; idx < numNodes; idx++) {
    nodeHeights[idx] = parseInteger(inputLines[idx + 1]);
    adjList[idx] = [];
}

function parseEdgeDetails(lineString) {
    const parts = lineString.split(' ');
    return {
        nodeA: parseInteger(parts[0]) - 1,
        nodeB: parseInteger(parts[1]) - 1,
        cost: parseInteger(parts[2])
    };
}

for (idx = 0; idx < numEdges; idx++) {
    const edgeDetails = parseEdgeDetails(inputLines[idx + numNodes + 1]);
    adjList[edgeDetails.nodeA].push({
        next: edgeDetails.nodeB,
        t: edgeDetails.cost
    });
    adjList[edgeDetails.nodeB].push({
        next: edgeDetails.nodeA,
        t: edgeDetails.cost
    });
}

const traversalStack = [];
traversalStack.push({
    currentPosition: 0,
    elapsedTime: 0,
    remainingHeight: initialHeight,
    pathTaken: [0]
});

let currentNodeState;
let nextNodeIdx;
let edgeData;
let minTraversalTime = Infinity;

while (traversalStack.length > 0) {
    currentNodeState = traversalStack.pop();

    for (idx = 0; idx < adjList[currentNodeState.currentPosition].length; idx++) {
        edgeData = adjList[currentNodeState.currentPosition][idx];
        nextNodeIdx = edgeData.next;

        if (currentNodeState.pathTaken.includes(nextNodeIdx)) {
            continue;
        }

        const currentPositionHeight = nodeHeights[currentNodeState.currentPosition];
        const travelCost = edgeData.t;

        if (currentPositionHeight < travelCost) {
            continue;
        }

        const nextNodeHeight = nodeHeights[nextNodeIdx];
        const newElapsedTimeBase = currentNodeState.elapsedTime + travelCost;
        const newPathHistory = currentNodeState.pathTaken.concat(nextNodeIdx);

        if (nextNodeHeight + travelCost < currentNodeState.remainingHeight) {
            const heightDifference = currentNodeState.remainingHeight - (nextNodeHeight + travelCost);
            traversalStack.push({
                currentPosition: nextNodeIdx,
                elapsedTime: newElapsedTimeBase + heightDifference,
                remainingHeight: nextNodeHeight,
                pathTaken: newPathHistory
            });
        } else {
            // Replicating the original's boolean-to-integer index behavior
            const conditionForHIndex = (travelCost >= currentNodeState.remainingHeight && currentNodeState.remainingHeight >= travelCost);
            const hIndexOffset = conditionForHIndex ? 1 : 0; // true -> 1, false -> 0
            const effectiveHIndex = nextNodeIdx + hIndexOffset;

            if (nodeHeights[effectiveHIndex] >= currentNodeState.remainingHeight && currentNodeState.remainingHeight >= travelCost) {
                traversalStack.push({
                    currentPosition: nextNodeIdx,
                    elapsedTime: newElapsedTimeBase,
                    remainingHeight: currentNodeState.remainingHeight - travelCost,
                    pathTaken: newPathHistory
                });
            } else {
                const heightAdjustment = travelCost - currentNodeState.remainingHeight;
                traversalStack.push({
                    currentPosition: nextNodeIdx,
                    elapsedTime: newElapsedTimeBase + heightAdjustment,
                    remainingHeight: 0,
                    pathTaken: newPathHistory
                });
            }
        }

        if (nextNodeIdx === numNodes - 1) {
            const reachedGoalPath = traversalStack.pop(); // Pops the state just pushed for nextNodeIdx
            minTraversalTime = Math.min(minTraversalTime, reachedGoalPath.elapsedTime + nodeHeights[numNodes - 1] - reachedGoalPath.remainingHeight);
        }
    }
}

if (minTraversalTime === Infinity) {
    console.log(-1);
} else {
    console.log(minTraversalTime);
}
