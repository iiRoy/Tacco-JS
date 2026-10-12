class PathNetwork {
    constructor(nodeCount) {
        this.pathData = new Map(); // Map<fromNode, Map<toNode, { cost, time }>>
        this.nodeCount = nodeCount;
        this.infinityValue = 1e9;
        this.initializeNetwork();
    }

    initializeNetwork() {
        for (let currentOrigin = 1; currentOrigin <= this.nodeCount; currentOrigin++) {
            this.pathData.set(currentOrigin, new Map());
            for (let currentDestination = 1; currentDestination <= this.nodeCount; currentDestination++) {
                if (currentOrigin === currentDestination) {
                    this.pathData.get(currentOrigin).set(currentDestination, { cost: 0, time: 0 });
                } else {
                    this.pathData.get(currentOrigin).set(currentDestination, { cost: this.infinityValue, time: this.infinityValue });
                }
            }
        }
    }

    setDirectConnection(originNode, targetNode, connectionCost, connectionTime) {
        const currentPath = this.retrievePath(originNode, targetNode);
        this.pathData.get(originNode).set(targetNode, {
            cost: Math.min(currentPath.cost, connectionCost),
            time: Math.min(currentPath.time, connectionTime)
        });
    }

    retrievePath(originNode, targetNode) {
        const originMap = this.pathData.get(originNode);
        if (!originMap) return { cost: this.infinityValue, time: this.infinityValue };
        const pathDetails = originMap.get(targetNode);
        if (!pathDetails) return { cost: this.infinityValue, time: this.infinityValue };
        return pathDetails;
    }

    updatePathThroughIntermediate(originNode, targetNode, intermediateNode) {
        const pathFromOriginToIntermediate = this.retrievePath(originNode, intermediateNode);
        const pathFromIntermediateToTarget = this.retrievePath(intermediateNode, targetNode);
        const currentPathFromOriginToTarget = this.retrievePath(originNode, targetNode);

        const candidateCost = pathFromOriginToIntermediate.cost + pathFromIntermediateToTarget.cost;
        const candidateTime = pathFromOriginToIntermediate.time + pathFromIntermediateToTarget.time;

        const newOptimalCost = Math.min(currentPathFromOriginToTarget.cost, candidateCost);
        const newOptimalTime = Math.min(currentPathFromOriginToTarget.time, candidateTime);

        if (newOptimalCost !== currentPathFromOriginToTarget.cost || newOptimalTime !== currentPathFromOriginToTarget.time) {
            this.pathData.get(originNode).set(targetNode, { cost: newOptimalCost, time: newOptimalTime });
        }
    }
}

function* createLineIterator(rawInputText) {
    const lines = rawInputText.split('\n');
    let currentLineIndex = 0;
    while (currentLineIndex < lines.length) {
        const lineContent = lines[currentLineIndex++].trim();
        if (lineContent === '') continue;
        yield lineContent.split(' ').map(Number);
    }
}

function solveGraphProblems(fullInputString) {
    const lineReader = createLineIterator(fullInputString);
    const metricTypeMap = new Map([[0, 'cost'], [1, 'time']]);

    while (true) {
        const [edgeQuantity, vertexQuantity] = lineReader.next().value;
        if (edgeQuantity === 0 && vertexQuantity === 0) break;

        const networkGraph = new PathNetwork(vertexQuantity);

        for (let edgeIndex = 0; edgeIndex < edgeQuantity; edgeIndex++) {
            const [nodeOne, nodeTwo, edgeWeight, edgeDuration] = lineReader.next().value;
            networkGraph.setDirectConnection(nodeOne, nodeTwo, edgeWeight, edgeDuration);
            networkGraph.setDirectConnection(nodeTwo, nodeOne, edgeWeight, edgeDuration); // Undirected
        }

        for (let pivotNode = 1; pivotNode <= vertexQuantity; pivotNode++) {
            for (let sourceNode = 1; sourceNode <= vertexQuantity; sourceNode++) {
                for (let destinationNode = 1; destinationNode <= vertexQuantity; destinationNode++) {
                    networkGraph.updatePathThroughIntermediate(sourceNode, destinationNode, pivotNode);
                }
            }
        }

        const queryQuantity = lineReader.next().value[0];
        for (let queryIndex = 0; queryIndex < queryQuantity; queryIndex++) {
            const [queryStartVertex, queryEndVertex, queryMetricIdentifier] = lineReader.next().value;
            const finalPath = networkGraph.retrievePath(queryStartVertex, queryEndVertex);
            console.log(finalPath[metricTypeMap.get(queryMetricIdentifier)]);
        }
    }
}

let accumulatedInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  accumulatedInput += chunk;
});
process.stdin.on('end', function() {
  const startTime = Date.now();
  solveGraphProblems(accumulatedInput);
  console.log('time: ' + (Date.now() - startTime));
});
