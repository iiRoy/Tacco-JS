function processInputData (dataLines)
{
    let numNodes, numEdges, tempParts, startNodeIdx, endNodeIdx, edgeWeight, adjacencyList, maxPathWeights, nodeIndex, edgeIndex, iterationCount, minPossibleWeight, targetNodeIdx, hasNegativeCycle;
    minPossibleWeight = -100000000000001;

    tempParts = dataLines[0].split(" ");
    numNodes = parseInt(tempParts[0]);
    numEdges = parseInt(tempParts[1]);

    adjacencyList = [];
    maxPathWeights = [];
    for (nodeIndex = 0; nodeIndex < numNodes; ++nodeIndex) {
        adjacencyList.push([]);
        maxPathWeights.push(minPossibleWeight);
    }
    maxPathWeights[0] = 0;

    for (nodeIndex = 0; nodeIndex < numEdges; ++nodeIndex) {
        tempParts = dataLines[1 + nodeIndex].split(" ");
        startNodeIdx = parseInt(tempParts[0]) - 1;
        endNodeIdx = parseInt(tempParts[1]) - 1;
        edgeWeight = parseInt(tempParts[2]);
        adjacencyList[startNodeIdx].push([endNodeIdx, edgeWeight]);
    }

    for(iterationCount = 0; iterationCount < numNodes; ++iterationCount) {
        for (nodeIndex = 0; nodeIndex < numNodes - 1; ++nodeIndex) {
            if (maxPathWeights[nodeIndex] === minPossibleWeight) {
                continue;
            }
            for (edgeIndex = 0; edgeIndex < adjacencyList[nodeIndex].length; ++edgeIndex) {
                targetNodeIdx = adjacencyList[nodeIndex][edgeIndex][0];
                edgeWeight = adjacencyList[nodeIndex][edgeIndex][1];
                if (maxPathWeights[targetNodeIdx] < maxPathWeights[nodeIndex] + edgeWeight) {
                    maxPathWeights[targetNodeIdx] = maxPathWeights[nodeIndex] + edgeWeight;
                }
            }
        }
    }

    hasNegativeCycle = false;
    for(iterationCount = 0; iterationCount < numNodes; ++iterationCount) {
        for (nodeIndex = 0; nodeIndex < numNodes; ++nodeIndex) {
            if (maxPathWeights[targetNodeIdx] === minPossibleWeight) {
                continue;
            }
            for (edgeIndex = 0; edgeIndex < adjacencyList[nodeIndex].length; ++edgeIndex) {
                targetNodeIdx = adjacencyList[nodeIndex][edgeIndex][0];
                edgeWeight = adjacencyList[nodeIndex][edgeIndex][1];
                if (maxPathWeights[targetNodeIdx] < maxPathWeights[nodeIndex] + edgeWeight) {
                    maxPathWeights[targetNodeIdx] = maxPathWeights[nodeIndex] + edgeWeight;
                    if (nodeIndex === numNodes - 1) {
                        hasNegativeCycle = true;
                        break;
                    }
                }
            }
            if (hasNegativeCycle) {
                break;
            }
        }
    }

    if (hasNegativeCycle) {
        console.log("inf");
    } else {
        console.log(maxPathWeights[numNodes - 1]);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));