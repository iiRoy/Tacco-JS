function processInput(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineValues = inputLines[0].split(" ").map(val => parseInt(val, 10));
    const totalNodes = firstLineValues[0];
    const totalEdges = firstLineValues[1];

    const sourceNodes = new Array(totalEdges);
    const destinationNodes = new Array(totalEdges);
    const edgeWeights = new Array(totalEdges);

    const nodeCoordinates = new Array(totalNodes).fill(0);

    const connectionMap = Array.from({ length: totalNodes }, () => []);

    let finalOutcome = "Yes";

    for (let edgeIndex = 0; edgeIndex < totalEdges; edgeIndex++) {
        const currentEdgeData = inputLines[edgeIndex + 1].split(" ").map(val => parseInt(val, 10));

        const startNode = currentEdgeData[0] - 1;
        const endNode = currentEdgeData[1] - 1;
        const weightValue = currentEdgeData[2];

        sourceNodes[edgeIndex] = startNode;
        destinationNodes[edgeIndex] = endNode;
        edgeWeights[edgeIndex] = weightValue;

        connectionMap[startNode].push(endNode, weightValue);
        connectionMap[endNode].push(startNode, -weightValue);
    }

    const updateNodeCoordinates = (currentNodeIdentifier, initialOffset, nodesToExploreQueue) => {
        let currentOffset = initialOffset;
        while (currentOffset >= 0) {
            const connectedNodeIdentifier = connectionMap[currentNodeIdentifier][currentOffset];
            const relativeWeight = connectionMap[currentNodeIdentifier][currentOffset + 1];

            if (connectionMap[connectedNodeIdentifier].length > 0) {
                nodesToExploreQueue.push(connectedNodeIdentifier);
            }

            nodeCoordinates[connectedNodeIdentifier] = nodeCoordinates[currentNodeIdentifier] + relativeWeight;
            currentOffset -= 2;
        }
        connectionMap[currentNodeIdentifier] = [];
    };

    for (let nodeIdentifier = 0; nodeIdentifier < totalNodes; nodeIdentifier++) {
        let initialConnectionOffset = connectionMap[nodeIdentifier].length - 2;
        const explorationQueue = [];

        if (initialConnectionOffset >= 0) {
            updateNodeCoordinates(nodeIdentifier, initialConnectionOffset, explorationQueue);
        }

        for (let queuePointer = 0; queuePointer < explorationQueue.length; queuePointer++) {
            const queuedNodeIdentifier = explorationQueue[queuePointer];
            let queuedNodeConnectionOffset = connectionMap[queuedNodeIdentifier].length - 2;

            if (queuedNodeConnectionOffset >= 0) {
                updateNodeCoordinates(queuedNodeIdentifier, queuedNodeConnectionOffset, explorationQueue);
            }
        }
    }

    for (let checkIndex = 0; checkIndex < totalEdges; checkIndex++) {
        const calculatedDifference = nodeCoordinates[destinationNodes[checkIndex]] - nodeCoordinates[sourceNodes[checkIndex]];
        const expectedDifference = edgeWeights[checkIndex];

        if (calculatedDifference !== expectedDifference) {
            finalOutcome = "No";
            break;
        }
    }

    console.log(finalOutcome);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
