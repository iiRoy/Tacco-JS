const dataStream = require('fs');
const acquiredText = Buffer.from(dataStream.readFileSync(0)).toString().split('\n');

function processGraphData() {
    let lineIterator = 0;

    const dimensions = acquiredText[lineIterator++].split(' ').map(Number);
    const nodeCount = dimensions[0];
    const linkCount = dimensions[1];

    const forwardConnections = new Map();
    const backwardConnections = new Map();
    const allLinks = [];

    for (let i = 0; i < nodeCount; i++) {
        forwardConnections.set(i, new Set());
        backwardConnections.set(i, new Set());
    }

    for (let i = 0; i < linkCount; i++) {
        const linkData = acquiredText[lineIterator++].split(' ').map(Number);
        const originNode = linkData[0] - 1;
        const destinationNode = linkData[1] - 1;

        forwardConnections.get(originNode).add(destinationNode);
        backwardConnections.get(destinationNode).add(originNode);
        allLinks.push({ first: originNode, second: destinationNode, identifier: i });
    }

    const pathLengthsCache = new Map();

    const calculateMaxPath = (currentNode) => {
        if (pathLengthsCache.has(currentNode)) {
            return pathLengthsCache.get(currentNode);
        }

        let currentMax = 0;
        const successors = forwardConnections.get(currentNode);
        if (successors && successors.size > 0) {
            for (const nextNode of successors) {
                currentMax = Math.max(currentMax, 1 + calculateMaxPath(nextNode));
            }
        }
        pathLengthsCache.set(currentNode, currentMax);
        return currentMax;
    };

    for (let i = 0; i < nodeCount; i++) {
        calculateMaxPath(i);
    }

    let overallMaximumLength = 0;
    for (let i = 0; i < nodeCount; i++) {
        overallMaximumLength = Math.max(overallMaximumLength, pathLengthsCache.get(i));
    }

    const uniquePathComponentNodes = new Set();
    const explorationStack = [];

    for (let i = 0; i < nodeCount; i++) {
        if (pathLengthsCache.get(i) === overallMaximumLength) {
            uniquePathComponentNodes.add(i);
            explorationStack.push(i);
        }
    }

    while (explorationStack.length > 0) {
        const currentVertex = explorationStack.pop();
        const predecessors = backwardConnections.get(currentVertex);
        if (predecessors) {
            for (const priorVertex of predecessors) {
                if (pathLengthsCache.get(priorVertex) + 1 === pathLengthsCache.get(currentVertex) &&
                    !uniquePathComponentNodes.has(priorVertex)) {
                    uniquePathComponentNodes.add(priorVertex);
                    explorationStack.push(priorVertex);
                }
            }
        }
    }

    const levelNodeCounts = new Map();
    for (let i = 0; i < nodeCount; i++) {
        if (uniquePathComponentNodes.has(i)) {
            const lengthAtNode = pathLengthsCache.get(i);
            if (lengthAtNode < overallMaximumLength) {
                levelNodeCounts.set(lengthAtNode, (levelNodeCounts.get(lengthAtNode) || 0) + 1);
            }
        }
    }

    let firstCriticalLinkFound = false;
    for (let i = 0; i < allLinks.length; i++) {
        const currentLink = allLinks[i];
        const linkOrigin = currentLink.first;
        const linkDestination = currentLink.second;

        const originPathLength = pathLengthsCache.get(linkOrigin);
        if (uniquePathComponentNodes.has(linkOrigin) &&
            uniquePathComponentNodes.has(linkDestination) &&
            levelNodeCounts.get(originPathLength) === 1) {
            console.log(currentLink.identifier + 1);
            firstCriticalLinkFound = true;
            break;
        }
    }

    if (!firstCriticalLinkFound) {
        console.log(-1);
    }
}

processGraphData();