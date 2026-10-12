const fileSystemAccess = require('fs');

const createInputTokenStream = (rawTextContent) => {
    const dataSegments = rawTextContent.trim().split(/\s+/g);
    let currentSegmentIndex = 0;

    const retrieveNextSegment = () => {
        if (currentSegmentIndex >= dataSegments.length) {
            throw new Error("Input stream exhausted: Attempted to read beyond available tokens.");
        }
        return dataSegments[currentSegmentIndex++];
    };

    return {
        fetchStringToken: retrieveNextSegment,
        fetchIntegerToken: () => parseInt(retrieveNextSegment(), 10),
        resetStreamCursor: () => { currentSegmentIndex = 0; }
    };
};

const computeShortestPathDistances = (startingVertex, graphAdjacencyStructure, totalVertexCount) => {
    const distances = new Array(totalVertexCount).fill(-1);
    const traversalQueue = [];
    
    traversalQueue.push({ vertexId: startingVertex, pathLength: 0 });
    distances[startingVertex] = 0;

    let queueHeadPointer = 0;

    while (queueHeadPointer < traversalQueue.length) {
        const { vertexId: currentVertex, pathLength: currentPathLength } = traversalQueue[queueHeadPointer++];

        for (const neighborVertex of graphAdjacencyStructure[currentVertex]) {
            if (distances[neighborVertex] === -1) {
                distances[neighborVertex] = currentPathLength + 1;
                traversalQueue.push({ vertexId: neighborVertex, pathLength: currentPathLength + 1 });
            }
        }
    }
    return distances;
};

try {
    const rawInputData = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');
    const inputProcessor = createInputTokenStream(rawInputData);

    const totalGraphNodes = inputProcessor.fetchIntegerToken();
    const bobStartNode = inputProcessor.fetchIntegerToken() - 1;
    const aliceStartNode = inputProcessor.fetchIntegerToken() - 1;

    const graphAdjacencyList = Array.from({ length: totalGraphNodes }, () => []);

    for (let edgeCounter = 0; edgeCounter < totalGraphNodes - 1; edgeCounter++) {
        const nodeOne = inputProcessor.fetchIntegerToken() - 1;
        const nodeTwo = inputProcessor.fetchIntegerToken() - 1;
        graphAdjacencyList[nodeOne].push(nodeTwo);
        graphAdjacencyList[nodeTwo].push(nodeOne);
    }

    const bobShortestPaths = computeShortestPathDistances(bobStartNode, graphAdjacencyList, totalGraphNodes);
    const aliceShortestPaths = computeShortestPathDistances(aliceStartNode, graphAdjacencyList, totalGraphNodes);

    const { maxBobAdvantageDistance, minMeetingPointDistance, foundMeetingPoint } = Array.from({ length: totalGraphNodes }).reduce((accumulator, _, nodeIndex) => {
        const bobDistance = bobShortestPaths[nodeIndex];
        const aliceDistance = aliceShortestPaths[nodeIndex];

        if (bobDistance !== -1 && aliceDistance !== -1) {
            if (bobDistance < aliceDistance) {
                accumulator.maxBobAdvantageDistance = Math.max(accumulator.maxBobAdvantageDistance, bobDistance);
            } else if (bobDistance === aliceDistance) {
                accumulator.foundMeetingPoint = true;
                accumulator.minMeetingPointDistance = Math.min(accumulator.minMeetingPointDistance, bobDistance);
            }
        }
        return accumulator;
    }, { maxBobAdvantageDistance: 0, minMeetingPointDistance: Infinity, foundMeetingPoint: false });

    const finalOutputValue = foundMeetingPoint
        ? Math.max(maxBobAdvantageDistance, minMeetingPointDistance)
        : maxBobAdvantageDistance;

    console.log(finalOutputValue);

} catch (executionError) {
    throw executionError;
}
