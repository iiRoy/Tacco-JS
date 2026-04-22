function processGraphColoring(sourceText) {
    const parsedLines = sourceText.split('\n');
    const totalNodes = Number(parsedLines[0]);
    const modulusConstant = 1000000007;

    const nodeConnections = new Map();
    for (let current = 0; current < totalNodes; ++current) {
        nodeConnections.set(current, []);
    }

    for (let currentLineIndex = 1; currentLineIndex < totalNodes; ++currentLineIndex) {
        const endpoints = parsedLines[currentLineIndex].split(' ').map(Number);
        const nodeA = endpoints[0] - 1;
        const nodeB = endpoints[1] - 1;

        nodeConnections.get(nodeA).push(nodeB);
        nodeConnections.get(nodeB).push(nodeA);
    }

    function calculateSubtreeColorings(
        currentVertexId,
        parentVertexId,
        graphAdjacency,
        moduloValue
    ) {
        let waysForWhiteRoot = 1;
        let waysForBlackRoot = 1;

        const neighbors = graphAdjacency.get(currentVertexId) || [];
        for (const neighborId of neighbors) {
            if (neighborId === parentVertexId) {
                continue;
            }

            const [childWhiteWays, childBlackWays] = calculateSubtreeColorings(
                neighborId,
                currentVertexId,
                graphAdjacency,
                moduloValue
            );

            const childTotalOptions = (childWhiteWays + childBlackWays) % moduloValue;
            const effectiveChildTotalOptions = childTotalOptions === 0 ? 1 : childTotalOptions;

            const childWhiteOptions = childWhiteWays % moduloValue;
            const effectiveChildWhiteOptions = childWhiteOptions === 0 ? 1 : childWhiteOptions;

            waysForWhiteRoot = (waysForWhiteRoot * effectiveChildTotalOptions) % moduloValue;
            waysForBlackRoot = (waysForBlackRoot * effectiveChildWhiteOptions) % moduloValue;
        }

        return [waysForWhiteRoot, waysForBlackRoot];
    }

    const [rootWhiteWays, rootBlackWays] = calculateSubtreeColorings(
        0,
        -1,
        nodeConnections,
        modulusConstant
    );

    const overallResult = (rootWhiteWays + rootBlackWays) % modulusConstant;

    return overallResult;
}

function graphSolverEntry(dataInput) {
  const computedValue = processGraphColoring(dataInput);
  console.log('%s', computedValue);
  return computedValue;
}

graphSolverEntry(require("fs").readFileSync("/dev/stdin", "utf8"));