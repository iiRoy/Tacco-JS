let inputLines = [];
let lineIndex = 0;
const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});
inputReader.on('line', (line) => { inputLines.push(line); });
inputReader.on('close', () => {
    processCalculation();
    process.exit(0);
});

function retrieveNextLine() {
    if (lineIndex < inputLines.length) {
        return inputLines[lineIndex++];
    }
    throw new Error('End of input data reached.');
}

function extractNumericArray() {
    return retrieveNextLine().split(' ').map(Number);
}

function emitResult(value) {
    console.log(value);
}

const PRIME_MODULUS = 1000000007;

function processCalculation() {
    const initialParameters = extractNumericArray();
    const totalNodes = initialParameters[0];
    const availableColors = initialParameters[1];

    const graphAdjacency = new Map();

    for (let i = 0; i < totalNodes; i++) {
        graphAdjacency.set(i, []);
    }

    for (let i = 0; i < totalNodes - 1; i++) {
        const connection = extractNumericArray();
        const nodeA = connection[0] - 1;
        const nodeB = connection[1] - 1;
        graphAdjacency.get(nodeA).push(nodeB);
        graphAdjacency.get(nodeB).push(nodeA);
    }

    graphAdjacency.forEach(connections => connections.sort((a, b) => a - b));

    const pathTraversalTracker = new Set();

    const finalCalculatedProduct = determineColoringWays(
        0,
        -1,
        availableColors,
        availableColors,
        graphAdjacency,
        pathTraversalTracker
    );

    emitResult(finalCalculatedProduct);
}

function determineColoringWays(
    currentVertex,
    previousVertex,
    currentVertexColorOptions,
    overallColorLimit,
    adjacencyStructure,
    visitedTracker
) {
    visitedTracker.add(currentVertex);

    let ancestorConstraintCount = 0;
    if (previousVertex === -1) {
        ancestorConstraintCount = 1;
    } else {
        ancestorConstraintCount = 2;
    }

    let subtreeProduct = currentVertexColorOptions;

    let childProcessingOrder = 0;
    const neighborsOfCurrent = adjacencyStructure.get(currentVertex) || [];

    const eligibleChildren = neighborsOfCurrent.filter(
        neighbor => !visitedTracker.has(neighbor)
    ).sort((a, b) => a - b);

    for (const childNode of eligibleChildren) {
        const childNodeColorOptions =
            overallColorLimit - childProcessingOrder - ancestorConstraintCount;

        const childSubtreeResult = determineColoringWays(
            childNode,
            currentVertex,
            childNodeColorOptions,
            overallColorLimit,
            adjacencyStructure,
            visitedTracker
        );

        subtreeProduct = (subtreeProduct * childSubtreeResult) % PRIME_MODULUS;
        subtreeProduct = (subtreeProduct + PRIME_MODULUS) % PRIME_MODULUS;
        
        childProcessingOrder++;
    }

    return (subtreeProduct + PRIME_MODULUS) % PRIME_MODULUS;
}