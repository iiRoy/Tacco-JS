function createNetworkState(entityCount) {
    const parentReferences = new Array(entityCount);
    const componentMagnitudes = new Array(entityCount);
    for (let idx = 0; idx < entityCount; idx++) {
        parentReferences[idx] = idx;
        componentMagnitudes[idx] = 1;
    }
    return { links: parentReferences, magnitudes: componentMagnitudes };
}

function findRepresentative(entityIdentifier, componentSet) {
    let currentIdentifier = entityIdentifier;
    const visitedPath = [];
    while (componentSet.links[currentIdentifier] !== currentIdentifier) {
        visitedPath.push(currentIdentifier);
        currentIdentifier = componentSet.links[currentIdentifier];
    }
    for (const pathEntity of visitedPath) {
        componentSet.links[pathEntity] = currentIdentifier;
    }
    return currentIdentifier;
}

function areConnected(firstEntity, secondEntity, componentSet) {
    return findRepresentative(firstEntity, componentSet) === findRepresentative(secondEntity, componentSet);
}

function uniteComponents(firstEntity, secondEntity, componentSet) {
    const rootA = findRepresentative(firstEntity, componentSet);
    const rootB = findRepresentative(secondEntity, componentSet);

    if (rootA === rootB) {
        return;
    }

    if (componentSet.magnitudes[rootA] < componentSet.magnitudes[rootB]) {
        componentSet.links[rootA] = rootB;
        componentSet.magnitudes[rootB] += componentSet.magnitudes[rootA];
    } else {
        componentSet.links[rootB] = rootA;
        componentSet.magnitudes[rootA] += componentSet.magnitudes[rootB];
    }
}

function retrieveComponentSize(entityIdentifier, componentSet) {
    const rootIdentifier = findRepresentative(entityIdentifier, componentSet);
    return componentSet.magnitudes[rootIdentifier];
}

function parseInputData(rawData) {
    const lineSegments = rawData.trim().split('\n');
    const parameters = lineSegments[0].split(' ').map(Number);
    const connectionSegments = lineSegments.slice(1).map(segment => segment.split(' ').map(Number));
    return { elementCount: parameters[0], opCount: parameters[1], connections: connectionSegments };
}

function processNetworkQueries(rawData) {
    const parsedData = parseInputData(rawData);
    const totalElements = parsedData.elementCount;
    const operationCount = parsedData.opCount;
    const connectionsToProcess = parsedData.connections;

    const currentEntities = createNetworkState(totalElements);

    let disruptionMetric = (totalElements * (totalElements - 1)) / 2;
    const outputLog = new Array(operationCount + 1);
    outputLog[operationCount] = disruptionMetric;

    for (let k = operationCount - 1; k >= 0; k--) {
        const currentLink = connectionsToProcess[k];
        const first = currentLink[0] - 1;
        const second = currentLink[1] - 1;

        if (!areConnected(first, second, currentEntities)) {
            const sizeA = retrieveComponentSize(first, currentEntities);
            const sizeB = retrieveComponentSize(second, currentEntities);
            const pairReduction = sizeA * sizeB;
            disruptionMetric -= pairReduction;
        }
        outputLog[k] = disruptionMetric;
        uniteComponents(first, second, currentEntities);
    }

    for (let i = 1; i <= operationCount; i++) {
        console.log(outputLog[i]);
    }
}

processNetworkQueries(require('fs').readFileSync('/dev/stdin', 'utf8'));