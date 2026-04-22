const InputParserFactory = (function() {
    /**
     * Creates a new input parser instance.
     * @param {string} rawInputTextContent - The entire input content as a single string.
     * @returns {InputDataParser} A parser object.
     */
    function createParser(rawInputTextContent) {
        return new InputDataParser(rawInputTextContent);
    }

    /**
     * Represents an input data parser, designed to process input line by line or token by token.
     * It maintains internal state to manage raw lines and tokenized portions of the current line.
     */
    function InputDataParser(rawInputTextContent) {
        // Stores all raw input lines as strings. This buffer is not modified.
        this._allRawLines = rawInputTextContent.trim().split('\n');
        // Pointer to the current line index in _allRawLines that is being processed or is next.
        this._currentLineCursor = 0;

        // A temporary buffer to hold tokens of the line currently being processed by `readNextToken`.
        this._currentTokenBuffer = [];
        // The index of the line in `_allRawLines` that `_currentTokenBuffer` corresponds to.
        // -1 indicates the buffer is invalid or empty.
        this._currentTokenBufferSourceLineIdx = -1;
    }

    /**
     * Internal helper to ensure `_currentTokenBuffer` contains tokens for `_currentLineCursor`.
     * Tokenizes the current raw line if it hasn't been done yet or if the line has changed.
     * @private
     * @returns {boolean} True if there are lines left to process, false otherwise.
     */
    InputDataParser.prototype._prepareCurrentLineTokens = function() {
        if (this._currentLineCursor >= this._allRawLines.length) {
            return false; // No more lines in the input.
        }

        // If the token buffer does not match the current line, or is empty, re-tokenize.
        if (this._currentTokenBufferSourceLineIdx !== this._currentLineCursor) {
            const lineContent = this._allRawLines[this._currentLineCursor];
            // Split by spaces and filter out any empty strings resulting from multiple spaces.
            this._currentTokenBuffer = lineContent.split(' ').filter(token => token.length > 0);
            this._currentTokenBufferSourceLineIdx = this._currentLineCursor;
        }
        return true;
    };

    /**
     * Helper to convert an array of string numbers to an array of actual numbers.
     * @private
     * @param {string[]} stringNumberArray - An array of strings representing numbers.
     * @returns {number[]} An array of numbers.
     */
    InputDataParser.prototype._castToNumbers = function(stringNumberArray) {
        return stringNumberArray.map(val => Number(val));
    };

    /**
     * Reads and returns the next single token from the input stream.
     * It processes tokens from the current line, advancing to the next line when the current one is exhausted.
     *
     * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, as a number.
     * @returns {string|number|undefined} The next token, or `undefined` if the end of input is reached.
     */
    InputDataParser.prototype.readNextToken = function(returnAsString = false) {
        while (this._prepareCurrentLineTokens()) {
            if (this._currentTokenBuffer.length > 0) {
                const tokenExtracted = this._currentTokenBuffer.shift(); // Get the first token (FIFO)
                if (this._currentTokenBuffer.length === 0) {
                    // If all tokens from this line are consumed, advance to the next raw line.
                    this._currentLineCursor++;
                    this._currentTokenBufferSourceLineIdx = -1; // Invalidate the token buffer.
                }
                return returnAsString ? tokenExtracted : Number(tokenExtracted);
            } else {
                // The current line was empty (e.g., just spaces or blank). Advance to the next raw line.
                this._currentLineCursor++;
                this._currentTokenBufferSourceLineIdx = -1; // Invalidate the token buffer.
            }
        }
        // No more input tokens available across all lines.
        return undefined;
    };

    /**
     * Reads an entire line of space-separated tokens.
     * This method consumes a full raw line from the input.
     *
     * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
     * @returns {string[]|number[]|undefined} An array of tokens for the line, or `undefined` if end of input.
     */
    InputDataParser.prototype.readLineTokens = function(returnAsStrings = false) {
        if (this._currentLineCursor >= this._allRawLines.length) {
            return undefined; // End of input.
        }

        // Consume the raw line and advance the line cursor.
        const rawLineContent = this._allRawLines[this._currentLineCursor++];
        // Invalidate the token buffer for `readNextToken` as its source line has now been consumed by this method.
        this._currentTokenBufferSourceLineIdx = -1;

        const tokensOnLine = rawLineContent.split(' ').filter(token => token.length > 0);
        return returnAsStrings ? tokensOnLine : this._castToNumbers(tokensOnLine);
    };

    /**
     * Reads a specified number of lines, treating each as a row in a matrix.
     * Each line is split into tokens.
     *
     * @param {number} numberOfLines - The count of lines to read for the matrix.
     * @param {boolean} [returnAsStrings=false] - If true, all matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
     */
    InputDataParser.prototype.readMatrix = function(numberOfLines, returnAsStrings = false) {
        if (numberOfLines < 0) {
            throw new Error("Number of lines for matrix must be non-negative.");
        }
        if (this._currentLineCursor + numberOfLines > this._allRawLines.length) {
            console.warn(`Warning: Attempted to read ${numberOfLines} lines for matrix, but only ${this._allRawLines.length - this._currentLineCursor} lines remain. Reading available lines.`);
            numberOfLines = this._allRawLines.length - this._currentLineCursor;
        }

        const matrixResult = [];
        for (let i = 0; i < numberOfLines; ++i) {
            matrixResult.push(this.readLineTokens(returnAsStrings));
        }
        return matrixResult;
    };

    /**
     * Reads a specified number of raw lines from the input.
     *
     * @param {number} numberOfLines - The count of raw lines to read.
     * @param {boolean} [returnAsNumbers=false] - If true, attempts to convert each line to a number.
     * @returns {string[]|number[]} An array of raw line strings or numbers.
     */
    InputDataParser.prototype.readRawLines = function(numberOfLines, returnAsNumbers = false) {
        if (numberOfLines < 0) {
            throw new Error("Number of lines to read cannot be negative.");
        }
        if (this._currentLineCursor + numberOfLines > this._allRawLines.length) {
            console.warn(`Warning: Attempted to read ${numberOfLines} raw lines, but only ${this._allRawLines.length - this._currentLineCursor} lines remain. Reading available lines.`);
            numberOfLines = this._allRawLines.length - this._currentLineCursor;
        }

        const consumedLines = this._allRawLines.slice(this._currentLineCursor, this._currentLineCursor + numberOfLines);
        this._currentLineCursor += numberOfLines;
        // Invalidate the token buffer for `readNextToken` as these lines are now consumed.
        this._currentTokenBufferSourceLineIdx = -1;

        return returnAsNumbers ? this._castToNumbers(consumedLines) : consumedLines;
    };

    return createParser;
})();

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This function uses the `Function` constructor for dynamic code generation,
 * which is functionally similar to `eval` but provides a slightly cleaner scope.
 *
 * @param {*} initialFillerValue - The value to fill the innermost array elements with.
 * @param {...number} arrayDimensions - The desired dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimensionalArray(initialFillerValue) {
    const arrayDimensions = Array.from(arguments).slice(1); // Collect all arguments after initialFillerValue
    const numberOfDimensions = arrayDimensions.length;

    if (numberOfDimensions === 0) {
        return initialFillerValue; // A single value if no dimensions are provided.
    }

    // Construct the JavaScript code string to dynamically create the nested arrays.
    // Example for dimensions [D1, D2, D3]:
    // Array(D1).fill(null).map(() => Array(D2).fill(null).map(() => Array(D3).fill(initialFillerValue)))
    let dynamicArrayCreationCode = `Array(arrayDimensions[${numberOfDimensions - 1}]).fill(null).map(() => initialFillerValue)`;

    for (let i = numberOfDimensions - 2; i >= 0; --i) {
        dynamicArrayCreationCode = `Array(arrayDimensions[${i}]).fill(null).map(() => ${dynamicArrayCreationCode})`;
    }

    // Use the Function constructor to execute the generated code.
    // This creates a function that takes `arrayDimensions` and `initialFillerValue` as arguments.
    const arrayBuilderFunction = new Function('arrayDimensions', 'initialFillerValue', `return ${dynamicArrayCreationCode};`);
    return arrayBuilderFunction(arrayDimensions, initialFillerValue);
}

// Global variables to store graph properties and structure.
let graphNodeCount;
let graphEdgeCount;
let graphAdjacencyList; // Represents the graph using an adjacency list.

/**
 * Executes the main graph analysis logic: reads input, builds the graph,
 * and searches for the shortest cycle.
 *
 * @returns {string|number} A string representing the shortest cycle path (1-based node indices, newline-separated),
 *                          or -1 if no cycle is found. The length of the cycle is printed to console as a side effect.
 */
function executeGraphAnalysis() {
    // Read the number of nodes (N) and edges (M) from the input.
    graphNodeCount = inputReader.readNextToken();
    graphEdgeCount = inputReader.readNextToken();

    // Perform basic input validation.
    if (graphNodeCount === undefined || graphEdgeCount === undefined || graphNodeCount < 0 || graphEdgeCount < 0) {
        console.error("Input error: Node count and/or Edge count are invalid or missing.");
        return -1;
    }
    if (graphNodeCount === 0) {
        return -1; // No nodes, no cycles possible.
    }
    if (graphNodeCount === 1 && graphEdgeCount === 0) {
        return -1; // Single node, no edges, no cycle.
    }

    // Read all edge definitions. Each entry in `inputEdges` is an array like `[fromNode, toNode]`.
    const inputEdges = inputReader.readMatrix(graphEdgeCount);

    // Initialize the adjacency list. Each node (0 to N-1) will have an empty array for its neighbors.
    graphAdjacencyList = createMultiDimensionalArray([], graphNodeCount);

    // Populate the adjacency list based on the `inputEdges`.
    // Node indices from input are 1-based, convert to 0-based for internal array access.
    for (let i = 0; i < graphEdgeCount; ++i) {
        const currentEdge = inputEdges[i];
        if (!currentEdge || currentEdge.length !== 2) {
            console.warn(`Skipping malformed edge entry: ${currentEdge}. Expected two numbers.`);
            continue;
        }
        const [sourceNode, destinationNode] = currentEdge;

        // Validate node indices to prevent out-of-bounds access.
        if (sourceNode >= 1 && sourceNode <= graphNodeCount && destinationNode >= 1 && destinationNode <= graphNodeCount) {
            graphAdjacencyList[sourceNode - 1].push(destinationNode - 1);
        } else {
            console.warn(`Skipping edge [${sourceNode}, ${destinationNode}] due to invalid node index. Nodes must be between 1 and ${graphNodeCount}.`);
        }
    }

    // Initialize `shortestCyclePathFound` to represent an infinitely long path (or no path found yet).
    // An array of length `graphNodeCount + 1` is used as an initial placeholder,
    // as the maximum possible cycle length is `graphNodeCount`.
    let shortestCyclePathFound = Array(graphNodeCount + 1).fill(null); // Length `N+1` implies "not found"

    // Iterate through each node in the graph, attempting to find the shortest cycle starting from it.
    for (let startNodeIndex = 0; startNodeIndex < graphNodeCount; ++startNodeIndex) {
        const potentialCyclePath = findShortestCycleBFS(startNodeIndex);

        // If a cycle was found (`potentialCyclePath` is not undefined)
        // and its length is shorter than the current shortest path found, update.
        if (potentialCyclePath !== undefined && potentialCyclePath.length < shortestCyclePathFound.length) {
            shortestCyclePathFound = potentialCyclePath;
        }
    }

    // After checking all possible starting nodes, evaluate the result.
    if (shortestCyclePathFound.length === graphNodeCount + 1) {
        // No cycle was found in the entire graph.
        return -1;
    } else {
        // A shortest cycle was found. Print its length and then return the path as a string.
        console.log(shortestCyclePathFound.length);
        return shortestCyclePathFound.join("\n");
    }
}

/**
 * Performs a Breadth-First Search (BFS) to find the shortest cycle
 * that starts and ends at a specific `initialNodeIndex`.
 *
 * @param {number} initialNodeIndex - The 0-based index of the node to start and end the cycle search.
 * @returns {number[]|undefined} An array of 1-based node indices representing the shortest cycle path,
 *                               or `undefined` if no cycle is found originating from `initialNodeIndex`.
 */
function findShortestCycleBFS(initialNodeIndex) {
    // Basic validation for the initial node index.
    if (initialNodeIndex < 0 || initialNodeIndex >= graphNodeCount) {
        console.error(`Invalid initial node index: ${initialNodeIndex}. Must be between 0 and ${graphNodeCount - 1}.`);
        return undefined;
    }

    // `parentTraceMap`: An array to store the parent of each node in the BFS tree.
    // Used to reconstruct the path once a cycle is detected.
    // -1: unvisited, -2: initial node (special sentinel).
    const parentTraceMap = createMultiDimensionalArray(-1, graphNodeCount);

    // `bfsQueue`: The primary queue for BFS, holding nodes to visit in the current level.
    const bfsQueue = [];
    bfsQueue.push(initialNodeIndex);
    // Mark the initial node with a special parent value to distinguish it.
    parentTraceMap[initialNodeIndex] = -2; // Sentinel: marks the start of the BFS path

    // Standard BFS loop: continues as long as there are nodes to process.
    while (bfsQueue.length > 0) {
        const currentNodeToProcess = bfsQueue.shift(); // Dequeue the next node (FIFO for BFS)

        // Retrieve neighbors for the current node. Handle cases where a node might have no outgoing edges.
        const neighborsOfCurrent = graphAdjacencyList[currentNodeToProcess];
        if (!neighborsOfCurrent || neighborsOfCurrent.length === 0) {
            continue; // No outgoing edges from this node, skip to next node in queue.
        }

        // Iterate through each neighbor of the current node.
        for (const neighborNode of neighborsOfCurrent) {
            if (neighborNode === initialNodeIndex) {
                // Cycle detected: A neighbor leads back to the initial starting node.
                // Reconstruct the path from the initial node, through `parentTraceMap`, back to `currentNodeToProcess`,
                // and finally to `neighborNode` (which is `initialNodeIndex`).
                const reconstructedCyclePath = [];
                reconstructedCyclePath.push(neighborNode + 1); // Add the initial/end node (1-based)

                let traceBackNode = currentNodeToProcess;
                // Trace back using `parentTraceMap` until we reach the node whose parent is the `initialNodeIndex` or its sentinel.
                while (traceBackNode !== initialNodeIndex && parentTraceMap[traceBackNode] !== -2) {
                    reconstructedCyclePath.push(traceBackNode + 1); // Add current node to path (1-based)
                    traceBackNode = parentTraceMap[traceBackNode]; // Move to its parent
                }
                // The path is built in reverse order (from end back to start). Reverse it for correct sequence.
                return reconstructedCyclePath.reverse();
            }

            // If the neighbor has not been visited yet (its parent is -1).
            // A node is considered visited if `parentTraceMap[node]` is not -1.
            // This ensures we only explore new nodes or shorter paths to existing nodes.
            if (parentTraceMap[neighborNode] === -1) {
                parentTraceMap[neighborNode] = currentNodeToProcess; // Mark current node as parent of neighbor.
                bfsQueue.push(neighborNode); // Enqueue the neighbor for further exploration.
            }
            // If `neighborNode` is already visited (`parentTraceMap[neighborNode] >= 0`),
            // we ignore it in BFS for shortest path, as a path to it has already been found.
        }
    }

    // If the BFS completes without finding a cycle back to `initialNodeIndex`, return undefined.
    return undefined;
}

// Instantiate the input parser by reading standard input.
const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main graph analysis function and print its final result.
const finalAnalysisResult = executeGraphAnalysis();
if (finalAnalysisResult !== undefined) {
    // If the result is a string (the cycle path), print it.
    // If it's a number (like -1 for no cycle), print that directly.
    console.log(finalAnalysisResult);
} else {
    // This case should ideally be handled by executeGraphAnalysis returning -1,
    // but as a fallback, explicitly print an error or default value.
    console.error("Graph analysis failed to produce a result.");
    console.log(-1);
}