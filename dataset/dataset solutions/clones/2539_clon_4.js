const InputReader = (dataPayload) => {
    const contentSegments = dataPayload.trim().split(/\r?\n/);
    let segmentPointer = 0; // Points to the next line to be processed
    let segmentTokens = []; // Tokens of the currently active line
    let tokenPointer = 0; // Points to the next token to be consumed from segmentTokens

    const advanceSegment = () => {
        if (segmentPointer >= contentSegments.length) {
            segmentTokens = [];
            tokenPointer = 0;
            return false;
        }
        segmentTokens = contentSegments[segmentPointer++].split(' ');
        tokenPointer = 0; // Reset token pointer for the new line
        return true;
    };

    // Initialize the first line's tokens upon creation
    advanceSegment();

    const fetchSingle = (asRawText = false) => {
        if (tokenPointer >= segmentTokens.length) {
            if (!advanceSegment()) return undefined; // No more data segments
        }
        const value = segmentTokens[tokenPointer++];
        return asRawText ? value : Number(value);
    };

    const fetchLine = (asRawText = false) => {
        // This method consumes all remaining tokens on the current line,
        // then advances to the next line.
        if (segmentPointer > contentSegments.length && segmentTokens.length === 0) return undefined;

        const remainingTokens = segmentTokens.slice(tokenPointer);
        tokenPointer = segmentTokens.length; // Mark current line as fully consumed
        advanceSegment(); // Move to the next line for subsequent operations
        return asRawText ? remainingTokens : remainingTokens.map(Number);
    };

    const fetchBlock = (numRows, asRawText = false) => {
        const blockResult = [];
        for (let i = 0; i < numRows; i++) {
            const row = fetchLine(asRawText); // fetchLine handles advancing
            if (row === undefined) return undefined; // Not enough lines for the block
            blockResult.push(row);
        }
        return blockResult;
    };

    const fetchColumn = (numElements, asRawText = false) => {
        const columnResult = [];
        for (let i = 0; i < numElements; i++) {
            const val = fetchSingle(asRawText); // Assumes one element per line, or first token is the element
            if (val === undefined) return undefined; // Not enough elements
            
            // If fetchSingle didn't fully consume the current line, ensure it's cleared and advanced
            if (tokenPointer < segmentTokens.length) {
                tokenPointer = segmentTokens.length; // Consume rest of current line
                advanceSegment(); // Move to next line
            }
            columnResult.push(val);
        }
        return columnResult;
    };

    return {
        fetchSingle,
        fetchLine,
        fetchBlock,
        fetchColumn
    };
};

const makeNestedArray = (initialElement, ...dimensions) => {
    if (dimensions.length === 0) {
        return initialElement;
    }
    const currentDimension = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array.from({ length: currentDimension }, () => makeNestedArray(initialElement, ...remainingDimensions));
};

const findCyclePath = (commencingNode, graphStructure, totalNodesCount) => {
    const predecessorMap = makeNestedArray(-1, totalNodesCount); // Stores immediate predecessor for path reconstruction
    const visitedStatus = makeNestedArray(false, totalNodesCount); // Tracks nodes visited in *this* BFS from commencingNode
    const traversalQueue = [];

    traversalQueue.push(commencingNode);
    visitedStatus[commencingNode] = true; // Mark as visited in this BFS

    while (traversalQueue.length > 0) {
        const currentVertex = traversalQueue.shift();

        for (const adjacentVertex of graphStructure[currentVertex]) {
            if (adjacentVertex === commencingNode) {
                // Cycle detected: an edge leads back to the starting node
                const cycleRoute = [adjacentVertex + 1]; // Start with the commencing node (1-indexed)
                let backtrackNode = currentVertex;
                while (backtrackNode !== commencingNode) {
                    cycleRoute.push(backtrackNode + 1);
                    backtrackNode = predecessorMap[backtrackNode];
                }
                return cycleRoute; // Path is constructed in the desired order (start -> ... -> start)
            }

            if (!visitedStatus[adjacentVertex]) { // If unvisited in *this* BFS
                visitedStatus[adjacentVertex] = true;
                predecessorMap[adjacentVertex] = currentVertex; // Record predecessor
                traversalQueue.push(adjacentVertex);
            }
        }
    }
    return undefined; // No cycle found from this starting node
};

const orchestrateComputation = (rawData) => {
    const dataProcessor = InputReader(rawData);

    const vertexCount = dataProcessor.fetchSingle();
    const edgeCount = dataProcessor.fetchSingle();

    const edgeDefinitions = dataProcessor.fetchBlock(edgeCount);

    const graphAdjacencyList = makeNestedArray([], vertexCount);
    edgeDefinitions.forEach(edge => {
        graphAdjacencyList[edge[0] - 1].push(edge[1] - 1); // Adjust to 0-indexed
    });

    let minimalCycle = Array(vertexCount + 1); // Sentinel value indicating no cycle found yet (longer than any possible cycle)

    // Iterate through all possible start nodes to discover the shortest cycle
    for (let currentInitiator = 0; currentInitiator < vertexCount; currentInitiator++) {
        const detectedCycle = findCyclePath(currentInitiator, graphAdjacencyList, vertexCount);
        if (detectedCycle && detectedCycle.length < minimalCycle.length) {
            minimalCycle = detectedCycle;
        }
    }

    if (minimalCycle.length === vertexCount + 1) {
        return -1; // No cycle was found in the graph
    } else {
        return `${minimalCycle.length}\n${minimalCycle.join('\n')}`;
    }
};

const inputSource = require("fs").readFileSync("/dev/stdin", "utf8");
console.log(orchestrateComputation(inputSource));