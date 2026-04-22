// This module handles graph-related computations, specifically finding the maximum shortest path
// under certain conditions using a modified Bellman-Ford algorithm.

// Global buffer for raw input data received from stdin.
let rawInputBuffer = '';
// Index to track the current token being processed from the input buffer.
let currentTokenIndex = 0;

/**
 * Reads the next token from the pre-processed input buffer.
 * By default, tokens are converted to numbers.
 * @param {string} [tokenType='number'] - Specifies if the token should be returned as a 'string' or 'number'.
 * @returns {string|number} The next token from the input.
 */
function readInputToken(tokenType = 'number') {
    // Retrieve the token value at the current index and then advance the index.
    const tokenValue = rawInputBuffer[currentTokenIndex++];

    // If the requested type is 'string', return the token as is.
    if (tokenType === 'string') {
        return tokenValue;
    }
    // Otherwise, convert the token to a number.
    return Number(tokenValue);
}

/**
 * Outputs a value to the console. This function serves as a wrapper for console.log.
 * @param {*} valueToDisplay - The value to be printed to standard output.
 */
function outputResult(valueToDisplay) {
    console.log(valueToDisplay);
}

/**
 * A flexible utility function for iterating over a numeric range.
 * It supports two signatures:
 * 1. `iterateRange(endExclusive, callback)`: Iterates from 0 up to (but not including) `endExclusive`.
 * 2. `iterateRange(startInclusive, endExclusive, callback)`: Iterates from `startInclusive` up to `endExclusive`.
 * @param {number} firstArg - Either the end value (exclusive) or the start value (inclusive).
 * @param {number|Function} secondArg - Either the end value (exclusive) or the callback function.
 * @param {Function} [thirdArg] - The callback function, if start and end values are provided.
 */
function iterateRange(firstArg, secondArg, thirdArg) {
    let loopStart = 0;
    let loopEnd;
    let iterationCallback;

    // Determine the roles of the arguments based on the number of provided arguments.
    if (thirdArg === undefined) { // Case: iterateRange(endExclusive, callback)
        loopEnd = firstArg;
        iterationCallback = secondArg;
    } else { // Case: iterateRange(startInclusive, endExclusive, callback)
        loopStart = firstArg;
        loopEnd = secondArg;
        iterationCallback = thirdArg;
    }

    // Execute the callback function for each number in the determined range.
    for (let currentIteration = loopStart; currentIteration < loopEnd; ++currentIteration) {
        iterationCallback(currentIteration);
    }
}

/**
 * Main problem-solving function.
 * This function orchestrates the reading of input, construction of the graph based on specific
 * inequality/equality rules, and computation of the maximum shortest path using a Bellman-Ford variant.
 */
function solveProblem() {
    // Read the number of nodes (vertices) and the total number of edge specifications from input.
    const nodeCount = readInputToken();
    const totalEdgeSpecifications = readInputToken();

    // Data structures to store graph edges.
    // 'fixedDirectedEdges' stores edges that are always part of the graph for any combination.
    const fixedDirectedEdges = [];
    // 'choiceDependentEdges' stores pairs of edges, where exactly one edge from each pair
    // will be chosen for a given graph combination.
    const choiceDependentEdges = [];

    // Process each edge specification line from the input.
    iterateRange(totalEdgeSpecifications, function(edgeSpecificationIndex) {
        const inputLine = readInputToken('string');

        // Parse the numerical components of the edge specification.
        // The regex splits the string by comparison operators (<=, >=, *) or arithmetic operators (+, -).
        const rawParts = inputLine.split(/<=|>=|\*|\+|-/);

        // Convert string parts to numbers and adjust node indices to be 0-based.
        // `sourceNode` corresponds to `p[0]` in the original code.
        // `targetNode` corresponds to `p[1]` in the original code.
        // `edgeWeight` corresponds to `p[2]` in the original code.
        const sourceNode = Number(rawParts[0]) - 1;
        const targetNode = Number(rawParts[1]) - 1;
        const edgeWeight = Number(rawParts[2]);

        // Determine the type of comparison operator used in the input line.
        // This maps to the 'u' variable in the original code.
        // 0: '<=' (less than or equal to)
        // 1: '>=' (greater than or equal to)
        // 2: '*' (multiplication, interpreted as an equality constraint)
        let comparisonOperatorCategory;
        if (inputLine.includes('*')) {
            comparisonOperatorCategory = 2; // Equality-like constraint.
        } else if (inputLine.includes('<=')) {
            comparisonOperatorCategory = 0; // Less than or equal constraint.
        } else { // Must be '>='
            comparisonOperatorCategory = 1; // Greater than or equal constraint.
        }

        // Determine the type of arithmetic operator used in the input line.
        // This maps to the 'v' variable in the original code.
        // true: '+' (addition)
        // false: '-' (subtraction)
        const isAdditionOperator = inputLine.includes('+');

        // Based on the operator types, construct the corresponding directed edges.
        // Each edge is represented as `[source, target, weight]`, which implies the
        // Bellman-Ford constraint `dist[target] <= dist[source] + weight`.
        // The logic here precisely mirrors the original code's specific interpretation
        // of inequalities and equalities into graph edges.

        if (comparisonOperatorCategory === 0) { // Original 'u == 0' (comparison is '<=')
            // Constraint: `var1 <= var2 [op] constant`
            if (isAdditionOperator) { // Original 'v == 0' (operator is '+')
                // Constraint: `var1 <= var2 + constant`
                // Original code adds edge: `[p[1], p[0], -p[2]]`
                // This translates to the Bellman-Ford constraint: `dist[sourceNode] <= dist[targetNode] + (-edgeWeight)`
                fixedDirectedEdges.push([targetNode, sourceNode, -edgeWeight]);
            } else { // Original 'v == 1' (operator is '-')
                // Constraint: `var1 <= var2 - constant`
                // Original code adds two edges: `[p[1], p[0], 0]` AND `[p[0], p[1], p[2]]`
                // This translates to:
                // 1. `dist[sourceNode] <= dist[targetNode] + 0`
                // 2. `dist[targetNode] <= dist[sourceNode] + edgeWeight`
                fixedDirectedEdges.push([targetNode, sourceNode, 0]);
                fixedDirectedEdges.push([sourceNode, targetNode, edgeWeight]);
            }
        } else if (comparisonOperatorCategory === 1) { // Original 'u == 1' (comparison is '>=')
            // Constraint: `var1 >= var2 [op] constant`
            if (isAdditionOperator) { // Original 'v == 0' (operator is '+')
                // Constraint: `var1 >= var2 + constant`
                // Original code adds edge: `[p[0], p[1], -p[2]]`
                // This translates to: `dist[targetNode] <= dist[sourceNode] + (-edgeWeight)`
                fixedDirectedEdges.push([sourceNode, targetNode, -edgeWeight]);
            } else { // Original 'v == 1' (operator is '-')
                // Constraint: `var1 >= var2 - constant`
                // Original code adds two edges: `[p[1], p[0], p[2]]` AND `[p[0], p[1], 0]`
                // This translates to:
                // 1. `dist[sourceNode] <= dist[targetNode] + edgeWeight`
                // 2. `dist[targetNode] <= dist[sourceNode] + 0`
                fixedDirectedEdges.push([targetNode, sourceNode, edgeWeight]);
                fixedDirectedEdges.push([sourceNode, targetNode, 0]);
            }
        } else { // `comparisonOperatorCategory === 2` (Original 'u == 2' (comparison is '*'))
            // This category implies an equality, typically `var1 = var2 [op] constant`.
            if (isAdditionOperator) { // Original 'v == 0' (operator is '+')
                // Constraint: `var1 = var2 + constant`
                // Original code adds two edges: `[p[1], p[0], p[2]]` AND `[p[0], p[1], p[2]]`
                // This translates to:
                // 1. `dist[sourceNode] <= dist[targetNode] + edgeWeight`
                // 2. `dist[targetNode] <= dist[sourceNode] + edgeWeight`
                // These two together enforce `dist[sourceNode] = dist[targetNode] + edgeWeight`.
                fixedDirectedEdges.push([targetNode, sourceNode, edgeWeight]);
                fixedDirectedEdges.push([sourceNode, targetNode, edgeWeight]);
            } else { // Original 'v == 1' (operator is '-')
                // Constraint: `var1 = var2 - constant`
                // Original code adds a choice-dependent pair of edges: `[[p[0], p[1], -p[2]], [p[1], p[0], -p[2]]]`
                // This means that for this equality, we choose one of two options:
                // Option 0: `dist[targetNode] <= dist[sourceNode] + (-edgeWeight)`
                // Option 1: `dist[sourceNode] <= dist[targetNode] + (-edgeWeight)`
                // These two options represent `dist[targetNode] - dist[sourceNode] = -edgeWeight` or
                // `dist[sourceNode] - dist[targetNode] = -edgeWeight`, which is equivalent to
                // `dist[sourceNode] = dist[targetNode] - edgeWeight`.
                choiceDependentEdges.push([
                    [sourceNode, targetNode, -edgeWeight], // Option 0
                    [targetNode, sourceNode, -edgeWeight]  // Option 1
                ]);
            }
        }
    });

    // Initialize the variable to store the maximum shortest path found across all combinations.
    let maximumShortestPath = Number.NEGATIVE_INFINITY;

    // Iterate through all possible combinations of choice-dependent edges.
    // If there are N choice-dependent edge pairs, there are 2^N combinations.
    const numberOfCombinations = 1 << choiceDependentEdges.length;
    iterateRange(numberOfCombinations, function(combinationIndex) {
        // Create a new graph for each combination, starting with the fixed edges.
        // Using the spread operator for a shallow copy.
        const currentGraphEdges = [...fixedDirectedEdges];

        // Add the chosen edges from the choice-dependent pairs for this specific combination.
        iterateRange(choiceDependentEdges.length, function(pairIndex) {
            // Determine which edge from the pair to include based on the corresponding bit
            // in the `combinationIndex`.
            const chosenEdgeOption = (combinationIndex >> pairIndex) & 1; // 0 or 1
            currentGraphEdges.push(choiceDependentEdges[pairIndex][chosenEdgeOption]);
        });

        // Initialize distances for the Bellman-Ford algorithm.
        // All nodes initially have an infinite distance, except the source node (node 0) which is 0.
        const distanceArray = Array(nodeCount).fill(Number.POSITIVE_INFINITY);
        distanceArray[0] = 0;

        // Run the Bellman-Ford algorithm for `nodeCount` iterations.
        // `nodeCount - 1` iterations are typically sufficient to find shortest paths in a graph
        // without negative cycles. The `nodeCount`th iteration is usually used to detect negative cycles.
        // Here, we iterate `nodeCount` times to match the original code's behavior,
        // and the check `distanceArray[0] === 0` handles implications of negative cycles.
        iterateRange(nodeCount, function() {
            // Iterate through all edges in the current graph.
            iterateRange(currentGraphEdges.length, function(edgeIndex) {
                const currentEdge = currentGraphEdges[edgeIndex];
                const src = currentEdge[0];    // Source node of the edge.
                const dest = currentEdge[1];   // Destination node of the edge.
                const weight = currentEdge[2]; // Weight of the edge.

                // Relax the edge: if a shorter path to `dest` is found via `src`, update `dest`'s distance.
                // Ensure `src` is reachable (its distance is not infinity).
                if (distanceArray[src] !== Number.POSITIVE_INFINITY && distanceArray[src] + weight < distanceArray[dest]) {
                    distanceArray[dest] = distanceArray[src] + weight;
                }
            });
        });

        // After Bellman-Ford, check the distance of the source node (node 0).
        // If `distanceArray[0]` is still 0, it means no negative cycle reachable from node 0
        // has caused its distance to become negative. In this valid state, we find the maximum
        // distance among all nodes in the current graph configuration.
        if (distanceArray[0] === 0) {
            const currentMaxDistanceInGraph = Math.max(...distanceArray);
            maximumShortestPath = Math.max(maximumShortestPath, currentMaxDistanceInGraph);
        }
    });

    // Output the final result based on the computed `maximumShortestPath`.
    if (maximumShortestPath === Number.POSITIVE_INFINITY) {
        outputResult('inf'); // Indicates that some node is reachable with an infinitely large distance (unbounded).
    } else if (maximumShortestPath === Number.NEGATIVE_INFINITY) {
        outputResult(-1); // Indicates no valid path was found across any combination, or all paths
                          // lead to negative infinity (e.g., all combinations resulted in `distanceArray[0] !== 0`).
    } else {
        outputResult(maximumShortestPath); // The calculated maximum shortest path among all valid configurations.
    }
}

// --- Standard Node.js input/output setup ---

// Resume stdin to start listening for incoming data.
process.stdin.resume();
// Set the encoding for the incoming data chunks to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
// Each chunk is appended to the `rawInputBuffer`.
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

// Event listener for the end of the input stream.
// Once all input is received:
// 1. The `rawInputBuffer` is split by whitespace characters into an array of tokens.
// 2. The main problem-solving function `solveProblem` is invoked.
process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    solveProblem();
});