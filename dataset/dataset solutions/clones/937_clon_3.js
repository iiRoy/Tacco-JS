const fileSystem = require('fs'); // Import the file system module for I/O operations.

// Read all raw input data from standard input, decode as UTF-8.
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim leading/trailing whitespace and split into individual lines.
const inputLineBuffer = rawInputContent.trim().split('\n');

// Extract the graph dimension from the first line of input.
// We use parseInt with radix 10 for explicit conversion.
let graphDimension = parseInt(inputLineBuffer.shift(), 10);

// --- Input Validation: Ensure the graph dimension is valid ---
if (isNaN(graphDimension) || graphDimension <= 0) {
    console.error("Error: The graph dimension must be a positive integer.");
    process.exit(1); // Terminate the program with an error code.
}

// Initialize an empty adjacency matrix (2D array) with the determined dimension.
// All cells are initially set to 0, indicating no direct connection.
let adjacencyGrid = [];
for (let r = 0; r < graphDimension; r++) {
    // Create a new row and fill it with zeros.
    adjacencyGrid[r] = new Array(graphDimension).fill(0);
}

/**
 * Parses the remaining input lines to populate the adjacency matrix.
 * Each line describes a node and its direct connections.
 *
 * @param {Array<Array<number>>} matrix The adjacency matrix to populate.
 * @param {number} size The dimension of the matrix/graph.
 * @param {Array<string>} dataLines An array of strings, each representing a line of input data.
 */
const populateAdjacencyMatrix = (matrix, size, dataLines) => {
    // Iterate through each line representing a node's connections.
    for (let currentLineIndex = 0; currentLineIndex < size; currentLineIndex++) {
        const lineDataRaw = dataLines.shift(); // Get the next line from the buffer.

        if (!lineDataRaw) { // Guard against insufficient input lines.
            console.warn(`Warning: Expected ${size} lines for connections, but received fewer. Stopping.`);
            break;
        }

        // Split the line by spaces and convert all parts to numbers.
        const lineNumericSegments = lineDataRaw.split(' ').map(Number);

        // Basic validation for the line's structure.
        if (lineNumericSegments.length < 2) {
            console.warn(`Warning: Skipping malformed input line: "${lineDataRaw}". Not enough segments.`);
            continue;
        }

        // The first number is the source node ID (1-based index).
        const sourceNodeIdentifier = lineNumericSegments[0];
        // The second number is the count of connected nodes (not directly used for iteration, but parsed).
        const numberOfConnections = lineNumericSegments[1];

        // The subsequent numbers are the target node IDs (1-based index).
        // We use slice(2) to get only the connected nodes, effectively "deleting" the shifts.
        const connectedTargetIdentifiers = lineNumericSegments.slice(2);

        // Convert the 1-based source node ID to a 0-based array index.
        const sourceNodeZeroBasedIndex = sourceNodeIdentifier - 1;

        // --- Node Index Validation ---
        if (sourceNodeZeroBasedIndex < 0 || sourceNodeZeroBasedIndex >= size) {
            console.warn(`Warning: Source Node ID ${sourceNodeIdentifier} is out of bounds [1, ${size}]. Skipping this line.`);
            continue;
        }

        // Iterate over each connected target node identifier.
        for (const targetNodeIdentifier of connectedTargetIdentifiers) {
            // Convert the 1-based target node ID to a 0-based array index.
            const targetNodeZeroBasedIndex = targetNodeIdentifier - 1;

            // --- Target Node Index Validation ---
            if (targetNodeZeroBasedIndex < 0 || targetNodeZeroBasedIndex >= size) {
                console.warn(`Warning: Target Node ID ${targetNodeIdentifier} is out of bounds [1, ${size}] for source ${sourceNodeIdentifier}. Skipping this connection.`);
                continue;
            }

            // Set the corresponding cell in the adjacency matrix to 1, indicating a connection.
            matrix[sourceNodeZeroBasedIndex][targetNodeZeroBasedIndex] = 1;
        }
    }
};

// Execute the function to fill the adjacency matrix.
populateAdjacencyMatrix(adjacencyGrid, graphDimension, inputLineBuffer);

/**
 * Formats the adjacency matrix into a human-readable string.
 * Each row's elements are joined by a space, and rows are joined by a newline.
 *
 * @param {Array<Array<number>>} matrix The adjacency matrix to format.
 * @returns {string} The formatted string representation of the matrix.
 */
const formatMatrixForOutput = (matrix) => {
    // Map each row array to a string where elements are separated by spaces.
    const stringifiedRows = matrix.map(row => row.join(' '));
    // Join all the stringified rows with newline characters.
    return stringifiedRows.join('\n');
};

// Generate the final output string.
const formattedResult = formatMatrixForOutput(adjacencyGrid);

// Print the final formatted adjacency matrix to standard output.
console.log(formattedResult);