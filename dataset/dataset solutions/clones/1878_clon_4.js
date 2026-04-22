const readSystemInput = (rawText) => {
    const dataSegments = rawText.trim().split('\n');
    const firstLineParts = dataSegments[0].split(' ');
    const numVertices = parseInt(firstLineParts[0], 10);
    const numSteps = BigInt(firstLineParts[1]);
    const vertexDestinations = dataSegments[1].split(' ').map(val => parseInt(val, 10));
    return { numVertices, numSteps, vertexDestinations };
};

const computationEngine = (rawData) => {
    const { numVertices, numSteps, vertexDestinations } = readSystemInput(rawData);

    const MAX_JUMP_POWER = 60; // Sufficient for K up to 10^18 (approx 2^59.79)

    // jumpMatrix[p][v] stores the vertex reached after 2^p steps starting from vertex v (0-indexed)
    const jumpMatrix = Array.from({ length: MAX_JUMP_POWER + 1 }, () => Array(numVertices).fill(0));

    // Base case: 2^0 = 1 step
    // Convert 1-indexed destinations from input to 0-indexed for internal use
    for (let vtx = 0; vtx < numVertices; ++vtx) {
        jumpMatrix[0][vtx] = vertexDestinations[vtx] - 1;
    }

    // Precompute higher powers of 2 jumps using dynamic programming
    // jumpMatrix[p][v] = jumpMatrix[p-1][ jumpMatrix[p-1][v] ]
    for (let p = 1; p <= MAX_JUMP_POWER; ++p) {
        for (let vtx = 0; vtx < numVertices; ++vtx) {
            jumpMatrix[p][vtx] = jumpMatrix[p - 1][jumpMatrix[p - 1][vtx]];
        }
    }

    let finalVertex = 0; // Starting at vertex 0 (0-indexed)
    let remainingSteps = numSteps;

    // Traverse by powers of 2 to cover the total number of steps
    // If the p-th bit of remainingSteps is set, make a jump of 2^p steps
    for (let p = MAX_JUMP_POWER; p >= 0; --p) {
        if ((remainingSteps >> BigInt(p)) & 1n) { // Check if the p-th bit is set
            finalVertex = jumpMatrix[p][finalVertex];
        }
    }

    // Output the final vertex, converted back to 1-indexed
    console.log(finalVertex + 1);
};

computationEngine(require("node:fs").readFileSync("/dev/stdin", "utf8"));