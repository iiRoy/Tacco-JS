"use strict";
// This module provides a solution for a graph connectivity problem using the Disjoint Set Union (DSU) data structure.
// It's structured to process input, manage node connections, and produce a specific count as output.

// Standard module export for Node.js compatibility.
Object.defineProperty(exports, "__esModule", { value: true });

/**
 * Serves as the primary function to process the entire problem.
 * It orchestrates parsing input, building the connectivity structure,
 * and performing the final calculation.
 *
 * @param {string} rawProblemData The complete input string provided to the program.
 * @returns {string} The final computed result, formatted as a string.
 */
function solveGraphConnectivity(rawProblemData) {
    // Deconstruct the parsed input into relevant problem parameters.
    // Note: 'edgeCountInput' is parsed but not directly utilized in the final logic,
    // as the 'connectionPairs' array implicitly defines the edges.
    const { totalNodeCount, targetPermutation, connectionPairs } = parseProblemInput(rawProblemData);

    // Initialize the Disjoint Set Union (DSU) system.
    // This structure will keep track of which nodes are connected to each other.
    const nodeConnectionSystem = DisjointUnionSet.constructFromGraph(totalNodeCount, connectionPairs);

    // Calculate the number of elements in the 'targetPermutation' array
    // where the element's value is in the same connected component as its (1-based) index.
    const matchingElementsFound = targetPermutation.filter((elementValue, elementIndex) => {
        // The problem typically uses 1-based indexing for nodes, so we add 1 to the array index.
        const actualNodeIndex = elementIndex + 1;
        // Check if the value at P[i] is connected to the node i+1.
        return nodeConnectionSystem.areNodesConnected(elementValue, actualNodeIndex);
    }).length; // Get the count of filtered elements.

    // Convert the numerical result to a string, as required for output.
    return String(matchingElementsFound);
}
exports.solveGraphConnectivity = solveGraphConnectivity; // Export the main solution function.

/**
 * Represents the Disjoint Set Union (DSU) data structure,
 * managing a collection of individual set nodes and providing operations
 * to unite sets and check for connectivity.
 */
class DisjointUnionSet {
    // Private field to store the array of individual node objects.
    // Using 1-based indexing for convenience, so index 0 is unused.
    #nodeRegistry;

    /**
     * Private constructor to enforce creation via the static factory method.
     * @param {SetNode[]} initialNodeObjects An array of SetNode instances.
     */
    constructor(initialNodeObjects) {
        // Basic validation for the input array.
        if (!Array.isArray(initialNodeObjects) || initialNodeObjects.some(node => !(node instanceof SetNode))) {
            throw new Error("DisjointUnionSet must be initialized with an array of SetNode objects.");
        }
        this.#nodeRegistry = initialNodeObjects;
    }

    /**
     * Factory method to create a DisjointUnionSet instance from graph data.
     * Initializes each node as its own set and then merges sets based on provided edges.
     *
     * @param {number} totalNodes The total count of nodes in the graph (assuming 1-indexed nodes).
     * @param {{ from: number, to: number }[]} graphEdges An array of objects, each defining a connection.
     * @returns {DisjointUnionSet} A new instance of the DSU structure.
     */
    static constructFromGraph(totalNodes, graphEdges) {
        // Create an array of SetNode objects. The size is (totalNodes + 1) for 1-based indexing.
        const individualSetNodes = Array.from({ length: totalNodes + 1 }, () => new SetNode());

        // Iterate through each edge and unite the sets of the connected nodes.
        for (const { from: firstNode, to: secondNode } of graphEdges) {
            // Perform basic bounds checking for node IDs to prevent errors.
            if (firstNode >= 1 && firstNode <= totalNodes && secondNode >= 1 && secondNode <= totalNodes) {
                individualSetNodes[firstNode].mergeSets(individualSetNodes[secondNode]);
            } else {
                console.warn(`Warning: Skipping invalid edge (${firstNode}, ${secondNode}). Node IDs must be between 1 and ${totalNodes}.`);
            }
        }
        return new DisjointUnionSet(individualSetNodes);
    }

    /**
     * Checks if two given nodes belong to the same connected component.
     *
     * @param {number} identifier1 The 1-based identifier of the first node.
     * @param {number} identifier2 The 1-based identifier of the second node.
     * @returns {boolean} True if both nodes are in the same set, false otherwise.
     */
    areNodesConnected(identifier1, identifier2) {
        // Validate node identifiers against the size of the node registry.
        if (identifier1 < 1 || identifier1 >= this.#nodeRegistry.length ||
            identifier2 < 1 || identifier2 >= this.#nodeRegistry.length) {
            console.error(`Error: Invalid node identifier(s) provided: ${identifier1}, ${identifier2}.`);
            return false; // Return false or throw error for invalid input.
        }
        // Delegate the check to the SetNode's method.
        return this.#nodeRegistry[identifier1].isSameSetAs(this.#nodeRegistry[identifier2]);
    }
}

/**
 * Represents an individual node within the Disjoint Set Union structure.
 * Each node maintains a reference to its parent (representative) and a rank for optimization.
 */
class SetNode {
    /**
     * @type {SetNode} The representative (parent) of this node. Points to itself if it's a root.
     */
    representative;
    /**
     * @type {number} The rank (or height) of the tree rooted at this node. Used for union by rank.
     */
    treeRank;

    /**
     * Initializes a new SetNode. Initially, each node is its own representative
     * and has a rank of zero, meaning it's an isolated set of size one.
     */
    constructor() {
        this.representative = this;
        this.treeRank = 0;
    }

    /**
     * Determines if this node and another node are part of the same connected set.
     * This is achieved by comparing their ultimate root representatives.
     *
     * @param {SetNode} otherNode The other node to compare with.
     * @returns {boolean} True if both nodes share the same root, false otherwise.
     */
    isSameSetAs(otherNode) {
        return this.findRootRepresentative() === otherNode.findRootRepresentative();
    }

    /**
     * Merges the set containing this node with the set containing another node.
     * Employs the "union by rank" optimization to keep tree heights balanced.
     *
     * @param {SetNode} otherNode The node whose set will be merged with this node's set.
     */
    mergeSets(otherNode) {
        let rootOfThis = this.findRootRepresentative();
        let rootOfOther = otherNode.findRootRepresentative();

        // If the nodes already share the same root, they are in the same set, so no action is needed.
        if (rootOfThis === rootOfOther) {
            return;
        }

        // Apply union by rank heuristic: attach the smaller rank tree under the root of the larger rank tree.
        // If ranks are equal, one tree becomes the new root, and its rank is incremented.
        if (rootOfThis.treeRank < rootOfOther.treeRank) {
            // Swap to ensure 'rootOfThis' always refers to the root of the (potentially) taller tree.
            // This simplifies the subsequent assignment logic.
            [rootOfThis, rootOfOther] = [rootOfOther, rootOfThis];
        }

        // Attach the root of the 'other' set to the root of 'this' set.
        rootOfOther.representative = rootOfThis;

        // If the ranks were equal before merging, the rank of the new root increases.
        if (rootOfThis.treeRank === rootOfOther.treeRank) {
            rootOfThis.treeRank++;
        }
    }

    /**
     * Finds the ultimate representative (root) of the set to which this node belongs.
     * This method also implements path compression: during the traversal,
     * it makes all visited nodes point directly to the root, optimizing future lookups.
     *
     * @returns {SetNode} The root node of the set containing this node.
     */
    findRootRepresentative() {
        // If this node is not its own representative, it means it's not the root.
        // Recursively find the root and compress the path.
        if (this.representative !== this) {
            this.representative = this.representative.findRootRepresentative();
        }
        return this.representative;
    }

    /**
     * Returns a string representation of the node for debugging purposes.
     * (Added as a Type III addition for enhanced introspection)
     * @returns {string} A descriptive string for the node.
     */
    debugInfo() {
        return `SetNode[Rank: ${this.treeRank}, IsRoot: ${this.representative === this}]`;
    }
}

/**
 * Parses the raw input string provided to the program into a structured object.
 * It extracts node counts, permutation array, and edge definitions.
 *
 * @param {string} fullInputString The entire input content as a single string.
 * @returns {{ totalNodeCount: number, edgeCountInput: number, targetPermutation: number[], connectionPairs: { from: number, to: number }[] }}
 *          An object containing the parsed parameters.
 * @throws {Error} If the input string is malformed or insufficient.
 */
function parseProblemInput(fullInputString) {
    // Basic validation for the input string.
    if (!fullInputString || typeof fullInputString !== 'string' || fullInputString.trim().length === 0) {
        throw new Error("Input string is empty or invalid.");
    }

    // Split the input into an array of lines.
    const allLines = fullInputString.split("\n");

    // Ensure there are enough lines to extract configuration and permutation.
    if (allLines.length < 2) {
        throw new Error("Insufficient input lines; expected at least two lines for configuration and permutation.");
    }

    // Destructure the lines: first for N and M, second for P, rest for edges.
    const [configLine, permutationLine, ...edgeLines] = allLines;

    // Parse the first line for the total number of nodes (N) and edges (M).
    const [totalNodeCount, edgeCountInput] = convertLineToNumbers(configLine);

    // Parse the second line for the permutation array.
    const targetPermutation = convertLineToNumbers(permutationLine);

    // Process the remaining lines to extract the list of edges.
    const connectionPairs = edgeLines
        .map(currentEdgeLine => {
            // Skip any empty lines that might occur, e.g., due to trailing newlines.
            const trimmedLine = currentEdgeLine.trim();
            if (trimmedLine === '') {
                return null; // Mark for removal.
            }
            const [sourceNode, destinationNode] = convertLineToNumbers(trimmedLine);

            // Additional validation for parsed coordinates.
            if (isNaN(sourceNode) || isNaN(destinationNode)) {
                console.warn(`Warning: Skipping malformed edge data line: "${currentEdgeLine}"`);
                return null;
            }
            return { from: sourceNode, to: destinationNode };
        })
        .filter(pair => pair !== null); // Remove any null entries (skipped lines).

    // Return the structured problem parameters.
    return {
        totalNodeCount,
        edgeCountInput, // M is kept for completeness, though not used in the final calculation.
        targetPermutation,
        connectionPairs
    };
}

/**
 * Helper function to parse a single line of space-separated integers into an array of numbers.
 * @param {string} lineOfText The string containing numeric values separated by spaces.
 * @returns {number[]} An array of parsed integer values.
 */
function convertLineToNumbers(lineOfText) {
    // Trim leading/trailing whitespace, split by one or more spaces, and convert each part to a number.
    return lineOfText.trim().split(/\s+/).map(Number);
}

/**
 * The main execution block for environments like AtCoder.
 * Reads input from standard input, processes it, and prints the result to standard output.
 * @param {string} runtimeInput The input string read from the environment.
 */
function mainProgramExecution(runtimeInput) {
    // Call the core problem-solving logic and output its result.
    console.log(solveGraphConnectivity(runtimeInput));
}

// Environmental setup for running the code.
// This block attempts to read input from '/dev/stdin' (common in Linux/competitive programming).
// If an error occurs (e.g., file not found), it silently ignores it, allowing for local testing
// without requiring a piped input file.
try {
    const fileSystemModule = require("fs"); // Dynamically import the Node.js 'fs' module.
    const standardInputPath = "/dev/stdin"; // The typical path for standard input.
    const textEncoding = "utf8"; // Specify the character encoding.

    // Read the entire content of the standard input file synchronously.
    const inputContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
    
    // Execute the main program logic with the retrieved input.
    mainProgramExecution(inputContent);
} catch (executionError) {
    // This catch block is designed to be silent, mimicking the original code's behavior
    // for scenarios where `/dev/stdin` might not exist or other file system issues occur.
    // For debugging, one might uncomment a console.error statement here.
    // console.error("An error occurred during input reading or program execution:", executionError.message);
}