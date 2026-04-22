const fileSystem = require('fs'); // Renamed 'fs' import for clarity

// --- Configuration Constants ---
const INPUT_SOURCE_PATH = '/dev/stdin'; // Path to read graph data and queries from

// --- Node Visit State Constants for BFS ---
// UNVISITED: Node has not been encountered yet.
// IN_PROGRESS: Node has been added to the queue for processing, but its neighbors haven't all been explored.
// VISITED: Node has been fully processed (all its neighbors have been checked/added to queue).
const UNVISITED = 0;
const IN_PROGRESS = 1;
const VISITED = 2;

// --- Helper Functions for Input Processing ---

/**
 * Reads all lines from a specified file path, cleans them, and splits them into an array.
 * Includes basic error handling for file operations.
 * @param {string} filePath - The path to the input file.
 * @returns {string[]} An array of strings, where each string is a line from the input file.
 */
function retrieveAllInputLines(filePath) {
    try {
        // Read file content as a buffer, convert to UTF-8 string, remove leading/trailing whitespace.
        const contentBuffer = fileSystem.readFileSync(filePath);
        const contentString = contentBuffer.toString('utf8').trim();

        // If the file is empty after trimming, return an empty array and log an error.
        if (!contentString) {
            console.error("Input processing error: The provided input file appears to be empty.");
            return [];
        }

        // Split the cleaned string into an array of lines.
        return contentString.split('\n');
    } catch (error) {
        // Catch and log any errors during file reading.
        console.error(`Input processing error: Failed to read data from ${filePath}. Details: ${error.message}`);
        return []; // Return an empty array to indicate failure.
    }
}

/**
 * Parses a string expected to contain two space-separated numbers into a numeric array.
 * Throws an error if parsing fails or the format is incorrect.
 * @param {string} lineContent - The string line to parse (e.g., "5 3").
 * @param {string} [separator=' '] - The delimiter character for splitting the numbers.
 * @returns {number[]} An array containing two numbers.
 */
function parseTwoNumericValues(lineContent, separator = ' ') {
    const numericParts = lineContent.split(separator).map(Number);

    // Validate that exactly two numbers were parsed and both are valid numbers.
    if (numericParts.length !== 2 || numericParts.some(isNaN)) {
        throw new Error(`Malformed input line. Expected two numbers, but received: "${lineContent}"`);
    }
    return numericParts;
}

// --- Graph Data Structure Class ---

/**
 * Represents an undirected graph using an adjacency list.
 * Provides methods for adding edges and checking path existence using BFS.
 */
class GraphStructure {
    /**
     * Constructs a new GraphStructure instance.
     * @param {number} totalVertexCount - The total number of vertices (nodes) in the graph.
     */
    constructor(totalVertexCount) {
        // Ensure a valid number of vertices.
        if (totalVertexCount <= 0) {
            throw new Error("Graph creation error: The graph must contain a positive number of vertices.");
        }
        this.vertexCount = totalVertexCount;
        // Initialize an array of empty arrays to represent adjacency lists for each vertex.
        // Each index corresponds to a vertex, and its value is an array of connected neighbors.
        this.vertexAdjacencyLists = Array.from({ length: totalVertexCount }, () => []);
        // Comment: Array.from with an object {length: N} is a concise way to create an array of a specific size.
    }

    /**
     * Registers an undirected edge between two specified vertices.
     * @param {number} vertexA - The index of the first vertex.
     * @param {number} vertexB - The index of the second vertex.
     */
    registerUndirectedEdge(vertexA, vertexB) {
        // Perform bounds checking for vertex indices to prevent out-of-bounds access.
        if (vertexA < 0 || vertexA >= this.vertexCount || vertexB < 0 || vertexB >= this.vertexCount) {
            throw new Error(`Edge registration error: Invalid vertex index provided for edge (${vertexA}, ${vertexB}). Max index is ${this.vertexCount - 1}.`);
        }
        // For an undirected graph, add the connection in both directions.
        this.vertexAdjacencyLists[vertexA].push(vertexB);
        this.vertexAdjacencyLists[vertexB].push(vertexA);
        // Comment: This implementation allows for parallel edges (multiple edges between the same two vertices).
        // If unique edges were required, a Set could be used for adjacency lists.
    }

    /**
     * Determines if a path exists between a starting vertex and an ending vertex using Breadth-First Search (BFS).
     * @param {number} startVertex - The index of the starting vertex.
     * @param {number} endVertex - The index of the ending vertex.
     * @returns {boolean} True if a path exists, false otherwise.
     */
    checkPathExistence(startVertex, endVertex) {
        // Optimization: If start and end are the same, a path of zero length exists.
        if (startVertex === endVertex) {
            return true;
        }

        // Validate vertex indices for the query.
        if (startVertex < 0 || startVertex >= this.vertexCount || endVertex < 0 || endVertex >= this.vertexCount) {
            console.warn(`Path query warning: Invalid vertex indices (${startVertex}, ${endVertex}). Returning false.`);
            return false;
        }

        // Initialize an array to keep track of the visit state of each vertex during BFS.
        const vertexVisitStates = new Array(this.vertexCount).fill(UNVISITED);
        // Initialize the BFS queue with the starting vertex.
        const bfsProcessingQueue = [startVertex];
        // Mark the starting vertex as "in progress" (added to queue).
        vertexVisitStates[startVertex] = IN_PROGRESS;

        // Continue BFS as long as there are vertices in the queue to process.
        while (bfsProcessingQueue.length > 0) {
            // Dequeue the next vertex to process.
            const currentVertex = bfsProcessingQueue.shift();

            // Mark the current vertex as fully visited (all its neighbors are being considered).
            vertexVisitStates[currentVertex] = VISITED;

            // Iterate over all neighbors of the current vertex.
            // Comment: Using a for...of loop for more readable iteration over array elements.
            for (const neighborVertex of this.vertexAdjacencyLists[currentVertex]) {
                // If the neighbor is the target vertex, a path has been found.
                if (neighborVertex === endVertex) {
                    return true;
                }
                // If the neighbor has not been visited yet, add it to the queue for future processing.
                if (vertexVisitStates[neighborVertex] === UNVISITED) {
                    vertexVisitStates[neighborVertex] = IN_PROGRESS; // Mark as in-progress
                    bfsProcessingQueue.push(neighborVertex); // Enqueue the neighbor
                }
            }
        }
        // If the queue becomes empty and the endVertex was not reached, no path exists.
        return false;
    }
}

// --- Main Program Execution ---

/**
 * The primary function that orchestrates reading graph data, building the graph,
 * processing queries, and outputting results.
 * Wrapped in an immediately invoked async function for modern JavaScript practices,
 * though `readFileSync` is synchronous here.
 */
(async function graphPathAnalyzer() {
    // Retrieve all lines from the input source.
    let allInputDataLines = retrieveAllInputLines(INPUT_SOURCE_PATH);
    if (allInputDataLines.length === 0) {
        // Error message already printed by retrieveAllInputLines if empty.
        return; // Exit if no input data.
    }

    // Parse the first line to get the total number of vertices and edges.
    const [totalVertexCount, totalEdgeCount] = parseTwoNumericValues(allInputDataLines.shift());
    
    // Perform initial validation on graph dimensions.
    if (totalVertexCount <= 0 || totalEdgeCount < 0) {
        console.error("Initialization error: Graph must have a positive number of vertices and a non-negative number of edges.");
        return;
    }

    let graphInstance;
    try {
        // Attempt to create a new graph instance.
        graphInstance = new GraphStructure(totalVertexCount);
    } catch (e) {
        console.error(`Graph construction failed: ${e.message}`);
        return; // Exit if graph construction fails.
    }

    // Process all edge definitions from the input.
    for (let currentEdgeIndex = 0; currentEdgeIndex < totalEdgeCount; currentEdgeIndex++) {
        if (allInputDataLines.length === 0) {
            console.error(`Input error: Expected ${totalEdgeCount} edge definitions, but input ended prematurely at edge ${currentEdgeIndex}.`);
            return; // Exit if input lines run out unexpectedly.
        }
        try {
            // Parse two vertex indices for the current edge.
            const [sourceVertex, destinationVertex] = parseTwoNumericValues(allInputDataLines.shift());
            // Register the undirected edge in the graph.
            graphInstance.registerUndirectedEdge(sourceVertex, destinationVertex);
        } catch (e) {
            console.error(`Edge processing error for edge ${currentEdgeIndex + 1}: ${e.message}`);
            return; // Exit on any error during edge processing.
        }
    }

    // The next line in the input is expected to be the number of queries.
    if (allInputDataLines.length === 0) {
        console.error("Input error: Expected query count line after edge definitions, but input stream is exhausted.");
        return;
    }
    const queryCountLine = allInputDataLines.shift();
    const expectedQueryCount = Number(queryCountLine);

    // Validate the parsed query count.
    if (isNaN(expectedQueryCount) || expectedQueryCount < 0) {
        console.error(`Input error: Invalid query count specified. Expected a non-negative number, got: "${queryCountLine}"`);
        return;
    }

    const pathCheckResults = []; // Array to store results of each query.

    // Process all reachability queries.
    for (let currentQueryIndex = 0; currentQueryIndex < expectedQueryCount; currentQueryIndex++) {
        if (allInputDataLines.length === 0) {
            console.error(`Input error: Expected ${expectedQueryCount} queries, but ran out of input lines at query ${currentQueryIndex + 1}.`);
            pathCheckResults.push('query_input_missing'); // Indicate an error for this specific query.
            continue; // Attempt to process remaining queries if any, or just move on.
        }
        try {
            // Parse the start and end vertices for the current query.
            const [queryStartNode, queryEndNode] = parseTwoNumericValues(allInputDataLines.shift());
            // Use the graph instance to check for a path.
            const isPathFound = graphInstance.checkPathExistence(queryStartNode, queryEndNode);
            // Store 'yes' or 'no' based on the path existence.
            pathCheckResults.push(isPathFound ? 'yes' : 'no');
        } catch (e) {
            console.error(`Query processing error for query ${currentQueryIndex + 1}: ${e.message}`);
            pathCheckResults.push('query_parse_error'); // Indicate an error in the output for this query.
        }
    }

    // Output all collected results, each on a new line.
    console.log(pathCheckResults.join('\n'));

})(); // End of graphPathAnalyzer IIFE