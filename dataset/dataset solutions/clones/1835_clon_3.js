"use strict";

// Utility function for robust numeric parsing.
// Handles potential non-numeric inputs by throwing an error, ensuring data integrity.
const convertToNumber = (inputString) => {
    const numericalValue = Number(inputString);
    if (isNaN(numericalValue)) {
        throw new Error(`Input parsing error: '${inputString}' is not a valid number.`);
    }
    return numericalValue;
};

// Acquire raw input data from standard input.
// Reads the entire file, decodes it as UTF-8.
const rawInputBuffer = require("fs").readFileSync("/dev/stdin", "utf8");

// Process the raw input: trim whitespace, then split into tokens
// using either space or newline as delimiters.
const inputTokens = rawInputBuffer.trim().split(/ |\n/);

// Core function to compute the tree path sum based on specified rules.
function computeTreePathTraversalSum() {
    let finalOutputValue = -1; // Default error state, changed upon successful computation.

    // Extract the maximum depth (number of levels) from the input tokens.
    // The first token represents the total depth.
    const maxTreeDepth = convertToNumber(inputTokens.shift());

    // Basic validation for the tree depth. A negative depth is an invalid scenario.
    if (maxTreeDepth < 0) {
        console.log(finalOutputValue);
        return; // Exit early on invalid depth.
    }

    // Parse the remaining tokens into an array representing branch requirements
    // or 'leaves' at each level.
    const levelBranchRequirements = inputTokens.map(convertToNumber);

    // Array to store the actual number of nodes present at each level.
    // Initialized with zeros, size is `maxTreeDepth + 1` (for levels 0 to `maxTreeDepth`).
    const actualNodeCounts = new Array(maxTreeDepth + 1).fill(0);

    // Define constants for clarity and potential future modification.
    const rootLevelNodeCount = 1; // The tree starts with a single root node at level 0.
    const branchingMultiplier = 2; // Each unconsumed node doubles for the next level.

    // Initialize the root node count.
    actualNodeCounts[0] = rootLevelNodeCount;

    // Accumulator for the total sum of nodes across all valid paths.
    // Starts with the root node itself.
    let totalAccumulatedPaths = rootLevelNodeCount;

    // --- First Phase: Simulate tree growth downwards (from root to max depth) ---
    // Calculate node counts for each subsequent level.
    for (let currentLevel = 0; currentLevel < maxTreeDepth; ++currentLevel) {
        const nodesAtCurrentLevel = actualNodeCounts[currentLevel];
        const branchesConsumedAtCurrentLevel = levelBranchRequirements[currentLevel];

        // Calculate the number of nodes that would be generated for the next level.
        // This is based on nodes not consumed by branches, then doubled.
        const generatedNodesForNextLevel = (nodesAtCurrentLevel - branchesConsumedAtCurrentLevel) * branchingMultiplier;

        // Critical validation: If generated nodes are not positive, the tree structure is invalid.
        if (generatedNodesForNextLevel <= 0) {
            console.log(finalOutputValue); // Output -1 for invalid structure.
            return; // Terminate execution.
        }

        // Store the calculated node count for the next level.
        actualNodeCounts[currentLevel + 1] = generatedNodesForNextLevel;
        // Add these new nodes to the overall path sum.
        totalAccumulatedPaths += generatedNodesForNextLevel;
    }

    // --- Second Phase: Evaluate and potentially adjust path sum at the final depth ---
    const nodesAtFinalDepth = actualNodeCounts[maxTreeDepth];
    const requiredAtFinalDepth = levelBranchRequirements[maxTreeDepth]; // A[N] in original problem context.

    if (nodesAtFinalDepth < requiredAtFinalDepth) {
        // Scenario 1: Not enough nodes at the final depth to meet requirements.
        console.log(finalOutputValue); // Output -1.
        return;
    } else if (nodesAtFinalDepth === requiredAtFinalDepth) {
        // Scenario 2: Perfect match at the final depth. No adjustments needed.
        finalOutputValue = totalAccumulatedPaths;
    } else {
        // Scenario 3: Excess nodes at the final depth (nodesAtFinalDepth > requiredAtFinalDepth).
        // This requires backtracking to reduce the total path count.

        // Array to store the maximum permissible node count at each level,
        // propagating upwards from the final depth.
        const maxPermissibleNodeCounts = new Array(maxTreeDepth + 1).fill(0);

        // Initialize the maximum permissible nodes at the final depth to the requirement.
        maxPermissibleNodeCounts[maxTreeDepth] = requiredAtFinalDepth;

        // Backtrack from the final depth up to the root (level 1).
        for (let currentLevel = maxTreeDepth; currentLevel > 0; --currentLevel) {
            const actualNodesAtCurrentLevel = actualNodeCounts[currentLevel];
            const maxAllowedNodesAtCurrentLevel = maxPermissibleNodeCounts[currentLevel];
            const branchesFromParentLevel = levelBranchRequirements[currentLevel - 1]; // Corresponds to A[d-1]

            let nextMaxAllowedForParentLevel; // Variable to hold the calculated max permissible for the parent level.

            if (maxAllowedNodesAtCurrentLevel >= actualNodesAtCurrentLevel) {
                // If actual nodes are within or equal to the permissible limit,
                // propagate the actual node count upwards.
                nextMaxAllowedForParentLevel = actualNodesAtCurrentLevel + branchesFromParentLevel;
            } else {
                // If actual nodes exceed the permissible limit,
                // calculate the excess and subtract from the total path sum.
                const excessNodesAtThisLevel = actualNodesAtCurrentLevel - maxAllowedNodesAtCurrentLevel;
                totalAccumulatedPaths -= excessNodesAtThisLevel;
                // Propagate the *limited* permissible node count upwards.
                nextMaxAllowedForParentLevel = maxAllowedNodesAtCurrentLevel + branchesFromParentLevel;
            }
            // Assign the calculated value to the parent level's max permissible count.
            maxPermissibleNodeCounts[currentLevel - 1] = nextMaxAllowedForParentLevel;
        }

        // Final adjustment check for the root level (level 0).
        const actualRootNodes = actualNodeCounts[0];
        const maxAllowedRootNodes = maxPermissibleNodeCounts[0];

        if (maxAllowedRootNodes < actualRootNodes) {
            // If the maximum allowed root nodes is less than the actual root nodes,
            // subtract the difference from the total path sum.
            totalAccumulatedPaths -= (actualRootNodes - maxAllowedRootNodes);
        }
        finalOutputValue = totalAccumulatedPaths;
    }

    // Output the computed result.
    console.log(finalOutputValue);
}

// Execute the main computation function.
computeTreePathTraversalSum();