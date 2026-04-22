const fileSystem = require("fs"); // Import file system module for input operations

// Define constants for standard paths and messages to improve readability and maintainability
const STANDARD_INPUT_RESOURCE = "/dev/stdin";
const INITIAL_GRAPH_NODE_ID = 1;
const SUCCESS_PATH_INDICATION = "POSSIBLE_TWO_STEP_ROUTE";
const FAILURE_PATH_INDICATION = "NO_SUCH_ROUTE_FOUND";

/**
 * Manages reading and parsing lines from a text-based input source.
 * This class acts as a robust iterator for input data.
 */
class InputLineProcessor {
    #sourceDataLines; // Private field to hold all lines read from the source
    #currentLinePointer = 0; // Private field tracking the current line index
    #totalAvailableLines; // Private field storing the total number of lines

    /**
     * Constructs an InputLineProcessor instance by reading data from the specified path.
     * @param {string} inputPath - The file path from which to read input.
     */
    constructor(inputPath) {
        try {
            // Read file synchronously, decode as UTF-8, remove leading/trailing whitespace, and split into lines
            this.#sourceDataLines = fileSystem.readFileSync(inputPath, "utf8").trim().split("\n");
            this.#totalAvailableLines = this.#sourceDataLines.length;

            // Handle cases where the input file is empty or contains only a single empty line
            if (this.#totalAvailableLines === 0 || (this.#totalAvailableLines === 1 && this.#sourceDataLines[0] === '')) {
                this.#sourceDataLines = []; // Ensure an empty array for consistent state
                this.#totalAvailableLines = 0;
                console.warn("Input stream appears to be empty or contains no meaningful data.");
            }
        } catch (readError) {
            // Log an error if file reading fails and initialize with empty data
            console.error(`ERROR: Failed to access or read input from '${inputPath}': ${readError.message}`);
            this.#sourceDataLines = [];
            this.#totalAvailableLines = 0;
        }
    }

    /**
     * Checks if there are more lines available to be processed.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreData() {
        return this.#currentLinePointer < this.#totalAvailableLines;
    }

    /**
     * Retrieves the next line from the input stream.
     * Throws an error if no more lines are available.
     * @returns {string} The next line of input.
     * @throws {Error} If attempting to read beyond the end of the data stream.
     */
    retrieveNextLine() {
        if (!this.hasMoreData()) {
            throw new Error("InputTraversalError: Attempted to retrieve data beyond the end of the input stream.");
        }
        const lineContent = this.#sourceDataLines[this.#currentLinePointer];
        this.#currentLinePointer++;
        return lineContent;
    }

    /**
     * Internal helper to apply various conversions to a raw string value.
     * This replaces the original `myconv` function with a more focused approach.
     * @param {string} rawString - The string to convert.
     * @param {number} conversionMode - An integer specifying the conversion type.
     * @returns {*} The converted value or the original string if conversion fails or is not specified.
     */
    #applyConversion(rawString, conversionMode) {
        try {
            switch (conversionMode) {
                case 1: return parseInt(rawString, 10); // Convert to integer (base 10)
                case 2: return rawString.split(" "); // Split by space into string array
                case 3: return rawString.split(" ").map(Number); // Split by space and convert to number array
                case 4: return rawString.split(""); // Split into character array
                case 5: return rawString.split("").map(Number); // Split into char array and convert to number array
                default: return rawString; // Return original if mode is unknown
            }
        } catch (conversionError) {
            // Log a warning and return the original string if conversion fails
            console.warn(`WARN: Data conversion failed for value "${rawString}" with mode ${conversionMode}. Returning original. Error: ${conversionError.message}`);
            return rawString;
        }
    }

    /**
     * Fetches the next line and converts it to an integer.
     * @returns {number} The integer value of the next line.
     */
    fetchNextInteger() { return this.#applyConversion(this.retrieveNextLine(), 1); }

    /**
     * Fetches the next line and splits it into a string array by spaces.
     * @returns {string[]} An array of strings.
     */
    fetchNextStringArray() { return this.#applyConversion(this.retrieveNextLine(), 2); }

    /**
     * Fetches the next line, splits it by spaces, and converts elements to numbers.
     * @returns {number[]} An array of numbers.
     */
    fetchNextIntegerArray() { return this.#applyConversion(this.retrieveNextLine(), 3); }

    /**
     * Fetches the next line and splits it into an array of characters.
     * @returns {string[]} An array of characters.
     */
    fetchNextCharacterArray() { return this.#applyConversion(this.retrieveNextLine(), 4); }
}

/**
 * Provides standardized methods for logging output and errors.
 */
const SystemMessenger = {
    /**
     * Outputs a message to the standard console.
     * @param {*} message - The content to be displayed.
     */
    outputMessage: (message) => console.log(message),

    /**
     * Outputs an error message to the standard error console.
     * @param {*} errorMessage - The error content to be displayed.
     */
    reportError: (errorMessage) => console.error(`[SYSTEM ERROR]: ${errorMessage}`),

    /**
     * Logs debug information, conditional on an environment variable.
     * @param {string} tag - A tag to categorize the debug message.
     * @param {*} debugContent - The content of the debug message.
     */
    logDebugInfo: (tag, debugContent) => {
        if (process.env.DEBUG_MODE === 'true') {
            console.debug(`[DEBUG - ${tag}]: ${debugContent}`);
        }
    }
};

// Instantiate the input processor to handle all incoming data
const inputSource = new InputLineProcessor(STANDARD_INPUT_RESOURCE);

// Global helper functions for simplified access to input and output
function getNextLine() { return inputSource.retrieveNextLine(); }
function getNextInt() { return inputSource.fetchNextInteger(); }
function getNextIntArray() { return inputSource.fetchNextIntegerArray(); }
function checkMoreInput() { return inputSource.hasMoreData(); }
function printResult(data) { SystemMessenger.outputMessage(data); }
function printDebug(tag, info) { SystemMessenger.logDebugInfo(tag, info); }

/**
 * Main function to solve the graph connectivity problem.
 * Determines if a path exists from a specific start node (1) to a specific end node (N)
 * via an intermediate node k, such that (1 -> k) and (k -> N) are both direct edges.
 */
function analyzeGraphPath() {
    const operationStartTime = Date.now(); // Record start time for performance metrics

    // Validate initial input for graph parameters (N and M)
    if (!checkMoreInput()) {
        SystemMessenger.reportError("No graph definition parameters found. Cannot proceed with analysis.");
        return;
    }

    const initialGraphParameters = getNextIntArray();
    if (initialGraphParameters.length < 2) {
        SystemMessenger.reportError("Incomplete graph definition. Expected two integers: total nodes (N) and number of edges (M).");
        return;
    }

    const [totalNodesInGraph, numberOfEdges] = initialGraphParameters;
    const finalNodeInGraph = totalNodesInGraph;

    // Apply guard clauses for invalid graph dimensions
    if (totalNodesInGraph < 1 || numberOfEdges < 0) {
        SystemMessenger.reportError(`Invalid graph dimensions provided: Total Nodes = ${totalNodesInGraph}, Edges = ${numberOfEdges}. Required: Nodes >= 1, Edges >= 0.`);
        return;
    }

    // If there are no edges, no path can exist
    if (numberOfEdges === 0) {
        printResult(FAILURE_PATH_INDICATION);
        return;
    }

    // Initialize sets to store relevant nodes
    // 'nodesConnectedFromSource' stores all 'v' where an edge (1 -> v) exists
    const nodesConnectedFromSource = new Set();
    // 'nodesConnectedToDestination' stores all 'u' where an edge (u -> N) exists
    const nodesConnectedToDestination = new Set();

    /**
     * Helper function to process individual edge data and populate the sets.
     * This abstracts the logic for handling each edge.
     * @param {number} startNode - The starting node of the edge.
     * @param {number} endNode - The ending node of the edge.
     */
    const recordRelevantEdge = (startNode, endNode) => {
        if (startNode === INITIAL_GRAPH_NODE_ID) {
            nodesConnectedFromSource.add(endNode);
        }
        if (endNode === finalNodeInGraph) {
            nodesConnectedToDestination.add(startNode);
        }
    };

    // Iterate through all provided edges
    let edgeCounter = 0;
    while (edgeCounter < numberOfEdges && checkMoreInput()) {
        const currentEdgeDefinition = getNextIntArray();

        // Validate edge data format
        if (currentEdgeDefinition.length < 2) {
            SystemMessenger.reportError(`Skipping malformed edge definition at iteration ${edgeCounter}: '${currentEdgeDefinition}'. Expected two integers.`);
            edgeCounter++; // Increment counter to prevent infinite loops on bad data
            continue; // Move to the next edge
        }

        recordRelevantEdge(currentEdgeDefinition[0], currentEdgeDefinition[1]);
        edgeCounter++;
    }

    // Output debug information about the collected sets (conditional on DEBUG_MODE)
    printDebug("NodesInfo", `From Source (${INITIAL_GRAPH_NODE_ID}): ${Array.from(nodesConnectedFromSource)}`);
    printDebug("NodesInfo", `To Destination (${finalNodeInGraph}): ${Array.from(nodesConnectedToDestination)}`);

    // Early exit if either set is empty, as no common intermediate node can exist
    if (nodesConnectedFromSource.size === 0 || nodesConnectedToDestination.size === 0) {
        printResult(FAILURE_PATH_INDICATION);
        return;
    }

    let isPathEstablished = false; // Intermediate flag to track path discovery

    // Check for common intermediate nodes using an enhanced loop
    // We iterate through nodes that lead to N and check if any of them are reachable from 1.
    for (const potentialIntermediateNode of nodesConnectedToDestination) {
        if (nodesConnectedFromSource.has(potentialIntermediateNode)) {
            isPathEstablished = true;
            break; // A common node is found, no need to check further
        }
    }

    // Output the final result based on whether a path was established
    if (isPathEstablished) {
        printResult(SUCCESS_PATH_INDICATION);
    } else {
        printResult(FAILURE_PATH_INDICATION);
    }

    const operationEndTime = Date.now();
    SystemMessenger.logDebugInfo("Performance", `Total execution time: ${operationEndTime - operationStartTime} milliseconds.`);
}

// Execute the main graph analysis function
analyzeGraphPath();