"use strict";

// Helper class for parsing input from stdin.
// Encapsulates the logic for reading tokens and converting them to integers.
class InputParser {
    // Private fields to hold the tokenized input and the current reading position.
    #dataTokens;
    #currentTokenIndex;

    /**
     * Constructs an InputParser instance.
     * Reads the entire file content from the specified source path,
     * splits it into tokens by spaces or newlines, and filters out empty strings.
     * @param {string} sourcePath - The path to the input file (e.g., "/dev/stdin").
     */
    constructor(sourcePath) {
        // Using named import for readFileSync from the 'node:fs' module.
        const { readFileSync } = require('node:fs');
        const fileContent = readFileSync(sourcePath, 'utf8');
        // Split by spaces or newlines, then filter out any empty strings that result
        // from multiple delimiters or leading/trailing delimiters.
        this.#dataTokens = fileContent.split(/ |\n/).filter(str => str !== '');
        this.#currentTokenIndex = 0; // Initialize token pointer to the start.
    }

    /**
     * Retrieves and parses the next token as an integer.
     * Advances the internal token pointer.
     * @returns {number} The parsed integer value.
     * @throws {Error} If attempting to read beyond the end of the input stream
     *                 or if the token cannot be parsed as an integer.
     */
    retrieveNextInteger() {
        if (this.#currentTokenIndex >= this.#dataTokens.length) {
            throw new Error("Input stream exhausted: Attempted to read past the end of available tokens.");
        }
        const tokenValue = this.#dataTokens[this.#currentTokenIndex++];
        const parsedInteger = parseInt(tokenValue, 10); // Base 10 parsing.

        // Basic validation for successful integer parsing.
        if (isNaN(parsedInteger)) {
             throw new Error(`Input parsing error: Encountered non-integer token '${tokenValue}'.`);
        }
        return parsedInteger;
    }

    /**
     * Reads a specified number of consecutive tokens and returns them as an array of integers.
     * @param {number} count - The number of integers to read.
     * @returns {number[]} An array containing the parsed integer values.
     * @throws {Error} If there are not enough tokens remaining for the requested count.
     */
    retrieveIntegerArray(count) {
        if (this.#currentTokenIndex + count > this.#dataTokens.length) {
            throw new Error(`Insufficient input tokens: Expected ${count} more, but only ${this.#dataTokens.length - this.#currentTokenIndex} remain.`);
        }
        const integerSequence = [];
        for (let k = 0; k < count; k++) {
            integerSequence.push(this.retrieveNextInteger()); // Utilizes the single integer retrieval method.
        }
        return integerSequence;
    }
}

// Instantiate the input manager, pointing to standard input.
const ioManager = new InputParser('/dev/stdin');

/**
 * Main function to calculate the total number of nodes in a specific binary tree structure.
 * This function implements a dynamic programming approach to determine the maximum possible
 * nodes at each level and the minimum required nodes from each level downwards.
 * @returns {string} The total count of nodes as a string, or "-1" if the configuration is impossible.
 */
function calculateTreeNodes() {
    // Read the maximum depth of the tree (N).
    const treeDepth = ioManager.retrieveNextInteger();

    // Read the array 'a', where a[i] represents the number of nodes explicitly required at level 'i'.
    // The array size is N+1, for levels 0 to N.
    const requiredNodesPerLevel = ioManager.retrieveIntegerArray(treeDepth + 1);

    // --- Input Validation and Edge Cases ---

    // Guard clause: Tree depth cannot be negative.
    if (treeDepth < 0) {
        console.error("Error: The specified tree depth cannot be a negative value.");
        return "-1";
    }

    // Special handling for a tree with only a root node (depth 0).
    if (treeDepth === 0) {
        // If a tree of depth 0 requires exactly 1 node at level 0, it's valid.
        // Otherwise, it's an impossible configuration (e.g., requires 0 nodes, or more than 1).
        if (requiredNodesPerLevel[0] === 1) {
            return "1"; // A single root node.
        }
        console.warn("Warning: A tree of depth 0 must require exactly 1 node at level 0.");
        return "-1";
    }

    // Early exit condition: For any tree with depth > 0, the root level (level 0)
    // cannot *require* additional nodes. It implicitly has 1 node (the root itself).
    // If a[0] is anything other than 0, it's an invalid configuration.
    if (requiredNodesPerLevel[0] !== 0) {
        console.warn(`Warning: Level 0 (root) requires ${requiredNodesPerLevel[0]} nodes. It must be 0 for a valid tree structure.`);
        return "-1";
    }

    // --- Dynamic Programming - Phase 1: Max Available Nodes (Top-Down) ---

    // Define a sufficiently large upper bound for the number of nodes at any level.
    // This prevents potential overflow issues for intermediate calculations and acts as a cap.
    const maximumNodeCapacity = 100000000 * treeDepth; // Original was 1e8 * n.

    // `dpMaxAvailableNodes[i]` stores the maximum number of *available* (unused) nodes
    // at `level i`, after satisfying the `requiredNodesPerLevel` up to `level i`.
    // Initialize with 0s.
    const dpMaxAvailableNodes = new Array(treeDepth + 1).fill(0);
    // At level 0, we start with 1 available node (the root itself).
    dpMaxAvailableNodes[0] = 1;

    // Iterate from level 1 up to the maximum tree depth.
    for (let currentLevel = 1; currentLevel <= treeDepth; currentLevel++) {
        const availableNodesFromPreviousLevel = dpMaxAvailableNodes[currentLevel - 1];
        const nodesRequiredAtThisLevel = requiredNodesPerLevel[currentLevel];

        // Each node from the previous level can potentially branch into two nodes.
        // So, the potential maximum nodes at the current level is twice the available nodes
        // from the level above.
        let potentialNodesAtCurrentLevel = availableNodesFromPreviousLevel * 2;

        // Cap the potential nodes by the overall `maximumNodeCapacity` to prevent excessive growth.
        const actualNodesAvailableBeforeRequirements = Math.min(potentialNodesAtCurrentLevel, maximumNodeCapacity);

        // Subtract the nodes explicitly required at the current level.
        const remainingAvailableNodes = actualNodesAvailableBeforeRequirements - nodesRequiredAtThisLevel;

        // If the remaining nodes drop below zero, it means we cannot satisfy the requirements
        // at this level given the nodes from above. The configuration is impossible.
        if (remainingAvailableNodes < 0) {
            console.warn(`Impossibility detected: Not enough nodes at level ${currentLevel} after satisfying requirements.`);
            return "-1";
        }
        // Store the result for the current level.
        dpMaxAvailableNodes[currentLevel] = remainingAvailableNodes;
    }

    // --- Dynamic Programming - Phase 2: Minimum Needed Leaves (Bottom-Up) ---

    // `dpMinRequiredBranches[i]` stores the minimum number of "branches" or child nodes
    // that must emanate from `level i` to satisfy all `requiredNodesPerLevel` from `level i+1`
    // down to the deepest level `N`.
    const dpMinRequiredBranches = new Array(treeDepth + 1).fill(0);
    // At the deepest level (N), no further branches are required below it.
    dpMinRequiredBranches[treeDepth] = 0;

    // Iterate from the level just before the deepest, up to the root (level 0).
    for (let currentLevel = treeDepth - 1; currentLevel >= 0; currentLevel--) {
        const requiredFromNextLevel = dpMinRequiredBranches[currentLevel + 1];
        const nodesRequiredAtNextLevel = requiredNodesPerLevel[currentLevel + 1];

        // The total number of branches (children) needed from `currentLevel` is the sum of:
        // 1. The branches needed from `currentLevel+1` (which propagate upwards).
        // 2. The nodes explicitly required at `currentLevel+1`.
        dpMinRequiredBranches[currentLevel] = requiredFromNextLevel + nodesRequiredAtNextLevel;
    }

    // --- Final Aggregation: Calculate Total Tree Nodes ---

    // Use BigInt to ensure we can handle potentially very large sums of nodes.
    let totalOverallNodes = 0n;

    // Iterate through each level of the tree (from 0 to N).
    for (let levelIndex = 0; levelIndex <= treeDepth; levelIndex++) {
        const availableNodesFromParent = dpMaxAvailableNodes[levelIndex];
        const branchesNeededForChildren = dpMinRequiredBranches[levelIndex];
        const nodesExplicitlyRequired = requiredNodesPerLevel[levelIndex];

        // The number of *actual* nodes that exist at this `levelIndex` is the sum of:
        // 1. The nodes explicitly required at this level (`nodesExplicitlyRequired`).
        // 2. The minimum of (nodes that *can* be supplied from the parent level)
        //    and (nodes that *must* be supplied for the children levels).
        // This ensures we only count nodes that are both structurally possible and functionally necessary.
        const nodesPresentAtThisLevel = Math.min(availableNodesFromParent, branchesNeededForChildren) + nodesExplicitlyRequired;

        // Add this level's count to the running total, ensuring BigInt conversion.
        totalOverallNodes += BigInt(nodesPresentAtThisLevel);
    }

    // The problem requires the final answer to be returned as a string.
    return totalOverallNodes.toString();
}

// --- Program Execution Block ---

// Execute the main calculation function and handle its output.
try {
    const finalCalculatedOutput = calculateTreeNodes();

    // If the function returns a valid string result (not "-1"), print it.
    // If it returns "-1", it indicates an impossible scenario, which is also printed.
    if (finalCalculatedOutput !== undefined) {
        console.log(finalCalculatedOutput);
    } else {
        // This case should ideally not be reached if calculateTreeNodes always returns a string or "-1".
        console.error("The calculation function returned an undefined result.");
        console.log("-1"); // Fallback for unexpected undefined return.
    }
} catch (executionError) {
    // Catch and log any unexpected runtime errors during the execution.
    console.error("An unhandled error occurred during program execution:", executionError.message);
    // In case of any error, typically "-1" is expected as an output for impossible cases.
    console.log("-1");
}