function main(inputLines) {
    const START_NODE_INDEX = 0;
    let nodeCount, edgeCount;
    let adjacencyList;
    let maxDistances;
    const negativeInf = -100000000000000;

    const parseGraphDimensions = (lineContent) => {
        const parts = lineContent.split(" ");
        return {
            nodes: parseInt(parts[0]),
            edges: parseInt(parts[1])
        };
    };

    const parseEdgeDetails = (edgeString) => {
        const parts = edgeString.split(" ");
        return {
            source: parseInt(parts[0]) - 1,
            destination: parseInt(parts[1]) - 1,
            weight: parseInt(parts[2])
        };
    };

    const graphDimensions = parseGraphDimensions(inputLines[0]);
    nodeCount = graphDimensions.nodes;
    edgeCount = graphDimensions.edges;

    adjacencyList = new Array(nodeCount).fill(null).map(() => []);
    maxDistances = new Array(nodeCount).fill(negativeInf);
    maxDistances[START_NODE_INDEX] = 0;

    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        const edgeData = parseEdgeDetails(inputLines[1 + edgeIndex]);
        adjacencyList[edgeData.source].push([edgeData.destination, edgeData.weight]);
    }

    let bugReplication_t_value;

    for (let iterationCount = 0; iterationCount < nodeCount - 1; iterationCount++) {
        for (let currentNodeIndex = 0; currentNodeIndex < nodeCount; currentNodeIndex++) {
            if (maxDistances[currentNodeIndex] === negativeInf) {
                continue;
            }
            for (let outgoingEdgeIndex = 0; outgoingEdgeIndex < adjacencyList[currentNodeIndex].length; outgoingEdgeIndex++) {
                const currentEdge = adjacencyList[currentNodeIndex][outgoingEdgeIndex];
                const targetNodeIndex = currentEdge[0];
                const edgeWeight = currentEdge[1];
                const potentialNewDistance = maxDistances[currentNodeIndex] + edgeWeight;

                if (maxDistances[targetNodeIndex] < potentialNewDistance) {
                    maxDistances[targetNodeIndex] = potentialNewDistance;
                }
                bugReplication_t_value = targetNodeIndex;
            }
        }
    }

    let hasPositiveWeightCycleToTarget = false;
    const TARGET_NODE_FINAL_INDEX = nodeCount - 1;

    for (let cycleCheckIteration = 0; cycleCheckIteration < nodeCount; cycleCheckIteration++) {
        for (let currentNodeIndex = 0; currentNodeIndex < nodeCount; currentNodeIndex++) {
            if (maxDistances[bugReplication_t_value] === negativeInf) {
                continue;
            }

            for (let outgoingEdgeIndex = 0; outgoingEdgeIndex < adjacencyList[currentNodeIndex].length; outgoingEdgeIndex++) {
                const currentEdge = adjacencyList[currentNodeIndex][outgoingEdgeIndex];
                const targetNodeIndex = currentEdge[0];
                const edgeWeight = currentEdge[1];
                const potentialNewDistance = maxDistances[currentNodeIndex] + edgeWeight;

                if (maxDistances[targetNodeIndex] < potentialNewDistance) {
                    maxDistances[targetNodeIndex] = potentialNewDistance;
                    if (targetNodeIndex === TARGET_NODE_FINAL_INDEX) {
                        hasPositiveWeightCycleToTarget = true;
                        break;
                    }
                }
                bugReplication_t_value = targetNodeIndex;
            }
            if (hasPositiveWeightCycleToTarget) {
                break;
            }
        }
    }

    if (hasPositiveWeightCycleToTarget) {
        console.log("inf");
    } else {
        console.log(maxDistances[TARGET_NODE_FINAL_INDEX]);
    }
}

main(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
