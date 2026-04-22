const performTreeCalculation = () => {
    const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    let inputTokens = rawInputContent.trim().split(/\s+/);
    let tokenPointer = 0;

    const retrieveNumericValue = () => Number(inputTokens[tokenPointer++]);
    const fetchNumericList = (count) => Array.from({ length: count }, retrieveNumericValue);

    const numberOfNodes = retrieveNumericValue();
    const nodeDataValues = fetchNumericList(numberOfNodes);

    const nodeConnections = new Map();
    for (let i = 0; i < numberOfNodes; ++i) {
        nodeConnections.set(i, []);
    }

    for (let i = 0; i < numberOfNodes - 1; ++i) {
        const uIdentifier = retrieveNumericValue() - 1;
        const vIdentifier = retrieveNumericValue() - 1;
        nodeConnections.get(uIdentifier).push(vIdentifier);
        nodeConnections.get(vIdentifier).push(uIdentifier);
    }

    const calculatedOutcomes = new Array(numberOfNodes).fill(0);
    const currentPathLIS = [0]; // Sentinel value, assuming nodeDataValues are non-negative

    const findCeilingIndex = (sortedCollection, targetElement) => {
        let lowBoundary = 0;
        let highBoundary = sortedCollection.length;
        while (lowBoundary < highBoundary) {
            const midPoint = Math.floor((lowBoundary + highBoundary) / 2);
            if (sortedCollection[midPoint] < targetElement) {
                lowBoundary = midPoint + 1;
            } else {
                highBoundary = midPoint;
            }
        }
        return lowBoundary;
    };

    const traverseGraph = (currentNode, parentNode) => {
        const valueAtCurrentNode = nodeDataValues[currentNode];
        const insertionPoint = findCeilingIndex(currentPathLIS, valueAtCurrentNode);

        let previousValueAtPoint = undefined;
        let pathExtended = false;

        if (insertionPoint === currentPathLIS.length) {
            currentPathLIS.push(valueAtCurrentNode);
            pathExtended = true;
        } else {
            previousValueAtPoint = currentPathLIS[insertionPoint];
            currentPathLIS[insertionPoint] = valueAtCurrentNode;
        }

        calculatedOutcomes[currentNode] = currentPathLIS.length - 1;

        for (const connectedNeighbor of nodeConnections.get(currentNode)) {
            if (connectedNeighbor !== parentNode) {
                traverseGraph(connectedNeighbor, currentNode);
            }
        }

        if (pathExtended) {
            currentPathLIS.pop();
        } else {
            currentPathLIS[insertionPoint] = previousValueAtPoint;
        }
    };

    traverseGraph(0, -1); // Initiate traversal from node 0, with no parent (-1)

    return calculatedOutcomes.join('\n');
};

process.stdout.write(performTreeCalculation() + '\n');