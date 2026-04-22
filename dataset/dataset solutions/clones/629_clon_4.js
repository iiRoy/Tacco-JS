const dataProcessor = (sourceDataText) => {
    const textSegments = sourceDataText.split('\n');

    const [firstLineParameters] = textSegments;
    const [nodeCountStr, edgeCountValStr, startingFuelStr] = firstLineParameters.split(' ');

    const nodeCount = parseInt(nodeCountStr, 10);
    const edgeCountVal = parseInt(edgeCountValStr, 10);
    const startingFuel = parseInt(startingFuelStr, 10);

    const vertexTowers = new Array(nodeCount);
    for (let idx = 0; idx < nodeCount; ++idx) {
        vertexTowers[idx] = parseInt(textSegments[idx + 1], 10);
    }

    const edgeConnections = new Map();
    for (let idx = 0; idx < nodeCount; ++idx) {
        edgeConnections.set(idx, []);
    }

    for (let idx = 0; idx < edgeCountVal; ++idx) {
        const connectionLine = textSegments[idx + nodeCount + 1];
        const [sourceNodeStr, targetNodeStr, weightValueStr] = connectionLine.split(' ');
        const sourceNode = parseInt(sourceNodeStr, 10) - 1;
        const targetNode = parseInt(targetNodeStr, 10) - 1;
        const weightValue = parseInt(weightValueStr, 10);

        edgeConnections.get(sourceNode).push({ destination: targetNode, cost: weightValue });
        edgeConnections.get(targetNode).push({ destination: sourceNode, cost: weightValue });
    }

    let lowestTime = Number.MAX_SAFE_INTEGER;

    const navigateGraph = (
        currentSpot,
        accumulatedDuration,
        currentFuelLevel,
        visitedPathNodes
    ) => {
        if (currentSpot === nodeCount - 1) {
            const finalTravelTime = accumulatedDuration + vertexTowers[nodeCount - 1] - currentFuelLevel;
            lowestTime = Math.min(lowestTime, finalTravelTime);
            return;
        }

        const outgoingLinks = edgeConnections.get(currentSpot) || [];
        for (const linkDetail of outgoingLinks) {
            const nextStop = linkDetail.destination;
            const linkWeight = linkDetail.cost;

            if (visitedPathNodes.includes(nextStop)) {
                continue;
            }

            if (vertexTowers[currentSpot] < linkWeight) {
                continue;
            }

            let newAccumulatedDuration, newFuelLevel;

            const nextVertexCapacityPlusLinkWeight = vertexTowers[nextStop] + linkWeight;

            if (nextVertexCapacityPlusLinkWeight < currentFuelLevel) {
                newAccumulatedDuration = accumulatedDuration + linkWeight + currentFuelLevel - nextVertexCapacityPlusLinkWeight;
                newFuelLevel = vertexTowers[nextStop];
            } else if (nextVertexCapacityPlusLinkWeight >= currentFuelLevel && currentFuelLevel >= linkWeight) {
                newAccumulatedDuration = accumulatedDuration + linkWeight;
                newFuelLevel = currentFuelLevel - linkWeight;
            } else {
                newAccumulatedDuration = accumulatedDuration + linkWeight + linkWeight - currentFuelLevel;
                newFuelLevel = 0;
            }

            navigateGraph(
                nextStop,
                newAccumulatedDuration,
                newFuelLevel,
                visitedPathNodes.concat(nextStop)
            );
        }
    };

    navigateGraph(0, 0, startingFuel, [0]);

    return lowestTime;
};

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const finalResult = dataProcessor(rawInputData);
console.log(finalResult);