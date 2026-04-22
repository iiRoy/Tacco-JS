(function graphProcessor() {
    const dataOrigin = require('fs').readFileSync('/dev/stdin', 'utf8');
    const dataFragments = dataOrigin.trim().split('\n');

    const totalElements = Number(dataFragments[0]);
    const connectionNetwork = new Map();

    dataFragments.slice(1).forEach((segment, elementIndex) => {
        const elementDetails = segment.split(' ').map(Number);
        const connectedElements = elementDetails.slice(2); 

        const currentSourceElement = elementIndex; 
        const targetElements = new Set(connectedElements.map(targetId => targetId - 1));
        connectionNetwork.set(currentSourceElement, targetElements);
    });

    const reachDepths = determineReachability(connectionNetwork, 0);

    for (let elementIdentifier = 0; elementIdentifier < totalElements; elementIdentifier++) {
        const reportedDepth = reachDepths.has(elementIdentifier) ? reachDepths.get(elementIdentifier) : -1;
        console.log(elementIdentifier + 1, reportedDepth);
    }
})();

function determineReachability(topologyMap, initialVertex) {
    const depthRecords = new Map();
    const discoveredVertices = new Set();
    let currentLevelFrontier = new Set([initialVertex]);
    let levelCounter = 0;

    depthRecords.set(initialVertex, levelCounter);
    discoveredVertices.add(initialVertex);

    while (currentLevelFrontier.size > 0) {
        levelCounter++;
        const nextLevelFrontier = new Set();

        for (const activeVertex of currentLevelFrontier) {
            const adjacentVertices = topologyMap.get(activeVertex) || new Set();
            for (const neighborVertex of adjacentVertices) {
                if (!discoveredVertices.has(neighborVertex)) {
                    discoveredVertices.add(neighborVertex);
                    depthRecords.set(neighborVertex, levelCounter);
                    nextLevelFrontier.add(neighborVertex);
                }
            }
        }
        currentLevelFrontier = nextLevelFrontier;
    }
    return depthRecords;
}