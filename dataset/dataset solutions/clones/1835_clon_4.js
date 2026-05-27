"use strict";
var input = require("fs").readFileSync("/dev/stdin", "utf8");
var cin = input.trim().split(/ |\n/), cid = 0;

let treeDepthLimit;
let nodeCountsAtDepth;

/**
 * Recursively calculates the minimum total nodes in a subtree starting at currentDepth,
 * given the maximum branches available from its parent.
 * It also returns the minimum branches this subtree requires from its parent.
 *
 * @param {number} currentDepth The current depth level being processed (0-indexed).
 * @param {number} maxBranchesFromParent The maximum number of branches that the parent node
 *                                       can provide to this current depth level.
 * @returns {{totalNodesInSubtree: number, minBranchesForParent: number}|null}
 *          An object containing the total minimum nodes in this subtree and the minimum
 *          branches required by this level from its parent, or null if the configuration
 *          is impossible.
 */
function determineOptimalTreeStructure(currentDepth, maxBranchesFromParent) {
    // Base Case: If we've gone past the maximum allowed depth, no more nodes are added.
    if (currentDepth > treeDepthLimit) {
        return { totalNodesInSubtree: 0, minBranchesForParent: 0 };
    }

    // Rule 1: Check if the number of available branches from the parent is sufficient
    // to place the required nodes at the current depth.
    if (maxBranchesFromParent < nodeCountsAtDepth[currentDepth]) {
        return null; // Impossible scenario: not enough branches to place required nodes.
    }

    // Calculate the maximum possible branches that can be passed down to the next level (children).
    // Each remaining branch after placing nodes at currentDepth can split into two.
    const potentialBranchesForChildren = (maxBranchesFromParent - nodeCountsAtDepth[currentDepth]) * 2;

    // Recursively call for the children's subtree to determine its optimal structure.
    const childSubtreeOutcome = determineOptimalTreeStructure(currentDepth + 1, potentialBranchesForChildren);

    // If the children's subtree configuration is impossible, then the current path is also impossible.
    if (childSubtreeOutcome === null) {
        return null;
    }

    // Bottom-up calculation: Determine the minimum number of branches required at this level
    // to support its children and itself.
    const minBranchesNeededForChildren = childSubtreeOutcome.minBranchesForParent;
    // The parent of the children needs to provide at least ceil(minBranchesNeededForChildren / 2) branches.
    const minBranchesToSupportChildren = Math.ceil(minBranchesNeededForChildren / 2);

    // The actual number of branches that must exist at this level is the maximum of:
    // 1. The number of nodes explicitly required at this level (nodeCountsAtDepth[currentDepth]).
    // 2. The minimum branches needed to support the children's subtree.
    const minimumRequiredBranchesAtThisLevel = Math.max(nodeCountsAtDepth[currentDepth], minBranchesToSupportChildren);

    // Rule 2: Check if the minimum required branches at this level exceed what's actually available
    // from the parent. This ensures we don't try to use more branches than were supplied.
    if (minimumRequiredBranchesAtThisLevel > maxBranchesFromParent) {
        return null; // Impossible scenario: cannot satisfy both current level and children's needs.
    }

    // The number of branches actually used at this level is this calculated minimum.
    const actualBranchesUsedAtThisLevel = minimumRequiredBranchesAtThisLevel;

    // The total nodes in the subtree rooted at currentDepth is the sum of branches used at this level
    // and the total nodes from its children's subtree.
    const totalNodesInCurrentSubtree = actualBranchesUsedAtThisLevel + childSubtreeOutcome.totalNodesInSubtree;

    // The number of branches this level requires its parent to supply is simply the
    // actual branches used at this level.
    const branchesRequiredFromParent = actualBranchesUsedAtThisLevel;

    return { totalNodesInSubtree: totalNodesInCurrentSubtree, minBranchesForParent: branchesRequiredFromParent };
}

function executeTreeCalculation() {
    treeDepthLimit = +cin.shift();
    nodeCountsAtDepth = cin.map(val => +val);

    // Initiate the recursive calculation starting from the root (depth 0).
    // The root conceptually receives 1 branch from a non-existent parent.
    const finalOutcome = determineOptimalTreeStructure(0, 1);

    if (finalOutcome === null) {
        console.log(-1);
    } else {
        console.log(finalOutcome.totalNodesInSubtree);
    }
}

executeTreeCalculation();
