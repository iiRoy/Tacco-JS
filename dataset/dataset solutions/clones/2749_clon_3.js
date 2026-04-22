const InputProcessor = (function() {
    /**
     * Internal class for managing buffered input from a string source.
     * Supports reading individual values, lines, matrices, and columns.
     */
    class InputSourceManager {
        /**
         * Initializes the input source with raw string data.
         * Each line is trimmed and empty lines are discarded.
         * @param {string} rawSourceText - The complete input string received.
         */
        constructor(rawSourceText) {
            // Split the input into lines, trim each line, and filter out any empty lines.
            this.sourceLines = rawSourceText.split('\n').map(line => line.trim()).filter(Boolean);
            this.currentLineIndex = 0; // Pointer to the current line being processed.
            this.tokensOnCurrentLine = []; // Buffer for space-separated values on the current line.
        }

        /**
         * Reads the next single value (typically an integer) from the input stream.
         * It first tries to consume from the current line's token buffer. If that's empty,
         * it loads the next line into the buffer.
         * @param {boolean} [shouldReturnString=false] - If true, returns the value as a string; otherwise, as a number.
         * @returns {string|number|null} The next value, or null if no more input.
         */
        readSingleValue(shouldReturnString = false) {
            // If the current line's token buffer is empty, attempt to load the next line.
            if (this.tokensOnCurrentLine.length === 0) {
                if (this.currentLineIndex >= this.sourceLines.length) {
                    return null; // All input lines have been consumed.
                }
                // Split the next line by one or more whitespace characters and reverse for efficient `pop()`.
                const lineData = this.sourceLines[this.currentLineIndex];
                this.tokensOnCurrentLine = lineData.split(/\s+/).filter(Boolean).reverse();
                this.currentLineIndex++;
            }

            // Extract the next token from the buffer.
            const extractedToken = this.tokensOnCurrentLine.pop();
            if (extractedToken === undefined) {
                // This case should ideally be prevented by `filter(Boolean)` and valid input.
                return null;
            }
            return shouldReturnString ? extractedToken : Number(extractedToken);
        }

        /**
         * Reads an entire line of space-separated values and returns them as an array.
         * Any remaining tokens in `tokensOnCurrentLine` are discarded.
         * @param {boolean} [shouldReturnStringArray=false] - If true, returns an array of strings; otherwise, numbers.
         * @returns {string[]|number[]|null} An array of values, or null if no more lines.
         */
        readAllLineValues(shouldReturnStringArray = false) {
            if (this.currentLineIndex >= this.sourceLines.length) {
                return null; // No more input lines.
            }
            // Clear any partial tokens from the previous line.
            this.tokensOnCurrentLine = [];

            const lineToProcess = this.sourceLines[this.currentLineIndex];
            this.currentLineIndex++;
            const parsedTokens = lineToProcess.split(/\s+/).filter(Boolean);
            return shouldReturnStringArray ? parsedTokens : parsedTokens.map(Number);
        }

        /**
         * Reads a specified number of consecutive lines, parsing each into an array of values,
         * effectively forming a matrix (array of arrays).
         * @param {number} numberOfLines - The count of lines to read.
         * @param {boolean} [returnAsTextMatrix=false] - If true, returns a string matrix; otherwise, a number matrix.
         * @returns {string[][]|number[][]|null} A matrix of values, or null if insufficient lines.
         */
        readConsecutiveLinesAsMatrix(numberOfLines, returnAsTextMatrix = false) {
            if (this.currentLineIndex + numberOfLines > this.sourceLines.length) {
                return null; // Not enough lines available for the requested matrix.
            }
            // Clear any partial tokens from the previous line.
            this.tokensOnCurrentLine = [];

            const resultingMatrix = [];
            for (let i = 0; i < numberOfLines; i++) {
                const lineData = this.sourceLines[this.currentLineIndex + i];
                const lineTokens = lineData.split(/\s+/).filter(Boolean);
                resultingMatrix.push(returnAsTextMatrix ? lineTokens : lineTokens.map(Number));
            }
            this.currentLineIndex += numberOfLines;
            return resultingMatrix;
        }

        /**
         * Reads a specified number of consecutive lines, each containing a single value,
         * and returns them as a flat array.
         * @param {number} lineCount - The number of lines to read.
         * @param {boolean} [returnAsTextArray=false] - If true, returns a string array; otherwise, a number array.
         * @returns {string[]|number[]|null} An array of values, or null if insufficient lines.
         */
        readConsecutiveLinesAsArray(lineCount, returnAsTextArray = false) {
            if (this.currentLineIndex + lineCount > this.sourceLines.length) {
                return null; // Not enough lines available.
            }
            // Clear any partial tokens from the previous line.
            this.tokensOnCurrentLine = [];

            const columnData = [];
            for (let i = 0; i < lineCount; i++) {
                const lineValue = this.sourceLines[this.currentLineIndex + i].trim(); // Assuming single value per line.
                columnData.push(returnAsTextArray ? lineValue : Number(lineValue));
            }
            this.currentLineIndex += lineCount;
            return columnData;
        }
    }

    // The factory function that the outer module returns.
    // This allows creating an InputSourceManager instance directly.
    return (inputStringData) => new InputSourceManager(inputStringData);
})();

// Load input from the standard input stream.
const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
const inputReaderInstance = InputProcessor(rawInputContent);

/**
 * Creates a multi-dimensional array with specified dimensions, initialized with a given value.
 * This function uses `eval` for dynamic array construction, mimicking a feature
 * often found in other languages for concise multi-dimensional array initialization.
 * @param {any|string} initialValueOrConstructorString - The value to fill, or a string representing a JavaScript expression
 *                                                      to generate the initial value for each element (e.g., "[]", "0").
 * @param {...number} dimensions - A variable number of arguments representing the size of each dimension.
 * @returns {Array} The dynamically created multi-dimensional array.
 */
function createDynamicMultiDimArray(initialValueOrConstructorString, ...dimensions) {
    if (dimensions.length === 0) {
        // If no dimensions are provided, return the initial value directly,
        // evaluating it if it's a string.
        try {
            return typeof initialValueOrConstructorString === 'string'
                ? eval(initialValueOrConstructorString)
                : initialValueOrConstructorString;
        } catch (e) {
            console.error("Error evaluating initial value string:", e);
            return initialValueOrConstructorString;
        }
    }

    // Prepare the initial value string for embedding into the `eval` expression.
    let baseValueExpression = String(initialValueOrConstructorString);
    if (typeof initialValueOrConstructorString !== 'string') {
        baseValueExpression = JSON.stringify(initialValueOrConstructorString);
    }

    // Construct the `eval` string by iterating from the innermost dimension outwards.
    let currentEvalString = `Array(${dimensions[dimensions.length - 1]}).fill(0).map(() => { return ${baseValueExpression}; })`;

    // Add wrappers for the remaining dimensions.
    for (let i = dimensions.length - 2; i >= 0; i--) {
        const currentDimension = dimensions[i];
        currentEvalString = `Array(${currentDimension}).fill(0).map(() => ${currentEvalString})`;
    }

    try {
        return eval(currentEvalString);
    } catch (error) {
        console.error("Failed to dynamically create multi-dimensional array:", error);
        console.error("Generated eval string:", currentEvalString);
        return []; // Return an empty array or handle error appropriately.
    }
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It uses path compression and union by size/rank heuristics for efficiency.
 */
class DisjointSetUnion {
    /**
     * Constructs a new DSU structure for a given number of elements.
     * Elements are typically 1-indexed, so the array size is `elementCount + 1`.
     * @param {number} elementCount - The total number of elements in the set.
     */
    constructor(elementCount) {
        // `parentOrComponentSize[i]` stores either:
        //   - The parent of element `i` if `i` is not a root.
        //   - A negative value representing the size of the component if `i` is a root.
        // Initially, each element is its own root, with a component size of 1 (represented as -1).
        this.parentOrComponentSize = createDynamicMultiDimArray(-1, elementCount + 1);
    }

    /**
     * Finds the representative (root) of the set to which `elementIndex` belongs.
     * Applies path compression during the traversal to flatten the tree.
     * @param {number} elementIndex - The index of the element whose root is to be found.
     * @returns {number} The root element's index for the component containing `elementIndex`.
     */
    findComponentRoot(elementIndex) {
        // If `elementIndex` is a root (its value is negative), return itself.
        if (this.parentOrComponentSize[elementIndex] < 0) {
            return elementIndex;
        }
        // Otherwise, recursively find the root and update `elementIndex`'s parent directly to the root
        // (path compression).
        return this.parentOrComponentSize[elementIndex] = this.findComponentRoot(this.parentOrComponentSize[elementIndex]);
    }

    /**
     * Checks if two elements belong to the same connected component.
     * @param {number} firstElement - The index of the first element.
     * @param {number} secondElement - The index of the second element.
     * @returns {boolean} True if both elements are in the same set, false otherwise.
     */
    areElementsConnected(firstElement, secondElement) {
        return this.findComponentRoot(firstElement) === this.findComponentRoot(secondElement);
    }

    /**
     * Attempts to unite the sets containing `firstElement` and `secondElement`.
     * This method implements union by size heuristic.
     * @param {number} firstElement - The first element to unite.
     * @param {number} secondElement - The second element to unite.
     * @returns {boolean} True if a union operation successfully merged two *distinct* sets (i.e., they were not already connected),
     *                    false if they were already in the same set (implying this edge forms a cycle).
     */
    attemptUnion(firstElement, secondElement) {
        let rootOfFirst = this.findComponentRoot(firstElement);
        let rootOfSecond = this.findComponentRoot(secondElement);

        // If both elements already share the same root, no union is needed.
        // This edge effectively forms a cycle in the context of a spanning forest.
        if (rootOfFirst === rootOfSecond) {
            return false; // No new union occurred.
        }

        // Union by size heuristic: attach the smaller tree under the root of the larger tree.
        // The `parentOrComponentSize` stores negative values for root sizes.
        if (this.parentOrComponentSize[rootOfSecond] < this.parentOrComponentSize[rootOfFirst]) {
            // If `rootOfSecond`'s component is larger (more negative size), swap to ensure `rootOfFirst`
            // always points to the root of the larger or equally sized component.
            [rootOfFirst, rootOfSecond] = [rootOfSecond, rootOfFirst];
        }

        // Update the size of the new combined component (rooted at `rootOfFirst`).
        this.parentOrComponentSize[rootOfFirst] += this.parentOrComponentSize[rootOfSecond];
        // Make `rootOfSecond`'s parent point to `rootOfFirst`.
        this.parentOrComponentSize[rootOfSecond] = rootOfFirst;

        return true; // A successful union occurred, two distinct sets were merged.
    }

    /**
     * Retrieves the size of the connected component that `elementIndex` belongs to.
     * @param {number} elementIndex - The element whose component size is requested.
     * @returns {number} The number of elements in the component.
     */
    getComponentSize(elementIndex) {
        return -this.parentOrComponentSize[this.findComponentRoot(elementIndex)];
    }
}

// Define constants for better readability and maintainability.
const NODE_START_IDENTIFIER = 1; // Often nodes are 1-indexed.
const DFS_ROOT_PSEUDO_PARENT = 0; // A special value indicating no real parent for the DFS root.
const PARITY_ODD = 1; // Represents an odd parity state.

/**
 * Main function to solve the problem of directing edges to satisfy degree parity.
 * This problem typically involves finding a spanning forest and then using DFS
 * on non-tree edges to adjust parities.
 */
function solveProblem() {
    // Read the number of nodes (N) and edges (M) from the input.
    const numberOfNodes = inputReaderInstance.readSingleValue();
    const numberOfEdges = inputReaderInstance.readSingleValue();

    // Early exit condition: if the total number of edges is odd, it's impossible
    // to satisfy the graph property (sum of degrees is always even, each edge adds 2 to sum).
    if (numberOfEdges % 2 !== 0) {
        return -1;
    }

    // Read all M edge pairs [u, v] from the input.
    const allInputEdges = inputReaderInstance.readConsecutiveLinesAsMatrix(numberOfEdges);

    // Initialize the Disjoint Set Union data structure for `numberOfNodes`.
    const dsuStructure = new DisjointSetUnion(numberOfNodes);

    // This array will accumulate the directed edges for the final output.
    const resultingDirectedEdges = [];

    // Adjacency list to store non-tree edges (those that form cycles in the DSU).
    // Initialized as an array of empty arrays for each node (1-indexed).
    const adjacencyListForNonTreeEdges = createDynamicMultiDimArray("[]", numberOfNodes + 1);

    // Parity tracker: `nodeParityState[i]` is 1 if node `i` has an odd degree count
    // from its tree edges and non-tree edges processed so far, 0 otherwise.
    // Initialized to all zeros.
    const nodeParityState = createDynamicMultiDimArray(0, numberOfNodes + 1);

    // Iterate through each provided edge to build a spanning forest and identify cycle-forming edges.
    for (let i = 0; i < numberOfEdges; i++) {
        const [sourceNode, destinationNode] = allInputEdges[i];

        // Attempt to add the current edge as a tree edge using DSU.
        // If `attemptUnion` returns true, it means `sourceNode` and `destinationNode` were
        // in different components, and a new tree edge was successfully added.
        if (dsuStructure.attemptUnion(sourceNode, destinationNode)) {
            // This is a tree edge. Add it to the output and toggle the parity for the source node.
            // The problem's specific logic dictates which endpoint's parity is affected.
            resultingDirectedEdges.push(`${sourceNode} ${destinationNode}`);
            nodeParityState[sourceNode] ^= PARITY_ODD; // Flip parity for sourceNode.
        } else {
            // If `attemptUnion` returns false, it means `sourceNode` and `destinationNode` were
            // already connected, implying this edge forms a cycle. These are non-tree edges.
            // Add them to the adjacency list for later DFS traversal.
            adjacencyListForNonTreeEdges[sourceNode].push(destinationNode);
            adjacencyListForNonTreeEdges[destinationNode].push(sourceNode);
        }
    }

    /**
     * Performs a Depth-First Search (DFS) on the graph formed by non-tree edges
     * to adjust the parity of nodes. This ensures that most nodes (except potentially
     * the initial DFS root) end up with an even degree parity.
     * @param {number} currentTraversalNode - The node currently being visited in the DFS.
     * @param {number} parentNodeInDFS - The parent node of `currentTraversalNode` in the DFS tree.
     *                                   Used to prevent immediate backtracking in an undirected graph.
     */
    function performParityAdjustmentDFS(currentTraversalNode, parentNodeInDFS) {
        // Recursively visit all neighbors of the current node.
        for (const neighbor of adjacencyListForNonTreeEdges[currentTraversalNode]) {
            // Skip the parent node to avoid cycles in the DFS traversal itself.
            if (neighbor === parentNodeInDFS) {
                continue;
            }
            // Recurse for the neighbor.
            performParityAdjustmentDFS(neighbor, currentTraversalNode);
        }

        // Post-order processing: after all children have been visited.
        // If the current node is the root of this DFS component (indicated by `DFS_ROOT_PSEUDO_PARENT`),
        // we don't need to direct an edge towards its parent.
        if (parentNodeInDFS === DFS_ROOT_PSEUDO_PARENT) {
            return;
        }

        // Based on `currentTraversalNode`'s accumulated parity, decide the direction
        // of the edge between `currentTraversalNode` and `parentNodeInDFS`.
        if (nodeParityState[currentTraversalNode] === PARITY_ODD) {
            // If `currentTraversalNode` has an odd parity, to make it even,
            // the edge (currentTraversalNode, parentNodeInDFS) must be directed
            // FROM `currentTraversalNode` TO `parentNodeInDFS`.
            // This 'uses up' `currentTraversalNode`'s odd parity.
            // `parentNodeInDFS`'s parity is NOT affected by this direction choice.
            resultingDirectedEdges.push(`${currentTraversalNode} ${parentNodeInDFS}`);
        } else {
            // If `currentTraversalNode` has an even parity, to keep it even,
            // the edge (currentTraversalNode, parentNodeInDFS) must be directed
            // FROM `parentNodeInDFS` TO `currentTraversalNode`.
            // This action flips `parentNodeInDFS`'s parity.
            resultingDirectedEdges.push(`${parentNodeInDFS} ${currentTraversalNode}`);
            nodeParityState[parentNodeInDFS] ^= PARITY_ODD; // Flip parent's parity.
        }
    }

    // Initiate the DFS traversal from node 1 (assuming 1-indexed nodes).
    // The `DFS_ROOT_PSEUDO_PARENT` signifies the start of the traversal.
    performParityAdjustmentDFS(NODE_START_IDENTIFIER, DFS_ROOT_PSEUDO_PARENT);

    // Join all the collected directed edges with newline characters for the final output.
    return resultingDirectedEdges.join("\n");
}

// Configuration for Node.js process execution, especially for deep recursion.
const MINIMUM_ARGUMENT_COUNT = 3; // e.g., `node script.js 1`
const DESIRED_STACK_SIZE_KB = 240000; // Set stack size to 240 MB.

// Check if the script is being run with sufficient arguments (implying a forked process
// with increased stack size, or direct execution if stack is not an issue).
if (process.argv.length < MINIMUM_ARGUMENT_COUNT) {
    // If not enough arguments, fork a new Node.js process with a larger stack size.
    // This is common in competitive programming to prevent stack overflows with deep recursion.
    const childProcessModule = require("child_process");
    const currentScriptFileName = "Main.js"; // Standard name for main script in many platforms.
    const argumentsForChildProcess = ["1"]; // A dummy argument to make `process.argv.length` meet the condition.
    const forkExecutionOptions = { execArgv: [`--stack-size=${DESIRED_STACK_SIZE_KB}`] };
    childProcessModule.fork(currentScriptFileName, argumentsForChildProcess, forkExecutionOptions);
} else {
    // If running in a process with (presumably) increased stack size,
    // execute the main problem-solving logic and print its output.
    console.log(solveProblem());
}