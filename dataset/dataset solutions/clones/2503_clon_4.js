const { readFileSync: retrieveData } = require('fs');

const createInputProcessor = (rawContent) => {
    const dataSegments = rawContent.trim().split(/\s+/g);
    let currentPosition = 0;
    const extractNextString = () => dataSegments[currentPosition++];
    const extractNextNumber = () => parseInt(extractNextString(), 10);
    return { extractNextString, extractNextNumber };
};

const calculateConnectivity = (initialGraph) => {
    const nodeCount = initialGraph.length;
    let distanceMap = initialGraph.map(row => [...row]);

    for (let intermediate = 0; intermediate < nodeCount; intermediate++) {
        for (let source = 0; source < nodeCount; source++) {
            for (let destination = 0; destination < nodeCount; destination++) {
                const throughIntermediate = distanceMap[source][intermediate] + distanceMap[intermediate][destination];
                if (distanceMap[source][destination] > throughIntermediate) {
                    distanceMap[source][destination] = throughIntermediate;
                }
            }
        }
    }
    return distanceMap;
};

const executeAnalysis = (inputReader) => {
    const unboundedDistance = 100000000000;

    const numNodes = inputReader.extractNextNumber();
    const numEdges = inputReader.extractNextNumber();
    const costCap = inputReader.extractNextNumber();

    let pathMatrixA = Array.from({ length: numNodes }, (_, r) =>
        Array.from({ length: numNodes }, (_, c) => (r === c ? 0 : unboundedDistance))
    );

    for (let i = 0; i < numEdges; i++) {
        const u = inputReader.extractNextNumber() - 1;
        const v = inputReader.extractNextNumber() - 1;
        const w = inputReader.extractNextNumber();
        pathMatrixA[u][v] = w;
        pathMatrixA[v][u] = w;
    }

    const shortestPathsA = calculateConnectivity(pathMatrixA);

    let pathMatrixB = Array.from({ length: numNodes }, (_, r) =>
        Array.from({ length: numNodes }, (_, c) => {
            if (r === c) return 0;
            return shortestPathsA[r][c] <= costCap ? 1 : unboundedDistance;
        })
    );

    const shortestPathsB = calculateConnectivity(pathMatrixB);

    const numQueries = inputReader.extractNextNumber();
    const queryResults = [];

    for (let i = 0; i < numQueries; i++) {
        const start = inputReader.extractNextNumber() - 1;
        const end = inputReader.extractNextNumber() - 1;
        const distance = shortestPathsB[start][end];

        if (distance >= unboundedDistance) {
            queryResults.push(-1);
        } else {
            queryResults.push(distance - 1);
        }
    }

    console.log(queryResults.join('\n'));
};

executeAnalysis(createInputProcessor(retrieveData('/dev/stdin', 'utf8')));