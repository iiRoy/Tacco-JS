function evaluateLinkage(firstPointCoords, secondPointCoords) {
    const coordA_X = firstPointCoords[0];
    const coordA_Y = firstPointCoords[1];
    const coordB_X = secondPointCoords[0];
    const coordB_Y = secondPointCoords[1];

    const isDominated = (coordA_X > coordB_X && coordA_Y > coordB_Y);
    const isDominant = (coordA_X < coordB_X && coordA_Y < coordB_Y);

    return isDominated || isDominant;
}

function processDataStream(rawDataPayload) {
    const parsedLines = rawDataPayload.trim().split('\n');
    const entityCount = parseInt(parsedLines[0].split(' ')[0], 10);
    const spatialEntities = parsedLines.slice(1, entityCount + 1).map(lineText =>
        lineText.split(' ').map(numericVal => parseInt(numericVal, 10))
    );

    const connectionGraph = Array.from({ length: entityCount }, () => []);
    for (let currentEntityIdx = 0; currentEntityIdx < entityCount; currentEntityIdx++) {
        for (let otherEntityIdx = currentEntityIdx + 1; otherEntityIdx < entityCount; otherEntityIdx++) {
            if (evaluateLinkage(spatialEntities[currentEntityIdx], spatialEntities[otherEntityIdx])) {
                connectionGraph[currentEntityIdx].push(otherEntityIdx);
                connectionGraph[otherEntityIdx].push(currentEntityIdx);
            }
        }
    }

    const componentMeasures = [];

    for (let startingEntityIdx = 0; startingEntityIdx < entityCount; startingEntityIdx++) {
        const visitedEntities = new Set();
        const traversalQueue = [];
        let currentComponentSize = 0;

        traversalQueue.push(startingEntityIdx);
        visitedEntities.add(startingEntityIdx);

        while (traversalQueue.length > 0) {
            const activeEntity = traversalQueue.shift();
            currentComponentSize++;

            for (const neighborEntity of connectionGraph[activeEntity]) {
                if (!visitedEntities.has(neighborEntity)) {
                    visitedEntities.add(neighborEntity);
                    traversalQueue.push(neighborEntity);
                }
            }
        }
        componentMeasures[startingEntityIdx] = currentComponentSize;
    }

    console.log(componentMeasures.join('\n'));
}

processDataStream(require('fs').readFileSync('/dev/stdin', 'utf8'));