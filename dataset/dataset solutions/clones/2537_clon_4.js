const parseGraphData = (rawTextContent) => {
    const allLines = rawTextContent.split(/\r?\n/).filter(Boolean);
    
    const [dimensionsLine, ...edgeSpecificationLines] = allLines;
    
    const [nodeCountStr] = dimensionsLine.split(' ');
    const totalNodeCount = parseInt(nodeCountStr, 10);

    const outgoingConnections = new Map();
    for (let currentVertexId = 1; currentVertexId <= totalNodeCount; ++currentVertexId) {
        outgoingConnections.set(currentVertexId, new Set());
    }

    edgeSpecificationLines.forEach(lineOfEdge => {
        const [sourceNodeStr, targetNodeStr] = lineOfEdge.split(' ');
        const sourceNode = parseInt(sourceNodeStr, 10);
        const targetNode = parseInt(targetNodeStr, 10);
        
        if (outgoingConnections.has(sourceNode)) {
            outgoingConnections.get(sourceNode).add(targetNode);
        }
    });

    return { totalNodeCount, outgoingConnections };
};

const findSmallestCycle = (graphSize, graphAdjacency) => {
    let minimumCyclePath = null;
    let minimumCycleEdgeCount = Infinity;

    for (let entryPoint = 1; entryPoint <= graphSize; ++entryPoint) {
        if (!graphAdjacency.has(entryPoint)) continue; 

        const explorationQueue = [];
        explorationQueue.push(entryPoint);

        const distanceToNode = new Map();
        distanceToNode.set(entryPoint, 0);

        const pathPredecessor = new Map();

        let queueHeadIndex = 0;
        while (queueHeadIndex < explorationQueue.length) {
            const currentNode = explorationQueue[queueHeadIndex++];
            const currentDistance = distanceToNode.get(currentNode);

            if (currentDistance >= minimumCycleEdgeCount) {
                continue;
            }

            const adjacentNodes = graphAdjacency.get(currentNode);
            if (!adjacentNodes) continue;

            for (const neighborNode of adjacentNodes) {
                const newPathDistance = currentDistance + 1;

                if (neighborNode === entryPoint) {
                    if (newPathDistance < minimumCycleEdgeCount) {
                        minimumCycleEdgeCount = newPathDistance;
                        
                        const reconstructedPath = [];
                        let tempNodeForPath = currentNode;
                        while (tempNodeForPath !== entryPoint) {
                            reconstructedPath.unshift(tempNodeForPath);
                            tempNodeForPath = pathPredecessor.get(tempNodeForPath);
                        }
                        reconstructedPath.unshift(entryPoint);
                        reconstructedPath.push(entryPoint);
                        
                        minimumCyclePath = reconstructedPath.slice(1); 
                    }
                } else {
                    if (!distanceToNode.has(neighborNode) || newPathDistance < distanceToNode.get(neighborNode)) {
                        distanceToNode.set(neighborNode, newPathDistance);
                        pathPredecessor.set(neighborNode, currentNode);
                        explorationQueue.push(neighborNode);
                    }
                }
            }
        }
    }

    return minimumCyclePath;
};

const generateOutputString = (finalPath) => {
    if (finalPath === null) {
        return "-1";
    }
    return `${finalPath.length}\n${finalPath.join("\n")}`;
};

const runProblemSolver = (rawData) => {
    const { totalNodeCount, outgoingConnections } = parseGraphData(rawData);
    const detectedCycle = findSmallestCycle(totalNodeCount, outgoingConnections);
    console.log(generateOutputString(detectedCycle));
};

runProblemSolver(require("fs").readFileSync("/dev/stdin", "utf8"));