const fileSystemAccessor = require('fs');

/**
 * Reads all available data from standard input synchronously,
 * processes it into an array of non-empty lines.
 * Handles potential empty input scenarios.
 *
 * @returns {Array<string>} An array where each element is a line from standard input.
 */
const retrieveStandardInputLines = () => {
    try {
        // Use fs.readFileSync for a more direct approach compared to fstatSync + readSync
        const standardInputFileDescriptor = process.stdin.fd;
        const rawInputContent = fileSystemAccessor.readFileSync(standardInputFileDescriptor, { encoding: 'utf8' });

        // Normalize and filter input lines
        const processedInputLines = rawInputContent
            .trim() // Remove leading/trailing whitespace from the entire input
            .split('\n') // Split into lines
            .filter(line => line.length > 0); // Remove any completely empty lines

        if (processedInputLines.length === 0) {
            console.error("Warning: No valid input lines were detected. Proceeding with empty data.");
        }

        return processedInputLines;
    } catch (errorReadingInput) {
        console.error(`Fatal Error: Could not read from standard input. Details: ${errorReadingInput.message}`);
        // Exit process if input reading fails critically
        process.exit(1);
    }
};

/**
 * Recursively attempts to find a Hamiltonian cycle in a directed graph.
 * A Hamiltonian cycle visits every vertex exactly once and returns to the starting vertex.
 *
 * @param {Array<Array<number>>} adjacencyMatrix - The graph represented as an adjacency list.
 *                                                `adjacencyMatrix[i]` contains indices of nodes reachable from node `i`.
 * @param {number} currentVertexIndex - The index of the current vertex being visited.
 * @param {Array<number>} pathTaken - An ordered list of vertex indices visited so far in the current path.
 * @param {number} totalVertexCount - The total number of vertices in the graph.
 * @returns {boolean} True if a Hamiltonian cycle is found starting from the initial vertex, false otherwise.
 */
function attemptHamiltonianCycle(adjacencyMatrix, currentVertexIndex, pathTaken, totalVertexCount) {
    // Create a Set for efficient O(1) lookup of visited nodes in the current path
    // This is an optimization/addition compared to the original's indexOf.
    const currentPathVisitedSet = new Set(pathTaken);

    // Base case: If all vertices have been visited
    if (pathTaken.length === totalVertexCount) {
        const lastVertexVisited = pathTaken[pathTaken.length - 1];
        const initialStartingVertex = pathTaken[0];

        // Check if the last vertex connects back to the first vertex to complete the cycle
        // Using `includes` for clarity over `indexOf` and bitwise NOT.
        return adjacencyMatrix[lastVertexVisited] && adjacencyMatrix[lastVertexVisited].includes(initialStartingVertex);
    }

    // Guard clause: If the current vertex has no outgoing edges and we haven't completed the path,
    // it's a dead end for finding a cycle.
    if (!adjacencyMatrix[currentVertexIndex] || adjacencyMatrix[currentVertexIndex].length === 0) {
        return false;
    }

    // Iterate through all neighbors of the current vertex
    for (const nextVertexCandidate of adjacencyMatrix[currentVertexIndex]) {
        // If the neighbor has already been visited in this path, skip it
        if (currentPathVisitedSet.has(nextVertexCandidate)) {
            continue;
        }

        // Recursively call the function with the neighbor as the new current vertex
        // and add the neighbor to the path taken.
        // `concat` creates a new array, preserving the original `pathTaken` for backtracking.
        if (attemptHamiltonianCycle(adjacencyMatrix, nextVertexCandidate, pathTaken.concat(nextVertexCandidate), totalVertexCount)) {
            return true; // A cycle was found down this path
        }
    }

    // No cycle found from this path starting at currentVertexIndex
    return false;
}

/**
 * Main processing function to handle multiple test cases from the input.
 * This function orchestrates reading input, building the graph, and finding cycles.
 */
function processWordChainChallenges() {
    let inputLinesBuffer = retrieveStandardInputLines();

    // Continue processing as long as there are lines in the buffer
    // and the first line is not the termination signal '0'.
    while (inputLinesBuffer.length > 0 && inputLinesBuffer[0] !== '0') {
        // Extract the number of words for the current test case
        const countOfWords = parseInt(inputLinesBuffer.shift(), 10);

        // Input validation for N
        if (isNaN(countOfWords) || countOfWords < 0) {
            console.error(`Error: Invalid number of words encountered: '${countOfWords}'. Skipping this test case.`);
            // Consume remaining lines for this potentially malformed test case
            // (assuming N words follow, though N is invalid)
            for(let k = 0; k < countOfWords; k++) {
                inputLinesBuffer.shift(); // Attempt to consume, might run out of lines
            }
            continue;
        }

        // Special case: Single word
        if (countOfWords === 1) {
            const singleWord = inputLinesBuffer.shift();
            // A single word forms a cycle if its first character matches its last
            if (singleWord && singleWord.length > 0 && singleWord[0] === singleWord[singleWord.length - 1]) {
                console.log('OK');
            } else {
                console.log('NG');
            }
            continue; // Move to the next test case
        }

        // Handle case where N is 0 or negative (already handled by countOfWords < 0 check)
        if (countOfWords === 0) {
            console.log('OK'); // An empty chain is trivially "OK" if allowed, or "NG" otherwise. Assuming "OK" for 0 words.
            continue;
        }


        // Read the words for the current test case
        const collectionOfWords = [];
        for (let wordIdx = 0; wordIdx < countOfWords; wordIdx++) {
            const currentWord = inputLinesBuffer.shift();
            if (currentWord === undefined) { // Check if we ran out of input unexpectedly
                console.error(`Error: Expected ${countOfWords} words but ran out of input after ${wordIdx}.`);
                // Attempt to break gracefully or handle error
                // For this clone, we'll just stop processing this case and move on.
                break;
            }
            collectionOfWords.push(currentWord);
        }

        // Initialize the directed graph's adjacency list
        // `graphConnections[i]` will store an array of indices `j` such that `word[i]` can precede `word[j]`.
        const graphConnections = Array.from({ length: countOfWords }, () => []);

        // Build the graph based on word connections
        // An edge exists from word A to word B if A's last character matches B's first character.
        for (let sourceWordIndex = 0; sourceWordIndex < countOfWords; sourceWordIndex++) {
            const sourceString = collectionOfWords[sourceWordIndex];
            const lastCharOfSource = sourceString[sourceString.length - 1];

            for (let targetWordIndex = 0; targetWordIndex < countOfWords; targetWordIndex++) {
                // A word cannot connect to itself in a distinct word chain (unless specified otherwise)
                if (sourceWordIndex === targetWordIndex) {
                    continue;
                }

                const targetString = collectionOfWords[targetWordIndex];
                const firstCharOfTarget = targetString[0];

                if (lastCharOfSource === firstCharOfTarget) {
                    graphConnections[sourceWordIndex].push(targetWordIndex);
                }
            }
        }

        // Determine an "optimal" starting node for the Hamiltonian cycle search.
        // The original logic chose the node with the minimum out-degree.
        // This is a heuristic that might prune the search space but isn't strictly necessary
        // for correctness if a Hamiltonian cycle exists from any node.
        let candidateStartNodeIndex = -1;
        let lowestOutDegree = Infinity;

        for (let nodeIdx = 0; nodeIdx < countOfWords; nodeIdx++) {
            const currentOutDegree = graphConnections[nodeIdx].length;
            if (currentOutDegree < lowestOutDegree) {
                lowestOutDegree = currentOutDegree;
                candidateStartNodeIndex = nodeIdx;
            }
        }

        let isHamiltonianCyclePresent = false;

        // Only attempt to find a cycle if a valid starting node was identified
        if (candidateStartNodeIndex !== -1) {
            isHamiltonianCyclePresent = attemptHamiltonianCycle(
                graphConnections,
                candidateStartNodeIndex,
                [candidateStartNodeIndex], // Start path with the chosen candidate node
                countOfWords
            );
        } else if (countOfWords > 0) {
            // If N > 0 but no candidate node was found (e.g., all nodes have 0 out-degree),
            // then no cycle is possible.
            isHamiltonianCyclePresent = false;
        }

        // Output the result for the current test case
        console.log(isHamiltonianCyclePresent ? 'OK' : 'NG');
    }
}

// Invoke the main processing function to start the application
processWordChainChallenges();