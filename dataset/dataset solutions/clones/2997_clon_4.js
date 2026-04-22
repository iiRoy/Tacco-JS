function processInputText(fullTextContent) {
    const dataLines = fullTextContent.trim().split('\n');
    let currentLineIndex = 0;
    let currentTokenIndex = 0;

    const extractNextValue = () => {
        const lineTokens = dataLines[currentLineIndex].trim().split(' ');
        const extractedValue = parseInt(lineTokens[currentTokenIndex], 10);
        currentTokenIndex++;
        if (currentTokenIndex >= lineTokens.length) {
            currentTokenIndex = 0;
            currentLineIndex++;
        }
        return extractedValue;
    };

    const totalVertexCount = extractNextValue();
    const connectionPairs = [];
    for (let k = 0; k < totalVertexCount - 1; k++) {
        const vertexA = extractNextValue();
        const vertexB = extractNextValue();
        connectionPairs.push([vertexA, vertexB]);
    }

    return { totalVertexCount, connectionPairs };
}

function buildVertexRelations(parsedData) {
    const adjacencyStructure = new Map(); // Maps vertex ID to Set of connected vertex IDs

    for (let j = 1; j <= parsedData.totalVertexCount; j++) {
        adjacencyStructure.set(j, new Set());
    }

    parsedData.connectionPairs.forEach(([v1, v2]) => {
        adjacencyStructure.get(v1).add(v2);
        adjacencyStructure.get(v2).add(v1);
    });

    return adjacencyStructure;
}

function evaluateGameOutcome(currentGraphState) {
    if (currentGraphState.size === 1) { // A single vertex remaining, current player wins
        return 1;
    }
    if (currentGraphState.size === 0) { // No vertices remaining, current player loses
        return 0;
    }

    // Identify all terminal nodes (nodes with only one connection)
    const terminalNodes = new Set();
    currentGraphState.forEach((connections, nodeId) => {
        if (connections.size === 1) {
            terminalNodes.add(nodeId);
        }
    });

    let selectedTerminalNode = null;
    for (const node of terminalNodes) {
        selectedTerminalNode = node; // Pick one terminal node to differentiate paths
        break;
    }

    // --- Scenario 1: All terminal nodes are removed ---
    const graphAfterAllTerminalsRemoved = new Map();
    currentGraphState.forEach((connections, nodeId) => {
        if (!terminalNodes.has(nodeId)) { // Only consider non-terminal nodes
            const remainingConnections = new Set([...connections].filter(neighbor => !terminalNodes.has(neighbor)));
            if (remainingConnections.size > 0) {
                graphAfterAllTerminalsRemoved.set(nodeId, remainingConnections);
            }
        }
    });

    let outcomeScenario1;
    if (graphAfterAllTerminalsRemoved.size === 0) {
        outcomeScenario1 = 0; // If graph becomes empty, current player loses
    } else {
        outcomeScenario1 = evaluateGameOutcome(graphAfterAllTerminalsRemoved);
    }

    // --- Scenario 2: All terminal nodes *except the selected one* are removed ---
    const otherTerminalNodes = new Set([...terminalNodes].filter(node => node !== selectedTerminalNode));
    const graphAfterSelectiveRemoval = new Map();

    currentGraphState.forEach((connections, nodeId) => {
        if (!otherTerminalNodes.has(nodeId)) { // Keep nodes that are not "other" terminal nodes
            const filteredConnections = new Set([...connections].filter(neighbor => !otherTerminalNodes.has(neighbor)));
            // Ensure the selectedTerminalNode is kept, even if it becomes isolated after filtering
            if (filteredConnections.size > 0 || nodeId === selectedTerminalNode) {
                graphAfterSelectiveRemoval.set(nodeId, filteredConnections);
            }
        }
    });

    let outcomeScenario2 = evaluateGameOutcome(graphAfterSelectiveRemoval);

    // Combine outcomes using game theory logic (Nim-sum variant)
    if (graphAfterAllTerminalsRemoved.size === 0) {
        return (outcomeScenario2 + 1) % 2;
    }
    if (outcomeScenario1 !== outcomeScenario2) {
        return 1; // Current player can choose a winning move
    } else {
        return (outcomeScenario1 + 1) % 2; // Both paths lead to same outcome for opponent, so flip
    }
}

function commenceProcessing(rawInput) {
    const dataModel = processInputText(rawInput);
    const networkSchema = buildVertexRelations(dataModel);

    const finalDecision = evaluateGameOutcome(networkSchema);

    if (finalDecision === 1) {
        console.log("First");
    } else {
        console.log("Second");
    }
}

commenceProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));