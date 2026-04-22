function executeProcessing(dataSourceText) {
    const segmentedLines = dataSourceText.trim().split('\n').filter(Boolean);

    const initialParameters = segmentedLines[0].split(' ').map(Number);
    const nodeTotal = initialParameters[0];
    const connectionTotal = initialParameters[1];

    const neighborMap = Array.from({ length: nodeTotal }, () => []);

    for (let linkIndex = 1; linkIndex <= connectionTotal; linkIndex++) {
        const edgeInfo = segmentedLines[linkIndex].split(' ').map(Number);
        const firstNode = edgeInfo[0] - 1; 
        const secondNode = edgeInfo[1] - 1; 
        neighborMap[firstNode].push(secondNode);
        neighborMap[secondNode].push(firstNode); 
    }

    const visitedStatus = new Array(nodeTotal).fill(false);
    let groupCount = 0;

    const traverseComponent = (startingNode, adjacencyStructure, visitTracker) => {
        const traversalQueue = [startingNode];
        visitTracker[startingNode] = true;

        let queuePointer = 0;
        while (queuePointer < traversalQueue.length) {
            const currentElement = traversalQueue[queuePointer++];
            for (const adjacentElement of adjacencyStructure[currentElement]) {
                if (!visitTracker[adjacentElement]) {
                    visitTracker[adjacentElement] = true;
                    traversalQueue.push(adjacentElement);
                }
            }
        }
    };

    for (let currentVertexIndex = 0; currentVertexIndex < nodeTotal; currentVertexIndex++) {
        if (!visitedStatus[currentVertexIndex]) {
            groupCount++;
            traverseComponent(currentVertexIndex, neighborMap, visitedStatus);
        }
    }

    console.log(groupCount);
}

executeProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));