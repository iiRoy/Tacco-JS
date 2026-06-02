module.exports = function(inputDataString) {
    function* tokenStreamProducer(sourceContent) {
        const dataTokens = sourceContent.split(/\s+/g).filter(Boolean);
        let currentPosition = 0;
        while (currentPosition < dataTokens.length) {
            yield dataTokens[currentPosition++];
        }
    }

    const inputIterator = tokenStreamProducer(inputDataString);

    const retrieveNextString = () => inputIterator.next().value;
    const retrieveNextInteger = () => parseInt(retrieveNextString(), 10);

    const totalNodes = retrieveNextInteger();

    const graphConnections = new Map();
    for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
        graphConnections.set(nodeIndex, []);
    }

    for (let edgeCounter = 0; edgeCounter < totalNodes - 1; edgeCounter++) {
        const firstNode = retrieveNextInteger() - 1;
        const secondNode = retrieveNextInteger() - 1;
        const connectionWeight = retrieveNextInteger();

        graphConnections.get(firstNode).push({ destination: secondNode, cost: connectionWeight });
        graphConnections.get(secondNode).push({ destination: firstNode, cost: connectionWeight });
    }

    const numberOfQueries = retrieveNextInteger();
    const initialNode = retrieveNextInteger() - 1;

    const pathCosts = new Map();
    const traversalQueue = [{ nodeIdentifier: initialNode, accumulatedCost: 0 }];
    pathCosts.set(initialNode, 0);

    let queuePointer = 0;
    while (queuePointer < traversalQueue.length) {
        const { nodeIdentifier: currentNode, accumulatedCost: currentTotalCost } = traversalQueue[queuePointer++];

        const adjacentEdges = graphConnections.get(currentNode) || [];
        for (const edgeDetails of adjacentEdges) {
            const connectedNode = edgeDetails.destination;
            const edgeValue = edgeDetails.cost;

            if (!pathCosts.has(connectedNode)) {
                const newTotalCost = currentTotalCost + edgeValue;
                pathCosts.set(connectedNode, newTotalCost);
                traversalQueue.push({ nodeIdentifier: connectedNode, accumulatedCost: newTotalCost });
            }
        }
    }

    for (let queryIndex = 0; queryIndex < numberOfQueries; queryIndex++) {
        const queryNodeX = retrieveNextInteger() - 1;
        const queryNodeY = retrieveNextInteger() - 1;

        const costToX = pathCosts.get(queryNodeX);
        const costToY = pathCosts.get(queryNodeY);

        console.log(costToX + costToY);
    }
};
