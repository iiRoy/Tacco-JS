const fileSystem = require('fs');
const entireContent = fileSystem.readFileSync(process.stdin.fd, 'utf8');
const lineBuffer = entireContent.trim().split('\n');
let currentLineIndex = 0;

const extractNumber = () => {
    return parseInt(lineBuffer[currentLineIndex++], 10);
};

const determineOutcome = (maximumJump, nodeCount, offsetValues) => {
    const nodeBoundary = nodeCount + 1;
    const connectionMap = new Map();

    for (let currentSpot = 0; currentSpot <= nodeBoundary; currentSpot++) {
        connectionMap.set(currentSpot, []);
    }

    for (let initialSpot = 0; initialSpot <= nodeCount; initialSpot++) {
        for (let stepSize = 0; stepSize < maximumJump; stepSize++) {
            let potentialDestination = initialSpot + stepSize;
            let adjustedDestination = potentialDestination + (potentialDestination < nodeBoundary ? offsetValues[potentialDestination] : 0);
            
            let finalDestination = Math.min(Math.max(adjustedDestination, 0), nodeBoundary);

            if (finalDestination !== initialSpot) {
                connectionMap.get(initialSpot).push(finalDestination);
            }
        }
    }

    const locateReachableSet = (beginNode, graphStructure) => {
        const visitedLocations = new Set();
        const explorationQueue = [beginNode];
        visitedLocations.add(beginNode);

        while (explorationQueue.length > 0) {
            const currentPosition = explorationQueue.shift();
            for (const adjacentPosition of graphStructure.get(currentPosition) || []) {
                if (!visitedLocations.has(adjacentPosition)) {
                    visitedLocations.add(adjacentPosition);
                    explorationQueue.push(adjacentPosition);
                }
            }
        }
        return visitedLocations;
    };

    const reachableFromOrigin = locateReachableSet(0, connectionMap);

    const invertedConnectionMap = new Map();
    for (let currentSpot = 0; currentSpot <= nodeBoundary; currentSpot++) {
        invertedConnectionMap.set(currentSpot, []);
    }
    for (const [sourcePoint, targetPoints] of connectionMap.entries()) {
        for (const targetPoint of targetPoints) {
            invertedConnectionMap.get(targetPoint).push(sourcePoint);
        }
    }

    const canReachTerminal = locateReachableSet(nodeBoundary, invertedConnectionMap);

    for (let checkSpot = 0; checkSpot <= nodeCount; checkSpot++) {
        if (reachableFromOrigin.has(checkSpot) && !canReachTerminal.has(checkSpot)) {
            return false;
        }
    }
    return true;
};

let currentMaxJump;
while ((currentMaxJump = extractNumber()) !== 0) {
    const totalNodes = extractNumber();
    const displacementArray = new Array(totalNodes + 2);
    displacementArray[0] = 0;
    displacementArray[totalNodes + 1] = 0;
    for (let currentIdx = 1; currentIdx <= totalNodes; currentIdx++) {
        displacementArray[currentIdx] = extractNumber();
    }
    console.log(determineOutcome(currentMaxJump, totalNodes, displacementArray) ? 'OK' : 'NG');
}