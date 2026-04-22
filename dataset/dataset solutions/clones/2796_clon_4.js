const retrieveNumericSequence = () => nextIntArray();
const deliverResult = (content) => myout(content);

function ProcessGraphQuery() {
    const [nodeQuantity, connectionCount] = retrieveNumericSequence();

    const forwardConnections = new Map();
    for (let currentVertex = 0; currentVertex < nodeQuantity; ++currentVertex) {
        forwardConnections.set(currentVertex, []);
    }

    for (let edgeIndex = 0; edgeIndex < connectionCount; ++edgeIndex) {
        const [origin, terminus] = retrieveNumericSequence();
        forwardConnections.get(origin - 1).push(terminus - 1);
    }

    const threeStepPathsFromSource = new Map();

    for (let startNode = 0; startNode < nodeQuantity; ++startNode) {
        const firstStepNeighbors = forwardConnections.get(startNode);
        if (!firstStepNeighbors) continue;

        for (const intermediateNode1 of firstStepNeighbors) {
            const secondStepNeighbors = forwardConnections.get(intermediateNode1);
            if (!secondStepNeighbors) continue;

            for (const intermediateNode2 of secondStepNeighbors) {
                const thirdStepNeighbors = forwardConnections.get(intermediateNode2);
                if (!thirdStepNeighbors) continue;

                for (const finalDestination of thirdStepNeighbors) {
                    if (!threeStepPathsFromSource.has(startNode)) {
                        threeStepPathsFromSource.set(startNode, new Set());
                    }
                    threeStepPathsFromSource.get(startNode).add(finalDestination);
                }
            }
        }
    }

    const threeStepPredecessorsToTarget = new Map();
    for (const [sourceNode, destinations] of threeStepPathsFromSource.entries()) {
        for (const targetNode of destinations) {
            if (!threeStepPredecessorsToTarget.has(targetNode)) {
                threeStepPredecessorsToTarget.set(targetNode, new Set());
            }
            threeStepPredecessorsToTarget.get(targetNode).add(sourceNode);
        }
    }

    const [journeyStart, journeyEnd] = retrieveNumericSequence();
    const actualStart = journeyStart - 1;
    const actualEnd = journeyEnd - 1;

    const traversalQueue = [];
    const distanceToNode = new Map(); 

    traversalQueue.push(actualEnd);
    distanceToNode.set(actualEnd, 0);

    let shortestSegmentCount = -1;

    let queueHeadPointer = 0;
    while (queueHeadPointer < traversalQueue.length) {
        const currentPosition = traversalQueue[queueHeadPointer++];
        const currentSegmentDistance = distanceToNode.get(currentPosition);

        if (currentPosition === actualStart) {
            shortestSegmentCount = currentSegmentDistance;
            break;
        }

        const predecessors = threeStepPredecessorsToTarget.get(currentPosition) || new Set();
        for (const priorPosition of predecessors) {
            if (!distanceToNode.has(priorPosition)) {
                distanceToNode.set(priorPosition, currentSegmentDistance + 1);
                traversalQueue.push(priorPosition);
            }
        }
    }

    deliverResult(shortestSegmentCount);
}