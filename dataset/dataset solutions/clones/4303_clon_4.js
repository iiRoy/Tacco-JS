const sys = require('readline');

let allInputData = [];

const inputInterface = sys.createInterface({
    input: process.stdin,
    output: process.stdout
});

inputInterface.on('line', (lineContent) => {
    allInputData.push(lineContent);
});

const parseNumericLine = (lineContent) => {
    return lineContent.trim().split(' ').map(Number);
};

let linkageStructure;
let ringDiscoveries;
let pathTraversalHistory;
let pathVisitedRegistry;
let cycleComponentRegistry;

function explorePathSegments(currentPoint, pathTrace, startingPoint, graphLinks, discoveredRings, visitedSet) {
    pathTrace.push(currentPoint);
    visitedSet.add(currentPoint);

    const adjacentPoints = graphLinks.get(currentPoint) || new Set();
    for (const adjacentPoint of adjacentPoints) {
        if (adjacentPoint === startingPoint && pathTrace.length >= 3) {
            discoveredRings.push(pathTrace.slice(1).concat(startingPoint));
        } else if (!visitedSet.has(adjacentPoint)) {
            explorePathSegments(adjacentPoint, pathTrace, startingPoint, graphLinks, discoveredRings, visitedSet);
        }
    }

    visitedSet.delete(currentPoint);
    pathTrace.pop();
}

inputInterface.on('close', () => {
    const inputRows = allInputData;

    const graphDimensions = parseNumericLine(inputRows[0]);
    const totalNodes = graphDimensions[0];
    const totalConnections = graphDimensions[1];

    let initialConnectionPairs = [];
    for (let currentLine = 1; currentLine <= totalConnections; ++currentLine) {
        const connectionEntry = parseNumericLine(inputRows[currentLine]);
        initialConnectionPairs.push([connectionEntry[0] - 1, connectionEntry[1] - 1]);
    }

    linkageStructure = new Map();
    for (let nodeIdx = 0; nodeIdx < totalNodes; ++nodeIdx) {
        linkageStructure.set(nodeIdx, new Set());
    }
    for (const connection of initialConnectionPairs) {
        const firstNode = connection[0];
        const secondNode = connection[1];
        linkageStructure.get(firstNode).add(secondNode);
        linkageStructure.get(secondNode).add(firstNode);
    }

    ringDiscoveries = [];

    for (let currentInitiatorNode = 0; currentInitiatorNode < totalNodes; ++currentInitiatorNode) {
        pathTraversalHistory = [];
        pathVisitedRegistry = new Set();
        explorePathSegments(currentInitiatorNode, pathTraversalHistory, currentInitiatorNode, linkageStructure, ringDiscoveries, pathVisitedRegistry);
    }

    ringDiscoveries = ringDiscoveries.filter(ringPath => ringPath.length > 2);

    cycleComponentRegistry = new Set();

    for (const discoveredRingPath of ringDiscoveries) {
        for (let pathSegmentIndex = 0; pathSegmentIndex < discoveredRingPath.length; ++pathSegmentIndex) {
            const endpointA = discoveredRingPath[pathSegmentIndex];
            const endpointB = discoveredRingPath[(pathSegmentIndex + 1) % discoveredRingPath.length];
            const canonicalLink = endpointA < endpointB ? `${endpointA}-${endpointB}` : `${endpointB}-${endpointA}`;
            cycleComponentRegistry.add(canonicalLink);
        }
    }

    const remainingConnectionCount = initialConnectionPairs.filter(connectionPair => {
        const nodeOne = connectionPair[0];
        const nodeTwo = connectionPair[1];
        const canonicalCheck = nodeOne < nodeTwo ? `${nodeOne}-${nodeTwo}` : `${nodeTwo}-${nodeOne}`;
        return !cycleComponentRegistry.has(canonicalCheck);
    }).length;

    console.log(remainingConnectionCount);
});