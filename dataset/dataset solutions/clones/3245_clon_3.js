const createInputParser = (function() {
    /**
     * Helper function to safely convert an array of strings to numbers.
     * Handles cases where conversion might result in NaN by throwing an error.
     * @param {string[]} strArray - Array of string tokens.
     * @returns {number[]} Array of number tokens.
     */
    function safeConvertToNumbers(strArray) {
        return strArray.map(token => {
            const num = Number(token);
            if (isNaN(num)) {
                throw new Error(`Invalid number format encountered: "${token}"`);
            }
            return num;
        });
    }

    /**
     * @class StreamContentParser
     * @description A utility class for parsing multi-line string input,
     *              mimicking the behavior of the original input reading mechanism.
     *              It supports reading single tokens, entire lines, or blocks of lines.
     */
    class StreamContentParser {
        #allInputLines;              // Stores all lines of the input content.
        #currentLineIndex;           // Points to the index of the current line being processed.
        #currentLineTokenBuffer;     // Stores tokens of the current line, reversed for efficient 'pop'.

        /**
         * @constructor
         * @param {string} rawInputContent - The complete input as a single string.
         */
        constructor(rawInputContent) {
            this.#allInputLines = rawInputContent.trim().split(/\r?\n/); // Splits by newline, handling both Windows/Unix.
            this.#currentLineIndex = 0;
            this.#currentLineTokenBuffer = null; // Initialized to null, buffer will be filled on first token request.
        }

        /**
         * @private
         * @description Ensures the internal token buffer for the current line is filled and ready for token extraction.
         *              It advances to the next line only if the current one is exhausted or was never loaded.
         * @returns {boolean} True if tokens are available in the buffer, false if the end of input is reached.
         * @throws {Error} If an empty line is encountered and no further non-empty lines are available.
         */
        #populateTokenBufferForCurrentLine() {
            // If buffer already has tokens, no need to refill
            if (this.#currentLineTokenBuffer && this.#currentLineTokenBuffer.length > 0) {
                return true;
            }

            // If no more lines in the input, we've reached the end
            if (this.#currentLineIndex >= this.#allInputLines.length) {
                return false;
            }

            // Get the current line, split it, filter out empty strings (e.g., from multiple spaces), and reverse.
            const lineData = this.#allInputLines[this.#currentLineIndex];
            this.#currentLineTokenBuffer = lineData
                                           .split(/\s+/)
                                           .filter(token => token.length > 0)
                                           .reverse();

            // If the current line was empty after splitting, advance to the next and try again.
            if (this.#currentLineTokenBuffer.length === 0) {
                this.#currentLineIndex++; // Move to the next line
                return this.#populateTokenBufferForCurrentLine(); // Recursively try to load the next non-empty line
            }
            return true;
        }

        /**
         * @method extractNextToken
         * @description Reads and extracts a single token from the input stream.
         *              The internal line pointer advances only when the current line's tokens are fully consumed.
         * @param {boolean} [returnAsText=false] - If true, the token is returned as a string; otherwise, as a number.
         * @returns {string|number} The extracted token.
         * @throws {Error} If the end of the input stream is reached.
         */
        extractNextToken(returnAsText = false) {
            if (!this.#populateTokenBufferForCurrentLine()) {
                throw new Error("End of input stream reached: No more tokens available to extract.");
            }

            const token = this.#currentLineTokenBuffer.pop();

            // If the buffer is now empty, it means the current line is fully consumed.
            // Advance the line pointer to prepare for the next line.
            if (this.#currentLineTokenBuffer.length === 0) {
                this.#currentLineIndex++;
                this.#currentLineTokenBuffer = null; // Mark buffer as needing refill
            }
            return returnAsText ? token : Number(token);
        }

        /**
         * @method readCompleteLine
         * @description Reads all tokens from the current logical line and then unconditionally advances the line pointer.
         *              Any partially consumed tokens on the current line (from `extractNextToken` calls) are discarded.
         * @param {boolean} [returnAsText=false] - If true, tokens are returned as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of tokens from the line.
         * @throws {Error} If the end of the input stream is reached.
         */
        readCompleteLine(returnAsText = false) {
            if (this.#currentLineIndex >= this.#allInputLines.length) {
                throw new Error("End of input stream reached: No more complete lines to read.");
            }

            const lineData = this.#allInputLines[this.#currentLineIndex];
            this.#currentLineIndex++; // Advance line pointer immediately after reading the line
            this.#currentLineTokenBuffer = null; // Invalidate token buffer as this line is now fully processed

            const tokens = lineData.split(/\s+/).filter(Boolean);
            return returnAsText ? tokens : safeConvertToNumbers(tokens);
        }

        /**
         * @method readTokenizedMatrix
         * @description Reads a specified number of lines, parsing each into an array of tokens, forming a matrix.
         * @param {number} numberOfLines - The count of lines to read for the matrix.
         * @param {boolean} [returnAsText=false] - If true, tokens are returned as strings; otherwise, as numbers.
         * @returns {string[][]|number[][]} An array of arrays of tokens (the matrix).
         * @throws {Error} If not enough lines are available in the input stream.
         */
        readTokenizedMatrix(numberOfLines, returnAsText = false) {
            if (this.#currentLineIndex + numberOfLines > this.#allInputLines.length) {
                throw new Error(`End of input stream: Not enough lines to read ${numberOfLines} lines for matrix data.`);
            }

            this.#currentLineTokenBuffer = null; // Invalidate token buffer as multiple lines are being read

            const matrixData = [];
            for (let i = 0; i < numberOfLines; i++) {
                const line = this.#allInputLines[this.#currentLineIndex + i];
                const tokens = line.split(/\s+/).filter(Boolean);
                matrixData.push(returnAsText ? tokens : safeConvertToNumbers(tokens));
            }
            this.#currentLineIndex += numberOfLines; // Advance line pointer by the number of lines read
            return matrixData;
        }

        /**
         * @method readRawLinesBlock
         * @description Reads a specified number of lines as raw strings, without tokenizing,
         *              optionally attempting to convert each entire line to a number.
         * @param {number} numberOfLines - The count of lines to read.
         * @param {boolean} [returnAsText=false] - If true, returns lines as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of raw lines.
         * @throws {Error} If not enough lines are available in the input stream.
         */
        readRawLinesBlock(numberOfLines, returnAsText = false) {
            if (this.#currentLineIndex + numberOfLines > this.#allInputLines.length) {
                throw new Error(`End of input stream: Not enough lines to read ${numberOfLines} raw lines.`);
            }

            this.#currentLineTokenBuffer = null; // Invalidate token buffer

            const lines = this.#allInputLines.slice(this.#currentLineIndex, this.#currentLineIndex + numberOfLines);
            this.#currentLineIndex += numberOfLines; // Advance line pointer
            return returnAsText ? lines : safeConvertToNumbers(lines);
        }
    }

    // The factory function that gets exposed, creating instances of StreamContentParser.
    return function(inputStringContent) {
        return new StreamContentParser(inputStringContent);
    };
})();

// Define the source for standard input, typically used in competitive programming.
const STANDARD_INPUT_PATH = "/dev/stdin";

// Initialize the input processing utility.
const dataInputProcessor = createInputParser(require("fs").readFileSync(STANDARD_INPUT_PATH, "utf8"));

// Output the result of the main graph processing logic.
console.log(processGraphTraversal());

/**
 * @function processGraphTraversal
 * @description Implements a graph traversal algorithm to assign levels and "parent" nodes
 *              based on dependencies. It identifies a starting node (root) and then
 *              propagates level assignments through its successors in a breadth-first manner.
 * @returns {string} A newline-separated string representing the assigned parent/source for relevant nodes.
 */
function processGraphTraversal() {
    // Read the total number of items to process and the total number of dependency declarations.
    // The problem context implies `totalItems` are the nodes 0 to `totalItems - 1` that need levels.
    const totalItems = dataInputProcessor.extractNextToken();
    const totalDependencyDeclarations = dataInputProcessor.extractNextToken();

    // Determine the maximum possible node ID based on input constraints for array sizing.
    // The original code used `n+m-1` for array initialization, suggesting node IDs
    // could go up to `n+m-2`. Using a slightly larger buffer for safety.
    const maxPossibleNodeId = totalItems + totalDependencyDeclarations; // Use N+M to be safe with 0-indexed values
    
    // Adjacency lists for graph representation using Maps for robustness with sparse node IDs.
    // `incomingEdges`: maps a target node ID to a list of source node IDs (predecessors).
    // `outgoingEdges`: maps a source node ID to a list of target node IDs (successors).
    const incomingEdges = new Map();
    const outgoingEdges = new Map();

    // `assignedLevels`: Stores the determined level/depth for each node.
    // Initialized to `Infinity` to signify "unvisited" or "unassigned".
    const assignedLevels = new Array(maxPossibleNodeId).fill(Infinity);

    // `parentAssignments`: Stores the assigned "parent" (source) ID for each node.
    // Initialized to `null`, will be updated to `0` for roots or `predId + 1` for others.
    const parentAssignments = new Array(maxPossibleNodeId).fill(null);

    /**
     * Helper function to register a directed edge between two nodes.
     * @param {number} source - The ID of the source node.
     * @param {number} target - The ID of the target node.
     */
    const registerDirectedEdge = (source, target) => {
        // Ensure predecessor list for `target` exists
        if (!incomingEdges.has(target)) {
            incomingEdges.set(target, []);
        }
        incomingEdges.get(target).push(source);

        // Ensure successor list for `source` exists
        if (!outgoingEdges.has(source)) {
            outgoingEdges.set(source, []);
        }
        outgoingEdges.get(source).push(target);
    };

    // Read all dependency pairs from the input.
    // The number of pairs is `totalItems + totalDependencyDeclarations - 1` as per original logic.
    const numEdgesToRead = totalItems + totalDependencyDeclarations - 1;
    for (let edgeIndex = 0; edgeIndex < numEdgesToRead; edgeIndex++) {
        // Each line contains two space-separated numbers (source and target). Convert to 0-indexed.
        const [sourceNode, targetNode] = dataInputProcessor.readCompleteLine().map(id => id - 1);
        registerDirectedEdge(sourceNode, targetNode);
    }

    // --- Graph Traversal - Phase 1: Identify the primary starting node (root) ---
    let rootNodeId = -1; // Placeholder for the identified root node.
    let nodesToProcessNext = []; // This queue will hold nodes to be processed at the *next* level.

    // Search for the first node (by ID) that has no incoming edges.
    // This node will be considered the "root" for the traversal.
    for (let currentNodeCandidate = 0; currentNodeCandidate < maxPossibleNodeId; currentNodeCandidate++) {
        // A node is a root if it's not present in `incomingEdges` or its list of predecessors is empty.
        if (!incomingEdges.has(currentNodeCandidate) || incomingEdges.get(currentNodeCandidate).length === 0) {
            rootNodeId = currentNodeCandidate;
            break; // Found the first root, exit search.
        }
    }

    // If a root node was successfully identified:
    if (rootNodeId !== -1) {
        assignedLevels[rootNodeId] = 0; // The root node is at level 0.
        parentAssignments[rootNodeId] = 0; // The root node's "parent" is 0 (by problem spec).

        // Initialize the queue with all direct successors of the root node.
        const rootSuccessors = outgoingEdges.get(rootNodeId);
        if (rootSuccessors) {
            nodesToProcessNext.push(...rootSuccessors);
        }
    } else {
        // This scenario implies a graph without a clear root (e.g., a cycle or an empty graph).
        // The algorithm might not fully process `totalItems` in this case.
        // For Type III, we acknowledge this and proceed, potentially resulting in default assignments.
    }

    // --- Graph Traversal - Phase 2: Breadth-First-like Level Assignment ---
    let assignedItemCount = 1; // Tracks how many items have been successfully assigned a level.
                               // Starts at 1 because the root node is already assigned.
    let currentProcessingLevel = 1; // The current depth level being assigned to nodes.

    // Continue the traversal as long as we haven't assigned levels to all `totalItems`
    // and there are still nodes in the queue to process.
    while (assignedItemCount < totalItems && nodesToProcessNext.length > 0) {
        const nodesForNextIteration = []; // Accumulates nodes for the subsequent level.

        // Process each node that was identified for the current level.
        for (const candidateNode of nodesToProcessNext) {
            let canAssignCurrentLevel = true; // Flag: can this node be assigned `currentProcessingLevel`?
            let bestParentIdForAssignment = null; // Stores the 1-indexed parent ID (from `currentProcessingLevel - 1`).

            const predecessorsOfCandidate = incomingEdges.get(candidateNode) || [];

            // Check all predecessors to determine if `candidateNode` can be assigned `currentProcessingLevel`.
            for (const predecessor of predecessorsOfCandidate) {
                // If any predecessor is at or beyond the current level, this node cannot be processed yet.
                if (assignedLevels[predecessor] >= currentProcessingLevel) {
                    canAssignCurrentLevel = false;
                    break;
                }
                // If a predecessor is exactly at the previous level, it's a potential parent.
                // The original logic implicitly takes the *last* such predecessor encountered.
                if (assignedLevels[predecessor] === currentProcessingLevel - 1) {
                    bestParentIdForAssignment = predecessor + 1; // Output is 1-indexed.
                }
            }

            // If all conditions are met, assign the level and parent to the candidate node.
            if (canAssignCurrentLevel) {
                assignedLevels[candidateNode] = currentProcessingLevel;
                assignedItemCount++; // Increment the count of items with assigned levels.
                
                // Assign the parent. If no predecessor was found at `currentProcessingLevel - 1`,
                // `bestParentIdForAssignment` remains `null`. The problem implies a parent will exist.
                // If `null`, it will be handled by the final output formatting.
                parentAssignments[candidateNode] = bestParentIdForAssignment;

                // Add all successors of this node to the queue for the next level's processing.
                const successorsOfCandidate = outgoingEdges.get(candidateNode);
                if (successorsOfCandidate) {
                    nodesForNextIteration.push(...successorsOfCandidate);
                }
            }
        }
        
        nodesToProcessNext = nodesForNextIteration; // Update the queue for the next iteration.
        currentProcessingLevel++; // Advance to the next depth level.

        // Safety check: If no nodes were added to `nodesForNextIteration` but `assignedItemCount`
        // is still less than `totalItems`, it indicates that some items are unreachable or
        // the graph is structured such that not all items can be assigned levels.
        if (nodesToProcessNext.length === 0 && assignedItemCount < totalItems) {
            // This condition prevents potential infinite loops if a graph is disconnected
            // or if `totalItems` is set higher than the number of reachable nodes.
            break; 
        }
    }

    // --- Final Result Compilation ---
    const formattedResults = [];
    // Iterate through the range of relevant node IDs (0 to `totalItems - 1`).
    for (let itemId = 0; itemId < totalItems; itemId++) {
        // If a node's parent was not explicitly assigned (i.e., it's still `null`),
        // default its output value to `0`, as per the observed behavior for unassigned/root nodes.
        const finalParentId = parentAssignments[itemId] !== null ? parentAssignments[itemId] : 0;
        formattedResults.push(finalParentId);
    }

    // Join the results with newline characters for the final output.
    return formattedResults.join("\n");
}