class InputReader {
    constructor(inputString) {
        this.inputLines = inputString.trim().split("\n");
        this.currentLineIndex = 0;
        this.currentLineTokens = [];
    }

    _ensureCurrentLineTokens() {
        if (this.currentLineTokens.length === 0 && this.currentLineIndex < this.inputLines.length) {
            // Split the current line and reverse to use pop() for efficient token retrieval
            this.currentLineTokens = this.inputLines[this.currentLineIndex].split(" ").reverse();
            this.currentLineIndex++;
        }
    }

    readNextValue(returnAsString = false) {
        this._ensureCurrentLineTokens();
        const extractedValue = this.currentLineTokens.pop();
        return returnAsString ? extractedValue : +extractedValue;
    }

    readNextLine(returnAsStringArray = false) {
        const lineContent = this.inputLines[this.currentLineIndex++];
        const tokensOnLine = lineContent.split(" ");
        return returnAsStringArray ? tokensOnLine : tokensOnLine.map(val => +val);
    }

    readLinesAsMatrix(numberOfLines, returnAsStringMatrix = false) {
        const matrixData = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines)
            .map(line => line.split(" "));
        this.currentLineIndex += numberOfLines;
        return returnAsStringMatrix ? matrixData : matrixData.map(row => row.map(val => +val));
    }

    readLinesAsVector(numberOfLines, returnAsStringVector = false) {
        const vectorData = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
        this.currentLineIndex += numberOfLines;
        return returnAsStringVector ? vectorData : vectorData.map(val => +val);
    }
}

const InputReaderFactory = (inputString) => new InputReader(inputString);

function createMultiDimensionalArray(baseValue, ...dimensions) {
    const buildArrayRecursively = (currentDimensionIndex) => {
        if (currentDimensionIndex === dimensions.length) {
            // If baseValue is a string (e.g., "[]" or "0"), parse it once for the base case.
            // Otherwise, use the value directly.
            return typeof baseValue === 'string' ? JSON.parse(baseValue) : baseValue;
        }
        const currentDimensionSize = dimensions[currentDimensionIndex];
        return Array.from({ length: currentDimensionSize }, () => buildArrayRecursively(currentDimensionIndex + 1));
    };
    return buildArrayRecursively(0);
}

class DisjointSetUnion {
    constructor(elementCount) {
        // parentOrSizeArray[i] stores parent of i if positive, or -size of set if root.
        this.parentOrSizeArray = Array(elementCount + 1).fill(-1);
    }

    findSetRoot(elementIndex) {
        // Path compression: If elementIndex is not a root, recursively find its root
        // and set its parent directly to the root.
        if (this.parentOrSizeArray[elementIndex] < 0) {
            return elementIndex;
        }
        return this.parentOrSizeArray[elementIndex] = this.findSetRoot(this.parentOrSizeArray[elementIndex]);
    }

    areElementsInSameSet(elementX, elementY) {
        return this.findSetRoot(elementX) === this.findSetRoot(elementY);
    }

    unionSets(elementX, elementY) {
        let rootX = this.findSetRoot(elementX);
        let rootY = this.findSetRoot(elementY);

        if (rootX === rootY) {
            return false; // Elements are already in the same set, no union needed.
        }

        // Union by size: Attach the smaller tree under the root of the larger tree.
        // The size is stored as a negative value at the root.
        if (this.parentOrSizeArray[rootY] <= this.parentOrSizeArray[rootX]) {
            // rootY's set is larger or equal in size (more negative or equal value).
            this.parentOrSizeArray[rootY] += this.parentOrSizeArray[rootX]; // Add size of rootX's set to rootY's set.
            this.parentOrSizeArray[rootX] = rootY; // Make rootY the parent of rootX.
        } else {
            // rootX's set is larger.
            this.parentOrSizeArray[rootX] += this.parentOrSizeArray[rootY]; // Add size of rootY's set to rootX's set.
            this.parentOrSizeArray[rootY] = rootX; // Make rootX the parent of rootY.
        }
        return true; // Union successfully performed.
    }

    getSetSize(elementIndex) {
        return -this.parentOrSizeArray[this.findSetRoot(elementIndex)];
    }
}

function solveGraphProblem() {
    const STDIN_FILE_PATH = "/dev/stdin";
    const inputReader = InputReaderFactory(require("fs").readFileSync(STDIN_FILE_PATH, "utf8"));

    const nodeCount = inputReader.readNextValue();
    const edgeCount = inputReader.readNextValue();

    const isTotalEdgeCountOdd = (edgeCount % 2 !== 0);
    if (isTotalEdgeCountOdd) {
        return -1; // If the total number of edges is odd, it's impossible to satisfy conditions.
    }

    const allEdges = inputReader.readLinesAsMatrix(edgeCount);
    const dsuInstance = new DisjointSetUnion(nodeCount);
    const finalOutputEdges = []; // Stores the edges that form the final output.
    const adjacencyListForCycles = createMultiDimensionalArray("[]", nodeCount + 1); // Adjacency list for edges that form cycles.
    const nodeParityTracker = createMultiDimensionalArray(0, nodeCount + 1); // Tracks parity (0 or 1) for each node.

    // Helper function to toggle a node's parity.
    const toggleNodeParity = (nodeIdentifier) => {
        nodeParityTracker[nodeIdentifier] ^= 1;
    };

    for (let currentEdgeIndex = 0; currentEdgeIndex < edgeCount; currentEdgeIndex++) {
        const nodeU = allEdges[currentEdgeIndex][0];
        const nodeV = allEdges[currentEdgeIndex][1];

        // Attempt to unite the sets of nodeU and nodeV.
        const unionWasSuccessful = dsuInstance.unionSets(nodeU, nodeV);

        if (unionWasSuccessful) {
            // If union was successful, this edge is part of the spanning forest.
            finalOutputEdges.push(`${nodeU} ${nodeV}`);
            toggleNodeParity(nodeU); // Flip parity for nodeU.
        } else {
            // If union was not successful, this edge creates a cycle.
            // Add it to the adjacency list for later DFS traversal.
            adjacencyListForCycles[nodeU].push(nodeV);
            adjacencyListForCycles[nodeV].push(nodeU);
        }
    }

    // Nested DFS function to process non-tree edges and balance parities.
    const depthFirstSearchAndAssign = (currentNode, parentNode) => {
        // Iterate over neighbors in the adjacency list (these are non-tree edges).
        for (const neighborNode of adjacencyListForCycles[currentNode]) {
            // Skip the parent to avoid going back up the tree.
            if (neighborNode === parentNode) {
                continue;
            }
            // Recursively call DFS for the neighbor.
            depthFirstSearchAndAssign(neighborNode, currentNode);
        }

        // After visiting all children, if this is not the root of the DFS traversal
        // and the parity of the current node is 1, we need to add an edge.
        if (parentNode !== 0) { // parentNode === 0 indicates the root of the DFS traversal.
            if (nodeParityTracker[currentNode] === 1) {
                // If parity is 1, add edge (currentNode, parentNode) to result.
                finalOutputEdges.push(`${currentNode} ${parentNode}`);
            } else {
                // If parity is 0, add edge (parentNode, currentNode) to result.
                finalOutputEdges.push(`${parentNode} ${currentNode}`);
                toggleNodeParity(parentNode); // Flip parity for parentNode.
            }
        }
    };

    // Start DFS from node 1 (assuming nodes are 1-indexed) with 0 as a dummy parent.
    depthFirstSearchAndAssign(1, 0);

    return finalOutputEdges.join("\n");
}

const STACK_SIZE_CONFIGURATION = "--stack-size=240000";
const SCRIPT_FILE_NAME = "Solution.js"; // The name of this file.

if (process.argv.length < 3) {
    // If the script is run without arguments, it means it's the initial call.
    // Fork a new process with an increased stack size to handle deep recursion.
    require("child_process").fork(SCRIPT_FILE_NAME, ["1"], { execArgv: [STACK_SIZE_CONFIGURATION] });
} else {
    // If the script is run with an argument (e.g., "1" from the forked process),
    // execute the main problem-solving logic and print the result.
    console.log(solveGraphProblem());
}
