const fileSystemInterface = require('fs');

const standardInputFileDescriptor = process.stdin.fd;

let totalInputByteCount;
try {
    totalInputByteCount = fileSystemInterface.fstatSync(standardInputFileDescriptor).size;
} catch (errorDetails) {
    console.error("Error determining standard input size:", errorDetails.message);
    process.exit(1);
}

const dataBuffer = Buffer.alloc(totalInputByteCount);

let actualBytesRead;
try {
    actualBytesRead = fileSystemInterface.readSync(standardInputFileDescriptor, dataBuffer, 0, totalInputByteCount, 0);
} catch (errorDetails) {
    console.error("Error reading from standard input:", errorDetails.message);
    process.exit(1);
}

let processedInputLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

/**
 * Recursively explores paths in a directed graph to determine if a Hamiltonian cycle
 * exists, starting and ending at the designated initial node (index 0).
 *
 * A Hamiltonian cycle is a path in a graph that visits each vertex exactly once
 * and returns to the starting vertex.
 *
 * @param {Array<Array<number>>} graphAdjacencyList The graph's structure as an adjacency list.
 *                                                   `graphAdjacencyList[i]` contains an array of
 *                                                   indices of nodes directly reachable from node `i`.
 * @param {number} currentVertexIndex The index of the vertex currently being examined.
 * @param {Array<number>} currentVisitedPath An ordered list of vertices visited so far
 *                                           in the current path traversal.
 * @returns {boolean} `true` if a Hamiltonian cycle is successfully found, `false` otherwise.
 */
function findHamiltonianCycle(graphAdjacencyList, currentVertexIndex, currentVisitedPath) {
    // Base case: If the length of the visited path equals the total number of vertices,
    // it means all vertices have been visited exactly once.
    if (currentVisitedPath.length === graphAdjacencyList.length) {
        const lastVisitedVertex = currentVisitedPath[currentVisitedPath.length - 1];
        const firstVisitedVertex = currentVisitedPath[0];
        // Check if there is a direct edge from the last visited vertex back to the starting vertex.
        return graphAdjacencyList[lastVisitedVertex].includes(firstVisitedVertex);
    }

    // Recursive step: Iterate through all direct neighbors of the current vertex.
    for (const nextNeighborVertex of graphAdjacencyList[currentVertexIndex]) {
        // Skip this neighbor if it has already been visited in the current path.
        // This ensures each vertex is visited at most once in a Hamiltonian path.
        if (currentVisitedPath.includes(nextNeighborVertex)) {
            continue;
        }

        // Extend the current path by adding the new neighbor.
        // A new array is created to maintain immutability for recursive calls.
        const extendedPath = [...currentVisitedPath, nextNeighborVertex];

        // Recursively call the function for the next vertex.
        if (findHamiltonianCycle(graphAdjacencyList, nextNeighborVertex, extendedPath)) {
            return true; // If a cycle is found deeper in the recursion, propagate 'true' upwards.
        }
    }

    // If no neighbors lead to a Hamiltonian cycle from the current vertex, return false.
    return false;
}

// Immediately Invoked Function Expression (IIFE) for the main program logic.
(function processInputCases() {
    let numberOfWordsInCase;
    let listOfWords;
    let directedGraphStructure;
    let temporaryWordString;
    let terminalCharOfWord;
    let currentLineCursor = 0; // Tracks the current line being read from processedInputLines.
    let activeTestCaseCount = 0; // Counts the number of test cases processed.

    // Loop through test cases until the termination condition ('0') is met or input runs out.
    while (processedInputLines[currentLineCursor] !== '0' && currentLineCursor < processedInputLines.length) {
        activeTestCaseCount++; // Increment the test case counter for reporting.

        // Parse the number of words for the current test case.
        numberOfWordsInCase = parseInt(processedInputLines[currentLineCursor++], 10);

        // Basic validation for the parsed number of words.
        if (isNaN(numberOfWordsInCase) || numberOfWordsInCase < 0) {
            console.error(`Error: Invalid number of words ('${processedInputLines[currentLineCursor - 1]}') for test case ${activeTestCaseCount}. Skipping.`);
            // Attempt to advance cursor past potential malformed word lines if N was a positive number.
            currentLineCursor += numberOfWordsInCase > 0 ? numberOfWordsInCase : 0;
            continue;
        }

        // If the number of words is 0, it indicates the end of input or an empty test case.
        if (numberOfWordsInCase === 0) {
            break; // Exit the loop if a '0' is correctly parsed and handled here.
        }

        // Initialize the array to store the words for the current test case.
        listOfWords = new Array(numberOfWordsInCase);
        for (let wordIndex = 0; wordIndex < numberOfWordsInCase; wordIndex++) {
            listOfWords[wordIndex] = processedInputLines[currentLineCursor++];
            // Optional: Check for empty or invalid word strings.
            if (!listOfWords[wordIndex] || listOfWords[wordIndex].length === 0) {
                 console.warn(`Warning: Empty or undefined word encountered for test case ${activeTestCaseCount} at index ${wordIndex}.`);
            }
        }

        // Initialize the adjacency list for the directed graph.
        // Each element is an empty array representing outgoing edges from a vertex.
        directedGraphStructure = Array.from({ length: numberOfWordsInCase }, () => []);

        // Construct the graph based on word connections.
        // An edge exists from word_A to word_B if word_A's last character
        // matches word_B's first character. Self-loops are explicitly excluded.
        for (let sourceVertexIdx = 0; sourceVertexIdx < numberOfWordsInCase; sourceVertexIdx++) {
            temporaryWordString = listOfWords[sourceVertexIdx];
            // Ensure the word is not empty to avoid errors accessing [length - 1].
            if (!temporaryWordString || temporaryWordString.length === 0) {
                continue; // Skip if the word is empty, no connections can be made from it.
            }
            terminalCharOfWord = temporaryWordString[temporaryWordString.length - 1];

            for (let targetVertexIdx = 0; targetVertexIdx < numberOfWordsInCase; targetVertexIdx++) {
                // Prevent self-loops: a word cannot connect to itself.
                if (sourceVertexIdx === targetVertexIdx) {
                    continue;
                }
                // Check if the first character of the target word matches the last character of the source word.
                if (listOfWords[targetVertexIdx] && terminalCharOfWord === listOfWords[targetVertexIdx][0]) {
                    directedGraphStructure[sourceVertexIdx].push(targetVertexIdx);
                }
            }
        }

        // Initiate the search for a Hamiltonian cycle starting and ending at node 0.
        // The initial path contains only the starting node (0).
        const cycleDetected = findHamiltonianCycle(directedGraphStructure, 0, [0]);

        // Output the result for the current test case.
        console.log(`Test Case ${activeTestCaseCount}: ${cycleDetected ? 'OK' : 'NG'}`);
    }

    // Terminate the process with a success code after all test cases are handled.
    process.exit(0);
})();