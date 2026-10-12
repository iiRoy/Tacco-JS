function Main(inputDataString) {
    const lines = inputDataString.split("\n");

    const firstLineParts = lines[0].split(" ").map(val => parseInt(val, 10));
    const totalNodes = firstLineParts[0];
    const numEdges = firstLineParts[1];

    const adjacencyMatrix = Array(totalNodes).fill(0).map(() => Array(totalNodes).fill(0));

    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const currentEdgePair = lines[edgeIndex + 1].split(" ").map(val => parseInt(val, 10) - 1);
        const nodeA = currentEdgePair[0];
        const nodeB = currentEdgePair[1];
        adjacencyMatrix[nodeA][nodeB] = 1;
        adjacencyMatrix[nodeB][nodeA] = 1;
    }

    const calculateNodeDegree = (matrix, targetNodeIndex, graphNodeCount) => {
        let degreeSum = 0;
        for (let neighborIndex = 0; neighborIndex < graphNodeCount; neighborIndex++) {
            degreeSum += matrix[targetNodeIndex][neighborIndex];
        }
        return degreeSum;
    };

    let minDegreeValue = Infinity;
    let minDegreeNodeIndex = -1;

    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        const currentNodeDegree = calculateNodeDegree(adjacencyMatrix, nodeIndex, totalNodes);
        if (currentNodeDegree < minDegreeValue) {
            minDegreeValue = currentNodeDegree;
            minDegreeNodeIndex = nodeIndex;
        }
    }

    const connectedNodesGroup = [];
    const unconnectedNodesGroup = [];

    for (let partitionIndex = 0; partitionIndex < totalNodes; partitionIndex++) {
        if (partitionIndex === minDegreeNodeIndex) {
            continue;
        }
        if (adjacencyMatrix[minDegreeNodeIndex][partitionIndex] === 1) {
            connectedNodesGroup.push(partitionIndex);
        } else {
            unconnectedNodesGroup.push(partitionIndex);
        }
    }

    const checkIfSubsetFormsClique = (matrix, nodeSubset) => {
        const subsetSize = nodeSubset.length;
        for (let i = 0; i < subsetSize; i++) {
            for (let j = i + 1; j < subsetSize; j++) {
                const node1 = nodeSubset[i];
                const node2 = nodeSubset[j];
                if (matrix[node1][node2] === 0) {
                    return false;
                }
            }
        }
        return true;
    };

    if (!checkIfSubsetFormsClique(adjacencyMatrix, connectedNodesGroup)) {
        console.log(-1);
        return;
    }

    if (!checkIfSubsetFormsClique(adjacencyMatrix, unconnectedNodesGroup)) {
        console.log(-1);
        return;
    }

    const firstTerm = minDegreeValue * (minDegreeValue + 1) / 2;
    const remainingNodesCount = totalNodes - minDegreeValue - 1;
    const secondTerm = remainingNodesCount * (remainingNodesCount - 1) / 2;

    console.log(firstTerm + secondTerm);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
