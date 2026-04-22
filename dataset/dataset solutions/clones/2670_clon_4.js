const fileSystem = require('node:fs');

const rawDataString = fileSystem.readFileSync('/dev/stdin', 'utf8');

const [headerLine, ...edgeSpecificationLines] = rawDataString.trim().split('\n');

const [
    totalNodesInGraph,
    ,
    penaltyPerSegment
] = headerLine.split(' ').map(Number);

const networkLinkages = new Map();
edgeSpecificationLines.forEach(line => {
    const [sourceNode, destinationNode, connectionValue] = line.split(' ').map(Number);
    if (!networkLinkages.has(sourceNode)) {
        networkLinkages.set(sourceNode, []);
    }
    networkLinkages.get(sourceNode).push({ targetIdentifier: destinationNode, edgeWorth: connectionValue });
});

let maximumAttainableValue = -1;

const exploreRoutes = (
    currentPosition,
    traversedPathElements,
    currentPathAccumulatedValue,
    segmentsTraversedCount
) => {
    if (currentPosition === totalNodesInGraph) {
        const calculatedPathScore = currentPathAccumulatedValue - penaltyPerSegment * (segmentsTraversedCount + 1);
        maximumAttainableValue = Math.max(maximumAttainableValue, calculatedPathScore);
    }

    const outboundConnections = networkLinkages.get(currentPosition) || [];

    for (const { targetIdentifier: nextPosition, edgeWorth: segmentWorth } of outboundConnections) {
        if (!traversedPathElements.has(nextPosition)) {
            const updatedTraversedPathElements = new Set(traversedPathElements);
            updatedTraversedPathElements.add(nextPosition);

            exploreRoutes(
                nextPosition,
                updatedTraversedPathElements,
                currentPathAccumulatedValue + segmentWorth,
                segmentsTraversedCount + 1
            );
        }
    }
};

exploreRoutes(1, new Set([1]), 0, 0);

console.log(maximumAttainableValue);