const createInputReader = (rawInputString) => {
    const inputLines = rawInputString.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokens = [];
    let currentTokenPosition = -1; // Position within currentLineTokens, from right to left

    const retrieveNextRawLine = () => {
        if (currentLineIndex >= inputLines.length) {
            throw new Error("Input exhausted.");
        }
        return inputLines[currentLineIndex++];
    };

    const prepareLineTokens = () => {
        const lineContent = retrieveNextRawLine();
        currentLineTokens = lineContent.split(' ');
        currentTokenPosition = currentLineTokens.length - 1; // Start from the rightmost token
    };

    const extractSingleValue = (asString) => {
        if (currentTokenPosition < 0) { // Current line exhausted or not yet fetched
            prepareLineTokens();
        }
        const token = currentLineTokens[currentTokenPosition];
        currentTokenPosition--; // Move to the next token from the right
        return asString ? token : Number(token);
    };

    const extractFullLine = (asString) => {
        const lineContent = retrieveNextRawLine();
        const tokens = lineContent.split(' ');
        // Reset currentLineTokens state as this method consumes a full line
        currentLineTokens = [];
        currentTokenPosition = -1;
        return asString ? tokens : tokens.map(Number);
    };

    const extractMultipleLinesAsMatrix = (count, asString) => {
        const resultMatrix = [];
        for (let i = 0; i < count; i++) {
            resultMatrix.push(extractFullLine(asString));
        }
        return resultMatrix;
    };

    const extractMultipleLinesAsArray = (count, asString) => {
        const resultArray = [];
        for (let i = 0; i < count; i++) {
            const lineContent = retrieveNextRawLine();
            const value = asString ? lineContent : Number(lineContent);
            resultArray.push(value);
        }
        // Reset currentLineTokens state as this method consumes full lines
        currentLineTokens = [];
        currentTokenPosition = -1;
        return resultArray;
    };

    return {
        getValue: extractSingleValue,
        getLine: extractFullLine,
        getMatrix: extractMultipleLinesAsMatrix,
        getArray: extractMultipleLinesAsArray
    };
};

const inputProcessor = createInputReader(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(processGraphTraversal());

function processGraphTraversal() {
    const nodeCountLimit = inputProcessor.getValue();
    const edgeCountParam = inputProcessor.getValue();

    const nodePredecessors = new Map();
    const nodeSuccessors = new Map();
    const nodeDepths = new Map();
    const nodeResults = new Map();
    const allGraphNodes = new Set();
    
    // Initialize all nodes from 0 to nodeCountLimit-1
    for (let k = 0; k < nodeCountLimit; k++) {
        allGraphNodes.add(k);
        nodePredecessors.set(k, []);
        nodeSuccessors.set(k, []);
        nodeDepths.set(k, Infinity);
    }

    // Populate graph structure from input edges
    for (let edgeIdx = 0; edgeIdx < nodeCountLimit + edgeCountParam - 1; edgeIdx++) {
        const [sourceNodeId, targetNodeId] = inputProcessor.getLine().map(val => val - 1);
        
        // Add any nodes from edges that might not be in the initial 0 to nodeCountLimit-1 range
        allGraphNodes.add(sourceNodeId);
        allGraphNodes.add(targetNodeId);

        // Ensure nodes exist in maps (if they were added by edges and not in initial range)
        if (!nodePredecessors.has(sourceNodeId)) nodePredecessors.set(sourceNodeId, []);
        if (!nodePredecessors.has(targetNodeId)) nodePredecessors.set(targetNodeId, []);
        if (!nodeSuccessors.has(sourceNodeId)) nodeSuccessors.set(sourceNodeId, []);
        if (!nodeSuccessors.has(targetNodeId)) nodeSuccessors.set(targetNodeId, []);
        if (!nodeDepths.has(sourceNodeId)) nodeDepths.set(sourceNodeId, Infinity);
        if (!nodeDepths.has(targetNodeId)) nodeDepths.set(targetNodeId, Infinity);

        nodePredecessors.get(targetNodeId).push(sourceNodeId);
        nodeSuccessors.get(sourceNodeId).push(targetNodeId);
    }

    let currentLevelNodes = new Set();
    let currentTraversalLevel = 0;

    // Find the initial starting node (first node from 0 to nodeCountLimit-1 with no incoming edges)
    let initialNodeFound = false;
    for (let nodeIdCandidate = 0; nodeIdCandidate < nodeCountLimit; nodeIdCandidate++) {
        if (nodePredecessors.has(nodeIdCandidate) && nodePredecessors.get(nodeIdCandidate).length === 0) {
            currentLevelNodes.add(nodeIdCandidate);
            nodeResults.set(nodeIdCandidate, 0);
            nodeDepths.set(nodeIdCandidate, 0);
            initialNodeFound = true;
            break; 
        }
    }

    let processedNodeCount = currentLevelNodes.size;

    // Main graph traversal loop
    while (processedNodeCount < nodeCountLimit) {
        currentTraversalLevel++;
        const nextLevelNodes = new Set();
        const nodesForCurrentLevelProcessing = Array.from(currentLevelNodes).sort((a, b) => a - b);

        for (const currentNodeId of nodesForCurrentLevelProcessing) {
            // If a node was already processed at an earlier level, skip it.
            if (nodeDepths.get(currentNodeId) !== Infinity && nodeDepths.get(currentNodeId) < currentTraversalLevel) {
                continue;
            }

            const predecessorsOfCurrent = nodePredecessors.get(currentNodeId) || [];
            
            let isEligibleForCurrentLevel = true;
            let assignedPredecessorValue = -1;

            // Check all predecessors for eligibility
            for (const predecessorId of predecessorsOfCurrent) {
                const predecessorDepth = nodeDepths.get(predecessorId);
                if (predecessorDepth === undefined || predecessorDepth === Infinity || predecessorDepth >= currentTraversalLevel) {
                    isEligibleForCurrentLevel = false;
                    break;
                }
                if (predecessorDepth === currentTraversalLevel - 1) {
                    assignedPredecessorValue = predecessorId;
                }
            }

            if (isEligibleForCurrentLevel) {
                // Assign depth and result only if not already processed
                if (nodeDepths.get(currentNodeId) === Infinity) {
                    nodeDepths.set(currentNodeId, currentTraversalLevel);
                    nodeResults.set(currentNodeId, assignedPredecessorValue + 1);
                    processedNodeCount++;

                    const successorsOfCurrent = nodeSuccessors.get(currentNodeId);
                    if (successorsOfCurrent) {
                        for (const successorId of successorsOfCurrent) {
                            nextLevelNodes.add(successorId); // Add all successors to the next level's queue
                        }
                    }
                }
            }
        }
        currentLevelNodes = nextLevelNodes;
        if (currentLevelNodes.size === 0 && processedNodeCount < nodeCountLimit) {
            // No more nodes can be processed, but not all 'n' nodes were processed.
            // This implies unreachable nodes or cycles not handled by this traversal.
            break;
        }
    }

    // Prepare final results array for output, ensuring 'nodeCountLimit' elements.
    const finalOutputValues = Array(nodeCountLimit).fill(undefined);
    for (const [nodeId, resultValue] of nodeResults.entries()) {
        if (nodeId < nodeCountLimit) {
            finalOutputValues[nodeId] = resultValue;
        }
    }

    // Convert any unprocessed nodes (undefined) to empty strings for output consistency.
    return finalOutputValues.map(val => val === undefined ? '' : val).join('\n');
}
