function ProcessGraphData(rawInputString) {
    // This function calculates the length of the longest path in a directed acyclic graph (DAG)
    // represented by the input string. It uses dynamic programming with memoization.

    // 1. Input Parsing and Initial Setup
    // Split the raw input into lines, filtering out any empty lines to ensure clean data.
    let dataLines = rawInputString.split('\n').filter(line => line.trim() !== '');

    // The first line contains the total number of nodes (N) and edges (M).
    // Use array destructuring to extract these values and parse them as integers.
    const [nodeCountStr, edgeCountStr] = dataLines.shift().split(' ');
    const totalNodes = parseInt(nodeCountStr, 10);
    const totalEdges = parseInt(edgeCountStr, 10);

    // Basic input validation: ensure node and edge counts are valid numbers.
    if (isNaN(totalNodes) || totalNodes <= 0 || isNaN(totalEdges) || totalEdges < 0) {
        // In a production scenario, you might throw an error or handle this more gracefully.
        console.error("Error: Invalid graph dimensions provided. Node count must be positive, edge count non-negative.");
        return -1; // Indicate an error state
    }

    // 2. Graph Representation (Adjacency List)
    // Initialize an adjacency list to store the graph.
    // `adjacencyList[i]` will be an array of nodes reachable from node `i`.
    // Nodes are 1-indexed, so we create an array of size `totalNodes + 1`.
    const adjacencyList = Array.from({ length: totalNodes + 1 }, () => []);

    // A set to store all nodes that have at least one outgoing edge.
    // This helps in efficiently iterating through potential starting points for paths.
    const nodesWithOutboundEdges = new Set();

    // 3. Populate Adjacency List and Source Nodes Set
    // Iterate through the remaining lines, each representing an edge.
    for (let currentLineIndex = 0; currentLineIndex < dataLines.length; currentLineIndex++) {
        const edgeDefinition = dataLines[currentLineIndex].trim();

        // Skip any completely empty lines that might have slipped through or additional whitespace lines.
        if (edgeDefinition === '') continue;

        // Parse the source and target nodes of the current edge.
        const edgeComponents = edgeDefinition.split(' ').map(Number);

        // Validate edge components: must have two numbers.
        if (edgeComponents.length !== 2 || isNaN(edgeComponents[0]) || isNaN(edgeComponents[1])) {
            console.warn(`Warning: Skipping malformed edge line: "${edgeDefinition}". Expected two numbers.`);
            continue;
        }

        const sourceIdentifier = edgeComponents[0];
        const targetIdentifier = edgeComponents[1];

        // A common competitive programming pattern: '0 0' as a sentinel for end of input.
        if (sourceIdentifier === 0 && targetIdentifier === 0) {
            break; // Stop processing further lines
        }

        // Validate node identifiers are within the expected range (1 to totalNodes).
        if (sourceIdentifier < 1 || sourceIdentifier > totalNodes ||
            targetIdentifier < 1 || targetIdentifier > totalNodes) {
            console.warn(`Warning: Skipping edge (${sourceIdentifier}, ${targetIdentifier}) with out-of-range node IDs.`);
            continue;
        }

        // Add the target node to the source node's adjacency list.
        adjacencyList[sourceIdentifier].push(targetIdentifier);
        // Record that this source node has an outgoing edge.
        nodesWithOutboundEdges.add(sourceIdentifier);
    }

    // 4. Dynamic Programming Setup
    // Initialize a memoization array to store the longest path length starting from each node.
    // `memoizedPathLengths[i]` will store the length of the longest path starting from node `i`.
    // Initialize with -1 to indicate that the value has not yet been computed.
    const memoizedPathLengths = new Array(totalNodes + 1).fill(-1);

    // Variable to track the maximum path length found across all possible starting nodes.
    let overallMaximumPathLength = 0;

    // Convert the set of distinct starting nodes into an array for easier iteration.
    const uniqueStartingNodes = Array.from(nodesWithOutboundEdges);

    // 5. Main Algorithm: Calculate Longest Paths
    // Iterate through each node that has outgoing edges.
    // These nodes are potential starting points for the longest path in the graph.
    for (let k = 0; k < uniqueStartingNodes.length; k++) {
        const currentNodeAsStart = uniqueStartingNodes[k];
        // Compute the longest path starting from the current node.
        const lengthFromCurrentStart = calculateLongestPathRecursive(currentNodeAsStart);
        // Update the global maximum path length if the current path is longer.
        overallMaximumPathLength = Math.max(overallMaximumPathLength, lengthFromCurrentStart);
    }

    // 6. Recursive Helper Function with Memoization
    // This function computes the longest path starting from a given node.
    function calculateLongestPathRecursive(nodeIdentifier) {
        // If the longest path from this node has already been computed, return the memoized value.
        if (memoizedPathLengths[nodeIdentifier] !== -1) {
            return memoizedPathLengths[nodeIdentifier];
        }

        // Get the list of neighbors (nodes directly reachable) from the current node.
        const directNeighbors = adjacencyList[nodeIdentifier];

        // Base case: If the current node has no outgoing edges, the longest path from it is 0.
        if (!directNeighbors || directNeighbors.length === 0) {
            memoizedPathLengths[nodeIdentifier] = 0;
            return 0;
        }

        let currentMaxPathFromHere = 0; // Initialize max path for the current node

        // Recursive step: For each neighbor, calculate the longest path from that neighbor.
        // Add 1 to account for the edge connecting the current node to its neighbor.
        for (const nextConnectedNode of directNeighbors) {
            const pathLengthThroughNeighbor = calculateLongestPathRecursive(nextConnectedNode) + 1;
            // Update the maximum path found so far from the current node.
            currentMaxPathFromHere = Math.max(currentMaxPathFromHere, pathLengthThroughNeighbor);
        }

        // Memoize the computed result before returning.
        memoizedPathLengths[nodeIdentifier] = currentMaxPathFromHere;
        return currentMaxPathFromHere;
    }

    // Return the final computed maximum path length.
    return overallMaximumPathLength;
}

// --- Auxiliary Test / Debugging Function (Rewritten for Node.js environment) ---
// This function provides a mechanism to test the ProcessGraphData function with predefined inputs
// and compare its output against expected results. It simulates the original 'debug' intent.
function executeTestScenario(scenarioId) {
    // A collection of mock test cases to simulate input and expected output.
    const testCases = {
        1: {
            input: "3 2\n1 2\n2 3\n",
            expected: 2
        },
        2: {
            input: "5 4\n1 2\n1 3\n2 4\n3 5\n",
            expected: 2
        },
        3: {
            input: "4 0\n",
            expected: 0
        },
        4: {
            input: "2 1\n1 2\n0 0\n", // Input with a common sentinel "0 0"
            expected: 1
        },
        5: {
            input: "3 3\n1 2\n2 3\n1 3\n",
            expected: 2
        },
        6: {
            input: "4 3\n1 2\n2 1\n1 3\n", // Graph with a cycle (1-2-1), should still find longest path in DAG-like manner (1->3)
            expected: 1
        },
        7: {
            input: "1 0\n", // Single node, no edges
            expected: 0
        },
        8: {
            input: "5 5\n1 2\n2 3\n3 4\n4 5\n1 5\n",
            expected: 4 // Path 1->2->3->4->5
        },
        9: {
            input: "INVALID_INPUT", // Test invalid initial line
            expected: -1
        },
        10: {
            input: "3 2\n1 2\nMALFORMED_EDGE\n2 3\n", // Test malformed edge line
            expected: 2
        }
    };

    const currentTest = testCases[scenarioId];
    if (!currentTest) {
        console.error(`\n--- Test Scenario ${scenarioId} Not Found ---`);
        return;
    }

    console.log(`\n--- Executing Test Scenario ${scenarioId} ---`);
    console.log(`Input:\n${currentTest.input.trim()}`);

    let actualOutcome;
    try {
        actualOutcome = ProcessGraphData(currentTest.input);
        console.log(`Actual Result:   ${actualOutcome}`);
        console.log(`Expected Result: ${currentTest.expected}`);

        if (actualOutcome === currentTest.expected) {
            console.log("Status: PASSED (✓)");
        } else {
            console.log("Status: FAILED (✗)");
        }
    } catch (error) {
        console.error(`Error during test execution: ${error.message}`);
        console.log("Status: ERROR (‼)");
    }
}

// --- Entry Point for Script Execution ---
// This block determines if the script is being run directly via Node.js
// or if it's being imported/used in another context.
if (typeof require !== 'undefined' && require.main === module) {
    // This code runs when the script is executed directly using Node.js.
    // It reads input from standard input (/dev/stdin), processes it, and prints the result.
    const fileSystem = require("fs");
    const stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const finalCalculatedAnswer = ProcessGraphData(stdInputContent);
    console.log(finalCalculatedAnswer); // Output the final result to standard output.
} else {
    // This block can be used for alternative execution environments or to run
    // predefined test scenarios if not executed as the main script.
    // Uncomment the following lines to run specific test cases manually:
    // executeTestScenario(1);
    // executeTestScenario(2);
    // executeTestScenario(3);
    // executeTestScenario(4);
    // executeTestScenario(5);
    // executeTestScenario(6);
    // executeTestScenario(7);
    // executeTestScenario(8);
    // executeTestScenario(9);
    // executeTestScenario(10);
}