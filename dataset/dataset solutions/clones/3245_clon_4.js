const generateInputProcessor = (sourceContent) => {
    let contentLines = sourceContent.trim().split('\n');
    let currentLineIndex = 0;

    let singleValueTokenBuffer = [];

    const retrieveNextLineTokens = () => {
        if (currentLineIndex >= contentLines.length) {
            return null;
        }
        const tokens = contentLines[currentLineIndex].split(' ');
        currentLineIndex++;
        return tokens;
    };

    const extractSingleDatum = (asString = false) => {
        if (singleValueTokenBuffer.length === 0) {
            const freshLineTokens = retrieveNextLineTokens();
            if (freshLineTokens === null) {
                throw new Error("Input exhaustion: Attempted to read single value beyond available lines.");
            }
            singleValueTokenBuffer = freshLineTokens;
        }
        const extractedToken = singleValueTokenBuffer.shift();
        return asString ? extractedToken : Number(extractedToken);
    };

    const extractLineData = (asString = false) => {
        singleValueTokenBuffer = []; 
        const lineTokens = retrieveNextLineTokens();
        if (lineTokens === null) {
            throw new Error("Input exhaustion: Attempted to read full line beyond available lines.");
        }
        return asString ? lineTokens : lineTokens.map(Number);
    };

    return {
        fetchValue: extractSingleDatum,
        fetchRow: extractLineData,
    };
};

const dataExtractor = generateInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

const performGraphAnalysis = () => {
    const graphNodeLimit = dataExtractor.fetchValue();
    const edgeCountModifier = dataExtractor.fetchValue();
    const totalEdgeSpecifications = graphNodeLimit + edgeCountModifier - 1;

    const predMap = new Map();
    const succMap = new Map();
    let maxKnownNodeID = -1;

    for (let edgeIdx = 0; edgeIdx < totalEdgeSpecifications; edgeIdx++) {
        const [sourceVertex, destinationVertex] = dataExtractor.fetchRow().map(val => val - 1);

        if (!predMap.has(destinationVertex)) {
            predMap.set(destinationVertex, []);
        }
        predMap.get(destinationVertex).push(sourceVertex);

        if (!succMap.has(sourceVertex)) {
            succMap.set(sourceVertex, []);
        }
        succMap.get(sourceVertex).push(destinationVertex);

        maxKnownNodeID = Math.max(maxKnownNodeID, sourceVertex, destinationVertex);
    }

    const nodeLevelAssignments = Array(maxKnownNodeID + 1).fill(Number.MAX_SAFE_INTEGER);
    const nodeParentPointers = Array(maxKnownNodeID + 1).fill(0);

    let entryPointNodeID = -1;
    for (let currentVertex = 0; currentVertex <= maxKnownNodeID; currentVertex++) {
        if (!predMap.has(currentVertex) || predMap.get(currentVertex).length === 0) {
            entryPointNodeID = currentVertex;
            break;
        }
    }

    if (entryPointNodeID === -1) {
        throw new Error("Graph lacks a clear entry point (source node).");
    }

    nodeLevelAssignments[entryPointNodeID] = 0;
    nodeParentPointers[entryPointNodeID] = 0; 
    
    let currentDepthFrontier = new Set(succMap.get(entryPointNodeID) || []);
    let completedNodeCount = 1;
    let currentProcessingDepth = 1;

    while (completedNodeCount < graphNodeLimit) {
        const nextDepthFrontier = new Set();
        currentProcessingDepth++;

        for (const candidateVertex of currentDepthFrontier) {
            const incomingEdges = predMap.get(candidateVertex) || [];
            let allIncomingDependenciesMet = true;
            let assignedParent = 0;

            for (const incomingVertex of incomingEdges) {
                if (nodeLevelAssignments[incomingVertex] >= currentProcessingDepth) {
                    allIncomingDependenciesMet = false;
                    break;
                }
                if (nodeLevelAssignments[incomingVertex] === currentProcessingDepth - 1) {
                    assignedParent = incomingVertex + 1;
                }
            }

            if (allIncomingDependenciesMet) {
                nodeLevelAssignments[candidateVertex] = currentProcessingDepth;
                nodeParentPointers[candidateVertex] = assignedParent;
                completedNodeCount++;

                const outgoingEdges = succMap.get(candidateVertex) || [];
                outgoingEdges.forEach(neighbor => nextDepthFrontier.add(neighbor));
            }
        }
        currentDepthFrontier = nextDepthFrontier;
        
        if (currentDepthFrontier.size === 0 && completedNodeCount < graphNodeLimit) {
            break; 
        }
    }

    return nodeParentPointers.slice(0, graphNodeLimit).join('\n');
};

console.log(performGraphAnalysis());