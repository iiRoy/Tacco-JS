const createInputProcessor = (sourceText) => {
    let lineSegments = sourceText.trim().split('\n');
    let currentLinePointer = 0;
    let currentLineWordCache = []; // Stores words for the current line, in reverse order for 'fetchToken'

    const advanceLineIfCacheEmpty = () => {
        if (currentLineWordCache.length === 0) {
            currentLinePointer++;
        }
    };

    return {
        fetchToken(asString) {
            // This method processes the current line by splitting it into words
            // and then extracting them from right to left (mimicking original pop/reverse behavior).
            // It's designed to be called multiple times on the same line until exhausted.
            if (currentLineWordCache.length === 0 && currentLinePointer < lineSegments.length) {
                currentLineWordCache = lineSegments[currentLinePointer].split(' ').reverse();
            }
            const extractedToken = currentLineWordCache.pop();
            advanceLineIfCacheEmpty(); // Move to next line if current one is fully consumed by tokens
            return asString ? extractedToken : Number(extractedToken);
        },

        fetchLineTokens(asString) {
            // This method processes an entire line at once, moving to the next line.
            // It assumes 'fetchToken' has either not been called for this line,
            // or has fully consumed it and advanced 'currentLinePointer'.
            if (currentLinePointer >= lineSegments.length) {
                throw new Error("Input source exhausted.");
            }
            const lineContent = lineSegments[currentLinePointer++];
            const tokens = lineContent.split(' ');
            return asString ? tokens : tokens.map(Number);
        },

        fetchLineBlock(numRows, asString) {
            const blockData = [];
            for (let i = 0; i < numRows; i++) {
                blockData.push(this.fetchLineTokens(asString));
            }
            return blockData;
        },

        fetchRawLines(numRows, asString) {
            const rawLines = [];
            for (let i = 0; i < numRows; i++) {
                if (currentLinePointer >= lineSegments.length) {
                    throw new Error("Input source exhausted.");
                }
                const lineContent = lineSegments[currentLinePointer++];
                rawLines.push(asString ? lineContent : Number(lineContent));
            }
            return rawLines;
        }
    };
};

const createMultiDimensionalArray = (initialValue, ...dimensions) => {
    const recursiveBuilder = (dims) => {
        if (dims.length === 0) {
            // If initialValue is an object (like []), return a new instance to avoid shared references.
            return (typeof initialValue === 'object' && initialValue !== null)
                ? JSON.parse(JSON.stringify(initialValue))
                : initialValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => recursiveBuilder(remainingDimensions));
    };
    return recursiveBuilder(dimensions);
};

const determineGraphOutcome = () => {
    const inputReader = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const totalNodes = inputReader.fetchToken();
    const graphAdjacency = createMultiDimensionalArray([], totalNodes);

    for (let i = 1; i < totalNodes; i++) {
        const [nodeA, nodeB] = inputReader.fetchLineTokens().map(idx => idx - 1);
        graphAdjacency[nodeA].push(nodeB);
        graphAdjacency[nodeB].push(nodeA);
    }

    // First Breadth-First Search (BFS) to find one of the farthest nodes from an arbitrary start (node 0).
    let bfsQueue = [{ vertex: 0, distance: 0 }];
    let distancesFromStart = createMultiDimensionalArray(-1, totalNodes); // -1 indicates unvisited
    distancesFromStart[0] = 0;
    let farthestNodeEndpoint = 0;
    let maximumDistanceEncountered = 0;

    let queueHead = 0; // Using a pointer for efficient queue processing (avoids array shift)
    while (queueHead < bfsQueue.length) {
        const { vertex: currentVertex, distance: currentDistance } = bfsQueue[queueHead++];

        if (currentDistance > maximumDistanceEncountered) {
            maximumDistanceEncountered = currentDistance;
            farthestNodeEndpoint = currentVertex;
        }

        for (const neighbor of graphAdjacency[currentVertex]) {
            if (distancesFromStart[neighbor] === -1) {
                distancesFromStart[neighbor] = currentDistance + 1;
                bfsQueue.push({ vertex: neighbor, distance: currentDistance + 1 });
            }
        }
    }

    // Second BFS, starting from the 'farthestNodeEndpoint' found in the first pass,
    // to determine the actual diameter (longest path) of the graph.
    bfsQueue = [{ vertex: farthestNodeEndpoint, distance: 0 }];
    distancesFromStart = createMultiDimensionalArray(-1, totalNodes); // Reset distances for the new start
    distancesFromStart[farthestNodeEndpoint] = 0;
    let graphDiameterLength = 0;

    queueHead = 0;
    while (queueHead < bfsQueue.length) {
        const { vertex: currentVertex, distance: currentDistance } = bfsQueue[queueHead++];

        graphDiameterLength = Math.max(graphDiameterLength, currentDistance);

        for (const neighbor of graphAdjacency[currentVertex]) {
            if (distancesFromStart[neighbor] === -1) {
                distancesFromStart[neighbor] = currentDistance + 1;
                bfsQueue.push({ vertex: neighbor, distance: currentDistance + 1 });
            }
        }
    }

    return graphDiameterLength % 3 === 2 ? "Second" : "First";
};

console.log(determineGraphOutcome());
