const _reader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let _accumulator = [];

_reader.on('line', (line) => {
    _accumulator.push(line);
});

_reader.on('close', () => {
    _executeLogic(_accumulator);
});

const _numArrayParser = (textualData) => {
    return textualData.trim().split(' ').map(Number);
};

const _edgeIdentifier = (vertex1, vertex2) => {
    return vertex1 < vertex2 ? `${vertex1}-${vertex2}` : `${vertex2}-${vertex1}`;
};

function _executeLogic(allInputLines) {
    const firstLineValues = _numArrayParser(allInputLines[0]);
    const nodeCount = firstLineValues[0];
    const connectionCount = firstLineValues[1];

    let initialConnections = [];
    const adjacencyStructure = new Map();

    for (let j = 1; j <= connectionCount; ++j) {
        const currentEdge = _numArrayParser(allInputLines[j]);
        const startNode = currentEdge[0] - 1;
        const endNode = currentEdge[1] - 1;

        initialConnections.push([startNode, endNode]);

        if (!adjacencyStructure.has(startNode)) {
            adjacencyStructure.set(startNode, new Set());
        }
        if (!adjacencyStructure.has(endNode)) {
            adjacencyStructure.set(endNode, new Set());
        }
        adjacencyStructure.get(startNode).add(endNode);
        adjacencyStructure.get(endNode).add(startNode);
    }

    let discoveredClosedPaths = [];

    const _recursePathDiscovery = (startPoint, currentPaths, levelVisitationMap) => {
        if (currentPaths.length === 0) {
            return;
        }

        const nextGenerationPaths = [];
        levelVisitationMap.set(startPoint, true);

        currentPaths.forEach(pathSegment => {
            const pathEndNode = pathSegment[pathSegment.length - 1];
            const potentialNextNodes = adjacencyStructure.get(pathEndNode) || new Set();

            potentialNextNodes.forEach(candidateNode => {
                const isCandidateInCurrentSegment = pathSegment.includes(candidateNode);
                const isCandidateSameAsPathEnd = candidateNode === pathEndNode;
                const isCandidateVisitedThisLevel = levelVisitationMap.has(candidateNode);
                const isCandidateStartPoint = candidateNode === startPoint;

                if (!isCandidateInCurrentSegment && !isCandidateSameAsPathEnd && (!isCandidateVisitedThisLevel || isCandidateStartPoint)) {
                    levelVisitationMap.set(candidateNode, true);
                    const extendedSegment = [...pathSegment, candidateNode];

                    if (isCandidateStartPoint) {
                        discoveredClosedPaths.push(extendedSegment);
                    } else {
                        nextGenerationPaths.push(extendedSegment);
                    }
                }
            });
        });

        _recursePathDiscovery(startPoint, nextGenerationPaths, levelVisitationMap);
    };

    for (let currentVertex = 0; currentVertex < nodeCount; ++currentVertex) {
        const initialSegments = Array.from(adjacencyStructure.get(currentVertex) || new Set())
                                .map(neighbor => [neighbor]);
        const levelSpecificVisited = new Map();
        _recursePathDiscovery(currentVertex, initialSegments, levelSpecificVisited);
    }

    const validCycles = discoveredClosedPaths.filter(path => path.length > 2);

    const edgesToRemove = new Set();

    validCycles.forEach(cyclePath => {
        for (let k = 0; k < cyclePath.length; ++k) {
            const currentVertex = cyclePath[k];
            const nextVertex = cyclePath[(k + 1) % cyclePath.length];
            edgesToRemove.add(_edgeIdentifier(currentVertex, nextVertex));
        }
    });

    const remainingConnectionCount = initialConnections.filter(conn => {
        return !edgesToRemove.has(_edgeIdentifier(conn[0], conn[1]));
    }).length;

    console.log(remainingConnectionCount);
}