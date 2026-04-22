"use strict";

// This class, renamed from 'I', is responsible for parsing input data from a string.
// It provides methods to extract individual tokens or entire lines, performing type conversion.
class InputTokenStream {
    // The constructor initializes the stream with a source string and an optional parsing function.
    // 'inputLines' stores the input split by newlines (formerly '_s').
    // 'lineCursor' tracks the current line being processed (formerly '_l').
    // 'tokenCursor' tracks the current token within the line (formerly '_c').
    // 'valueParser' is the function used to convert token strings to desired types (formerly '_f').
    // 'currentLineTokens' is a buffer holding tokens of the line currently being processed by 'extractNextValue'.
    constructor(sourceString, valueConverter = parseInt) { // Changed default parser to parseInt for typical use case
        this.inputLines = sourceString.split('\n');
        this.lineCursor = 0;
        this.tokenCursor = 0;
        this.valueParser = valueConverter;
        this.currentLineTokens = []; // Buffer for tokens of the current line
        this._loadNextValidLineIntoBuffer(); // Initial load to prepare the first line
    }

    // Private helper method to advance the line cursor and load the next non-empty line's tokens into the buffer.
    // This ensures 'currentLineTokens' always contains tokens from a valid line, or is empty if no more content.
    _loadNextValidLineIntoBuffer() {
        this.currentLineTokens = [];
        this.tokenCursor = 0; // Reset token cursor whenever a new line is loaded
        while (this.lineCursor < this.inputLines.length) {
            const rawLine = this.inputLines[this.lineCursor];
            // Robustly split by one or more whitespace characters and filter out any empty strings resulting from split
            const tokens = rawLine.trim().split(/\s+/).filter(Boolean);
            this.lineCursor++; // Advance the line cursor to the next line
            if (tokens.length > 0) {
                this.currentLineTokens = tokens;
                return true; // Successfully loaded a line with tokens
            }
            // If the line was empty or only whitespace, continue to the next line
        }
        return false; // No more lines with content in the input stream
    }

    // Renamed from 'a()', this method extracts and parses the next single token from the stream.
    // It automatically manages line advancement when the current line's tokens are exhausted.
    extractNextValue() {
        // If all tokens in the current buffer have been read, attempt to load the next line
        if (this.tokenCursor >= this.currentLineTokens.length) {
            if (!this._loadNextValidLineIntoBuffer()) {
                // If no more valid lines can be loaded, there are no more tokens
                return undefined;
            }
        }

        const tokenString = this.currentLineTokens[this.tokenCursor];
        this.tokenCursor++; // Move to the next token position

        try {
            return this.valueParser(tokenString);
        } catch (error) {
            // Enhanced error handling for parsing failures (Type III addition)
            console.error(`Input parsing error for token '${tokenString}': ${error.message}`);
            return NaN; // Return NaN to indicate a parsing failure
        }
    }

    // Renamed from 'l()', this method extracts and parses all tokens from the next available line.
    // It consumes the entire line and advances the line cursor, resetting the token cursor.
    extractCurrentLineAsArray() {
        // Check if there are any lines left to process
        if (this.lineCursor >= this.inputLines.length) {
            return undefined; // No more lines available
        }

        const lineToProcess = this.inputLines[this.lineCursor];
        this.lineCursor++; // Advance to the next line for subsequent reads

        // Reset the token buffer and cursor as this method fully consumes a line
        this.tokenCursor = 0;
        this.currentLineTokens = [];

        // Split the line, filter out empty strings, and map using the value parser
        const tokens = lineToProcess.trim().split(/\s+/).filter(Boolean);
        return tokens.map(tokenString => {
            try {
                return this.valueParser(tokenString);
            } catch (error) {
                // Error handling for individual tokens within an array line
                console.error(`Input parsing error in line array for token '${tokenString}': ${error.message}`);
                return NaN;
            }
        });
    }

    // New method: Checks if there is any more readable content (tokens or non-empty lines) in the stream.
    hasMoreContent() {
        // First, check if the current buffered line still has unread tokens
        if (this.tokenCursor < this.currentLineTokens.length) {
            return true;
        }
        // If not, check if there are any remaining lines in the input that are not empty
        for (let i = this.lineCursor; i < this.inputLines.length; i++) {
            if (this.inputLines[i].trim().length > 0) {
                return true;
            }
        }
        return false; // No more content found
    }
}

// Renamed from 'main' to 'analyzeGraphProperties'.
// This function performs the primary logic of reading graph data and evaluating its degree-based characteristics.
function analyzeGraphProperties(rawInputData) {
    // Instantiate the custom input parser for this graph analysis session.
    const graphDataReader = new InputTokenStream(rawInputData);

    // Read the total number of vertices (N) and edges (M) from the input.
    const numberOfVertices = graphDataReader.extractNextValue(); // Renamed 'N'
    const numberOfEdges = graphDataReader.extractNextValue();   // Renamed 'M'

    // --- Input Validation (Type III addition: Guard clauses for robustness) ---
    if (isNaN(numberOfVertices) || numberOfVertices <= 0) {
        console.log("No"); // Assume "No" for invalid graph structure, or exit.
        return;
    }
    if (isNaN(numberOfEdges) || numberOfEdges < 0) {
        console.log("No"); // Assume "No" for invalid graph structure, or exit.
        return;
    }

    // Initialize the adjacency list for the graph.
    // 'nodeAdjacencyMap' is renamed from 'adj'. Using Array.from for concise initialization.
    // Uses 1-based indexing for nodes, so array size is numberOfVertices + 1.
    const nodeAdjacencyMap = Array.from({ length: numberOfVertices + 1 }, () => []);

    // Loop through and process each edge to build the graph's adjacency list.
    for (let edgeIndex = 0; edgeIndex < numberOfEdges; edgeIndex++) { // Renamed 'i' to 'edgeIndex'
        const firstNode = graphDataReader.extractNextValue();  // Renamed 'ai'
        const secondNode = graphDataReader.extractNextValue(); // Renamed 'bi'

        // --- Edge Data Validation (Type III addition: Skip invalid edges gracefully) ---
        if (isNaN(firstNode) || isNaN(secondNode) ||
            firstNode < 1 || firstNode > numberOfVertices ||
            secondNode < 1 || secondNode > numberOfVertices) {
            // Log a warning and skip the current invalid edge. This ensures the program doesn't crash
            // on malformed input, but might alter results for invalid graphs.
            console.error(`Warning: Skipping invalid edge definition: (${firstNode}, ${secondNode}).`);
            continue; // Move to the next edge
        }

        // Add connections for an undirected graph (bidirectional links)
        nodeAdjacencyMap[firstNode].push(secondNode);
        nodeAdjacencyMap[secondNode].push(firstNode);
    }

    // --- Graph Property Evaluation ---
    // Initialize flags and counters for the required degree properties.
    // 'hasNodeWithDegreeSix' renamed from 'six'.
    // 'countOfFourDegreeNodes' renamed from 'four'.
    // 'allNodeDegreesAreEven' renamed from 'flag2'.
    let hasNodeWithDegreeSix = false;
    let countOfFourDegreeNodes = 0;
    let allNodeDegreesAreEven = true; // Assume true until an odd degree is found

    // Introduce an explicit array to store calculated degrees (Type III addition: intermediate data structure).
    // This avoids recalculating `nodeAdjacencyMap[nodeIdentifier].length` repeatedly if needed elsewhere.
    const calculatedDegrees = new Array(numberOfVertices + 1).fill(0);

    // Iterate through all nodes (from 1 to numberOfVertices) to compute and evaluate their degrees.
    for (let nodeIdentifier = 1; nodeIdentifier <= numberOfVertices; nodeIdentifier++) { // Renamed 'i' to 'nodeIdentifier'
        const currentNodesDegree = nodeAdjacencyMap[nodeIdentifier].length;
        calculatedDegrees[nodeIdentifier] = currentNodesDegree; // Store the degree for the current node

        // Check if any node has a degree of 6
        if (currentNodesDegree === 6) {
            hasNodeWithDegreeSix = true;
        }

        // Count nodes that have a degree of 4
        if (currentNodesDegree === 4) {
            countOfFourDegreeNodes++;
        }

        // Check if all nodes have an even degree.
        // The condition `allNodeDegreesAreEven && ...` acts as a short-circuit,
        // preventing unnecessary reassignments once an odd degree is found. (Type III update)
        if (allNodeDegreesAreEven && (currentNodesDegree % 2 !== 0)) {
            allNodeDegreesAreEven = false;
            // Optimization: If `allNodeDegreesAreEven` becomes false, and no other checks depend on its current value
            // (i.e., `hasNodeWithDegreeSix` and `countOfFourDegreeNodes` still need full iteration),
            // we continue the loop. If it was the only check, we could `break`.
        }
    }

    // --- Final Condition Evaluation ---
    // Decompose the complex boolean expression into more readable intermediate variables (Type III addition).
    const satisfiesDegreeSixOrTwoFours = hasNodeWithDegreeSix || (countOfFourDegreeNodes >= 2);
    const satisfiesAllEvenDegrees = allNodeDegreesAreEven;

    // Define a helper function for consistent output (Type III addition).
    function outputFinalVerdict(isSatisfied) {
        console.log(isSatisfied ? "Yes" : "No");
    }

    // Output the final result based on the combined logical conditions.
    outputFinalVerdict(satisfiesDegreeSixOrTwoFours && satisfiesAllEvenDegrees);
}

// Entry point of the script: reads input from stdin and passes it to the analysis function.
analyzeGraphProperties(require("fs").readFileSync("/dev/stdin", "utf8"));