"use strict";

/**
 * @typedef {function(string): number} ValueConverter
 */

/**
 * Utility class for parsing input data, segment by segment or line by line.
 * It maintains pointers to the current line and token within that line.
 */
class InputParserUtility {
    /**
     * Initializes the parser with raw input and an optional default conversion function.
     * @param {string} rawData The complete input string, typically from a file.
     * @param {ValueConverter} [initialConverter] Optional function to convert string tokens to desired type. Defaults to parseInt.
     */
    constructor(rawData, initialConverter) {
        // Store input as an array of lines, filtering out any empty lines.
        this.inputSegments = rawData.split('\n').filter(segment => segment.trim().length > 0);
        this.segmentPointer = 0; // Index of the current token within the current line
        this.lineCursor = 0;    // Index of the current line being processed
        // Set the default converter, preferring parseInt over Number for integer parsing.
        this.transformFn = initialConverter || (value => parseInt(value, 10));
    }

    /**
     * Extracts and returns the next single token from the input stream.
     * Advances the internal pointers.
     * @param {ValueConverter} [customConverter] An optional converter to use for this specific token.
     * @returns {*} The converted token, or null if end of input is reached.
     */
    extractNextToken(customConverter) {
        if (this.lineCursor >= this.inputSegments.length) {
            // No more lines to process, end of input.
            return null;
        }

        const currentLineContent = this.inputSegments[this.lineCursor];
        if (!currentLineContent) {
            // Should not happen if inputSegments are filtered, but as a safeguard.
            this.lineCursor++;
            this.segmentPointer = 0;
            return this.extractNextToken(customConverter); // Try next line
        }

        // Split the current line into tokens, handling multiple spaces and empty tokens.
        const tokensInLine = currentLineContent.trim().split(/\s+/).filter(Boolean);
        
        if (this.segmentPointer >= tokensInLine.length) {
            // Current line exhausted, move to the next line and reset token pointer.
            this.lineCursor++;
            this.segmentPointer = 0;
            return this.extractNextToken(customConverter); // Recurse to get token from next line
        }

        const extractedToken = tokensInLine[this.segmentPointer];
        this.segmentPointer++;

        // If all tokens on the current line have been read, prepare for the next line.
        if (this.segmentPointer === tokensInLine.length) {
            this.segmentPointer = 0;
            this.lineCursor++;
        }
        
        // Apply the appropriate converter.
        const converterToUse = customConverter || this.transformFn;
        return converterToUse(extractedToken);
    }

    /**
     * Extracts all tokens from the current line, converts them, and advances to the next line.
     * @param {ValueConverter} [lineValueConverter] An optional converter to use for all tokens on this line.
     * @returns {Array<*>} An array of converted tokens from the line, or an empty array if no more lines.
     */
    extractLineValues(lineValueConverter) {
        if (this.lineCursor >= this.inputSegments.length) {
            return []; // No more lines available.
        }

        const currentLineText = this.inputSegments[this.lineCursor];
        this.lineCursor++; // Advance line cursor immediately
        this.segmentPointer = 0; // Reset token pointer for the new line

        if (!currentLineText) {
            return []; // Empty line, return empty array.
        }

        // Split by whitespace and filter out empty strings.
        const tokens = currentLineText.trim().split(/\s+/).filter(Boolean);
        const converterToApply = lineValueConverter || this.transformFn;
        
        return tokens.map(converterToApply);
    }
}

// Export the utility for external use, mimicking the original `module.exports`.
module.exports = InputParserUtility;

/**
 * Constants for game outcomes.
 * 0: Current player wins (N-position)
 * 1: Current player loses (P-position)
 */
const GAME_OUTCOME_WIN = 0;
const GAME_OUTCOME_LOSE = 1;

/**
 * Main function to process graph input and determine the game winner.
 * @param {string} rawInput The full input string containing graph data.
 */
function processGraphInput(rawInput) {
    const parserInstance = new InputParserUtility(rawInput);

    // Read the number of nodes in the graph.
    const nodeCount = parserInstance.extractNextToken();
    if (nodeCount === null || isNaN(nodeCount) || nodeCount < 1) {
        console.error("Invalid node count provided.");
        return;
    }

    // Initialize an adjacency list for the graph.
    // Index 0 is intentionally left unused for 1-based node indexing.
    const adjacencyList = Array.from({ length: nodeCount + 1 }, () => []);
    adjacencyList[0] = null; // Explicitly mark index 0 as unused.

    // Read N-1 edges to build the graph (assuming it's a tree).
    for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        const nodeU = parserInstance.extractNextToken();
        const nodeV = parserInstance.extractNextToken();

        if (nodeU === null || nodeV === null || isNaN(nodeU) || isNaN(nodeV) ||
            nodeU < 1 || nodeU > nodeCount || nodeV < 1 || nodeV > nodeCount) {
            console.error(`Invalid edge nodes at edge ${edgeIndex + 1}: ${nodeU}, ${nodeV}`);
            return;
        }

        // Add bidirectional edges.
        adjacencyList[nodeU].push(nodeV);
        adjacencyList[nodeV].push(nodeU);
    }

    // Determine the winner of the game played on this graph.
    const gameResult = calculateGameOutcome(adjacencyList);

    // Output the winner based on the calculated outcome.
    if (gameResult === GAME_OUTCOME_WIN) {
        console.log("First");
    } else { // gameResult === GAME_OUTCOME_LOSE
        console.log("Second");
    }
}

/**
 * Recursively calculates the game outcome (Nim-value/Grundy value) for a given graph state.
 * This game involves removing a leaf node and its parent.
 * Returns GAME_OUTCOME_WIN (0) if the current player wins from this state (N-position),
 * or GAME_OUTCOME_LOSE (1) if the current player loses (P-position).
 * @param {Array<Array<number>|null>} currentGraphState The adjacency list representing the current graph.
 * @returns {number} GAME_OUTCOME_WIN or GAME_OUTCOME_LOSE.
 */
function calculateGameOutcome(currentGraphState) {
    // Count active nodes (non-null entries) in the graph.
    const activeNodeCount = currentGraphState.filter(Boolean).length;

    // Base case: If no active nodes or only one node left, the current player takes it and wins.
    if (activeNodeCount <= 1) {
        return GAME_OUTCOME_WIN;
    }

    // Find the first available leaf node. A leaf node has only one connection.
    const firstLeafNodeIndex = currentGraphState.findIndex(nodeConnections => nodeConnections && nodeConnections.length === 1);

    // If no leaf node is found (e.g., a cycle or disconnected components, which shouldn't happen in a valid tree game setup),
    // this indicates an unexpected state or a graph that's not a simple tree.
    // For this specific game, if no leaves, it means activeNodeCount > 1 but no leaves, which is impossible for a tree unless it's just a cycle.
    // Assuming valid tree, a leaf must exist if activeNodeCount > 1.
    if (firstLeafNodeIndex === -1) {
        // This scenario implies a non-tree structure or error. Returning a loss for current player.
        return GAME_OUTCOME_LOSE; 
    }

    // --- Scenario 1: Remove the found leaf and its parent. ---
    // This creates a new, reduced graph state.
    const reducedGraphState = deriveCoreGraph(currentGraphState);
    
    let outcomeA;
    const effectiveNodesAfterPrune = reducedGraphState.filter(Boolean).length;

    if (effectiveNodesAfterPrune <= 1) {
        // If pruning leads to 0 or 1 active nodes, the current player wins this subgame.
        outcomeA = GAME_OUTCOME_WIN;
    } else {
        // Recursively determine the outcome for the reduced graph.
        outcomeA = calculateGameOutcome(reducedGraphState);
    }

    // --- Scenario 2: Consider the game state if the leaf was not removed, but kept. ---
    // We need to simulate the game continuing *without* the leaf being removed in this step.
    // This means we restore the leaf and its connection for the second recursive call.
    // Create a deep copy to avoid side effects on the first scenario's state.
    const alternativeGraphState = currentGraphState.map(node => node ? [...node] : null);

    // The leaf node must have a parent (its only connection).
    const parentOfLeaf = currentGraphState[firstLeafNodeIndex][0];

    // Remove the leaf node's connection from its parent in this alternative scenario.
    if (alternativeGraphState[parentOfLeaf]) {
        alternativeGraphState[parentOfLeaf] = alternativeGraphState[parentOfLeaf].filter(
            neighbor => neighbor !== firstLeafNodeIndex
        );
        // If the parent becomes isolated or a new leaf, its connection list might change.
        if (alternativeGraphState[parentOfLeaf].length === 0) {
            alternativeGraphState[parentOfLeaf] = null; // Effectively remove isolated node.
        }
    }
    alternativeGraphState[firstLeafNodeIndex] = null; // The leaf node itself is removed from consideration.

    let outcomeB;
    const effectiveNodesAlternative = alternativeGraphState.filter(Boolean).length;
    if (effectiveNodesAlternative <= 1) {
        outcomeB = GAME_OUTCOME_WIN;
    } else {
        outcomeB = calculateGameOutcome(alternativeGraphState);
    }

    // --- Combine outcomes of the two scenarios ---
    // If there's a path that leads to a win for the current player (i.e., the next player loses),
    // the current player chooses that path.
    if (outcomeA !== outcomeB) {
        return GAME_OUTCOME_WIN; // Current player can choose to win.
    } else {
        // If both paths lead to the same outcome for the next player,
        // the current player is forced into that outcome.
        // If next player wins (outcomeA is WIN), current player loses.
        // If next player loses (outcomeA is LOSE), current player wins.
        return (outcomeA === GAME_OUTCOME_WIN ? GAME_OUTCOME_LOSE : GAME_OUTCOME_WIN);
    }
}

/**
 * Creates a new graph state by identifying and pruning all current leaf nodes.
 * When a leaf node is pruned, it is removed, and its connection is also removed from its parent.
 * @param {Array<Array<number>|null>} originalGraph The source adjacency list.
 * @returns {Array<Array<number>|null>} A new adjacency list with leaf nodes removed.
 */
function deriveCoreGraph(originalGraph) {
    const leafNodeIndices = [];
    // Identify all leaf nodes in the current graph state.
    originalGraph.forEach((connections, idx) => {
        if (connections && connections.length === 1) {
            leafNodeIndices.push(idx);
        }
    });

    // Create a new graph structure, initially filled with nulls.
    const prunedGraph = Array.from({ length: originalGraph.length }, () => null);

    // Populate the new graph by filtering out connections to leaf nodes.
    originalGraph.forEach((connections, idx) => {
        if (connections && connections.length > 0) {
            // Filter out any neighbors that are identified as leaf nodes.
            const remainingConnections = connections.filter(neighborNode => !leafNodeIndices.includes(neighborNode));
            
            // If a node still has connections after pruning leaves, add it to the new graph.
            if (remainingConnections.length > 0) {
                prunedGraph[idx] = remainingConnections;
            }
            // If a node becomes isolated (no remaining connections) or was already null, it remains null in prunedGraph.
        }
    });
    
    return prunedGraph;
}

// Execute the main processing function by reading input from standard input.
processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));