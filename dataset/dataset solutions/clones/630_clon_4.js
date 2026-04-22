const sourceReader = require('fs').readFileSync;

function processRawData(fullTextContent) {
    const dataRows = fullTextContent.split('\n');

    let rowCursor = 0;
    const initialParams = dataRows[rowCursor++].split(' ');
    const totalNodes = Number.parseInt(initialParams[0], 10);
    const totalConnections = Number.parseInt(initialParams[1], 10);
    const startingEnergy = Number.parseInt(initialParams[2], 10);

    const nodeLevels = new Map();
    for (let currentId = 0; currentId < totalNodes; currentId++) {
        nodeLevels.set(currentId, Number.parseInt(dataRows[rowCursor++], 10));
    }

    const networkGraph = new Map();
    for (let currentId = 0; currentId < totalNodes; currentId++) {
        networkGraph.set(currentId, []);
    }

    for (let i = 0; i < totalConnections; i++) {
        const connectionParts = dataRows[rowCursor++].split(' ');
        const pointOne = Number.parseInt(connectionParts[0], 10) - 1;
        const pointTwo = Number.parseInt(connectionParts[1], 10) - 1;
        const passageCost = Number.parseInt(connectionParts[2], 10);

        networkGraph.get(pointOne).push({ destination: pointTwo, expenditure: passageCost });
        networkGraph.get(pointTwo).push({ destination: pointOne, expenditure: passageCost });
    }

    return {
        numNodes: totalNodes,
        initialSupply: startingEnergy,
        levelMap: nodeLevels,
        graphSchema: networkGraph
    };
}

function computeMinimumDuration(systemDetails) {
    const { numNodes, initialSupply, levelMap, graphSchema } = systemDetails;

    const explorationQueue = [];
    let shortestCompletionTime = Infinity;

    explorationQueue.push({
        currentPosition: 0,
        elapsedTime: 0,
        currentResource: initialSupply,
        pathTrace: new Set([0])
    });

    while (explorationQueue.length > 0) {
        const activeTraversal = explorationQueue.shift(); // BFS: process from the front

        const currentPositionLevel = levelMap.get(activeTraversal.currentPosition);
        const connectedSegments = graphSchema.get(activeTraversal.currentPosition);

        for (const segment of connectedSegments) {
            const nextPosition = segment.destination;
            const segmentExpenditure = segment.expenditure;

            if (activeTraversal.pathTrace.has(nextPosition)) {
                continue;
            }

            if (currentPositionLevel < segmentExpenditure) {
                continue;
            }

            let nextElapsedTime;
            let nextResourceSupply;

            const nextPositionLevel = levelMap.get(nextPosition);

            if (nextPositionLevel + segmentExpenditure < activeTraversal.currentResource) {
                nextElapsedTime = activeTraversal.elapsedTime + segmentExpenditure + activeTraversal.currentResource - (nextPositionLevel + segmentExpenditure);
                nextResourceSupply = nextPositionLevel;
            } else if (nextPositionLevel + segmentExpenditure >= activeTraversal.currentResource && activeTraversal.currentResource >= segmentExpenditure) {
                nextElapsedTime = activeTraversal.elapsedTime + segmentExpenditure;
                nextResourceSupply = activeTraversal.currentResource - segmentExpenditure;
            } else {
                nextElapsedTime = activeTraversal.elapsedTime + segmentExpenditure + segmentExpenditure - activeTraversal.currentResource;
                nextResourceSupply = 0;
            }

            const updatedPathTrace = new Set(activeTraversal.pathTrace);
            updatedPathTrace.add(nextPosition);

            if (nextPosition === numNodes - 1) {
                const finalTripDuration = nextElapsedTime + levelMap.get(numNodes - 1) - nextResourceSupply;
                shortestCompletionTime = Math.min(shortestCompletionTime, finalTripDuration);
            } else {
                explorationQueue.push({
                    currentPosition: nextPosition,
                    elapsedTime: nextElapsedTime,
                    currentResource: nextResourceSupply,
                    pathTrace: updatedPathTrace
                });
            }
        }
    }

    return shortestCompletionTime === Infinity ? -1 : shortestCompletionTime;
}

const fullInputContent = sourceReader('/dev/stdin', 'utf8');
const processedSystemData = processRawData(fullInputContent);
const ultimateResult = computeMinimumDuration(processedSystemData);
console.log(ultimateResult);