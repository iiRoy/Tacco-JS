"use strict";

// Utility function to process raw input strings into structured data.
function decodeInputString(rawText) {
    // Basic validation for the input string to ensure it's not empty or malformed.
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length === 0) {
        throw new Error("Input data must be a non-empty string for processing.");
    }

    const textLines = rawText.trim().split("\n");

    // We expect at least two lines: one for N, M and one for the permutation array 'p'.
    if (textLines.length < 2) {
        throw new Error("Insufficient input lines provided. Expected a minimum of two lines.");
    }

    const firstLineData = parseNumericSequence(textLines[0]);
    // The first number on the initial line represents the total count of nodes (N).
    const nodeCount = firstLineData[0];
    // The second number (M) represents the number of edges, but it's not directly used in the core logic.
    // const edgeQuantity = firstLineData[1]; // Removed as it's not utilized.

    // The second line contains the permutation array (p).
    const permutationSet = parseNumericSequence(textLines[1]);

    // Process all subsequent lines to extract connection pairs (x, y).
    const linkPairs = textLines.slice(2).map(lineContent => {
        const parsedPair = parseNumericSequence(lineContent);
        // Validate that each connection line contains exactly two numbers.
        if (parsedPair.length !== 2) {
            throw new Error(`Invalid link structure line: "${lineContent}". Expected exactly two integer values.`);
        }
        return { firstConnectedNode: parsedPair[0], secondConnectedNode: parsedPair[1] }; // Renamed x, y
    });

    // Return the collected and parsed data in a structured object.
    return {
        totalNodes: nodeCount,
        permutationValues: permutationSet,
        connectionPairs: linkPairs
    };
}

// Helper function to convert a space-separated string of numbers into an array of integers.
function parseNumericSequence(textLine) {
    // Guard against empty or whitespace-only lines.
    if (!textLine || textLine.trim() === '') {
        return [];
    }
    // Split the line by one or more whitespace characters, filter out any empty strings
    // that might result from multiple spaces, then parse each part as an integer.
    return textLine.trim().split(/\s+/).filter(segment => segment !== '').map(strValue => {
        const numericValue = parseInt(strValue, 10);
        // Explicitly check for NaN to catch non-numeric input.
        if (isNaN(numericValue)) {
            throw new Error(`Invalid non-numeric token encountered: "${strValue}" in line "${textLine}".`);
        }
        return numericValue;
    });
}

// Represents a single element or node within a Disjoint Set Union (DSU) data structure.
class DSUElement {
    // A reference to the parent element in the DSU tree.
    // If an element points to itself, it is considered the root of its set.
    parentLink;
    // The 'rank' of the tree rooted at this element. This is used for the
    // union-by-rank optimization to keep the trees relatively flat.
    setRank;

    // Initializes a new DSUElement. Each element starts as a root of its own distinct set.
    constructor() {
        this.parentLink = this; // Self-reference indicates this element is a root.
        this.setRank = 0;     // Initial rank is zero for a singleton set.
    }

    // Determines if this element belongs to the same disjoint set as another specified element.
    // This is achieved by comparing the roots of their respective sets.
    isWithinSameSetAs(otherElement) {
        // Robustness check: ensure the input is a valid DSUElement instance.
        if (!otherElement || !(otherElement instanceof DSUElement)) {
            console.error("Comparison attempted with an invalid or non-DSUElement object.");
            return false; // Or throw an error for stricter validation.
        }
        return this.findSetRepresentative() === otherElement.findSetRepresentative();
    }

    // Merges the set containing this element with the set containing 'otherElement'.
    // This operation employs the "union by rank" heuristic to maintain balanced tree structures.
    uniteSets(otherElement) {
        // Guard against self-union or uniting with an invalid element.
        if (this === otherElement || !(otherElement instanceof DSUElement)) {
            return; // No operation needed or invalid input.
        }

        let rootOfThis = this.findSetRepresentative();
        let rootOfOther = otherElement.findSetRepresentative();

        // If both elements are already in the same set, no union is required.
        if (rootOfThis === rootOfOther) {
            return;
        }

        // Apply union by rank: attach the tree with the smaller rank under the root of the
        // tree with the larger rank. This helps in minimizing tree depth.
        if (rootOfThis.setRank < rootOfOther.setRank) {
            // Swap roots to ensure 'rootOfThis' always refers to the root with potentially higher rank.
            [rootOfThis, rootOfOther] = [rootOfOther, rootOfThis]; // Using array destructuring for swapping.
        }

        // Make 'rootOfOther' a child of 'rootOfThis'.
        rootOfOther.parentLink = rootOfThis;

        // If the ranks were equal before the union, the rank of the new root increases.
        if (rootOfThis.setRank === rootOfOther.setRank) {
            rootOfThis.setRank++;
        }
    }

    // Finds the representative (root) of the set that this element belongs to.
    // This method also performs "path compression" iteratively to flatten the tree structure,
    // thereby optimizing subsequent `findSetRepresentative` operations.
    findSetRepresentative() {
        let currentNodeOnPath = this;
        // Traverse upwards to locate the actual root of the set.
        while (currentNodeOnPath.parentLink !== currentNodeOnPath) {
            currentNodeOnPath = currentNodeOnPath.parentLink;
        }
        // At this point, 'currentNodeOnPath' is the root of the set.

        // Perform path compression: iterate back down the original path
        // and link all visited nodes directly to the found root.
        let nodeToCompress = this;
        while (nodeToCompress.parentLink !== currentNodeOnPath) {
            let nextNodeInPath = nodeToCompress.parentLink;
            nodeToCompress.parentLink = currentNodeOnPath; // Direct link to root.
            nodeToCompress = nextNodeInPath;
        }
        return currentNodeOnPath;
    }
}

// Manages a collection of Disjoint Sets (groups of elements).
// Provides functionality to create the DSU structure and query set memberships.
class DisjointSetManagementSystem {
    // An array holding DSUElement instances, where the array index corresponds to the element's ID.
    dsuElements;

    // Private constructor to enforce proper initialization via a static factory method.
    // This ensures the DSU structure is built correctly from initial data.
    constructor(initialElements) {
        // Validate that the input is an array containing DSUElement instances.
        if (!Array.isArray(initialElements) || initialElements.some(e => !(e instanceof DSUElement))) {
            throw new Error("DisjointSetManagementSystem must be initialized with an array of DSUElement instances.");
        }
        this.dsuElements = initialElements;
    }

    // Factory method to construct a DisjointSetManagementSystem instance.
    // It initializes a specified number of elements and then applies a list of connections to unite sets.
    static createFromLinks(totalElementCount, elementConnections) {
        // Input validation for the total element count and the array of connections.
        if (totalElementCount <= 0 || !Number.isInteger(totalElementCount) || !Array.isArray(elementConnections)) {
            throw new Error("Invalid parameters provided for building DisjointSetManagementSystem.");
        }

        // Initialize an array of DSUElement objects. We use 1-based indexing for element IDs,
        // so the array size is totalElementCount + 1, with index 0 typically unused.
        const elementNodeArray = Array.from({ length: totalElementCount + 1 }, (_, index) => {
            return new DSUElement();
        });

        // Iterate through each connection pair and perform a union operation between them.
        for (const connection of elementConnections) {
            const nodeOneId = connection.firstConnectedNode;
            const nodeTwoId = connection.secondConnectedNode;

            // Perform boundary checks for node IDs before attempting to unite sets.
            // Node IDs must be within the range [1, totalElementCount].
            if (nodeOneId < 1 || nodeOneId > totalElementCount || nodeTwoId < 1 || nodeTwoId > totalElementCount) {
                console.warn(`Skipping invalid connection (${nodeOneId}, ${nodeTwoId}): Element ID(s) out of valid range (1 to ${totalElementCount}).`);
                continue;
            }

            elementNodeArray[nodeOneId].uniteSets(elementNodeArray[nodeTwoId]);
        }

        return new DisjointSetManagementSystem(elementNodeArray);
    }

    // Checks if two specific elements (identified by their IDs) belong to the same disjoint set.
    areElementsGroupedTogether(idA, idB) {
        // Validate element IDs to prevent out-of-bounds array access.
        if (idA < 1 || idA >= this.dsuElements.length ||
            idB < 1 || idB >= this.dsuElements.length) {
            console.error(`Invalid element ID(s) provided for membership check: ${idA}, ${idB}.`);
            return false;
        }
        return this.dsuElements[idA].isWithinSameSetAs(this.dsuElements[idB]);
    }
}

// The core function that processes the input data and calculates the final result.
// It determines how many elements in a given permutation array 'p' are in the same
// disjoint set as their corresponding 1-based index.
function computeMatchingElementsCount(rawInputData) {
    // Parse the raw string input into its structured components.
    const { totalNodes, permutationValues, connectionPairs } = decodeInputString(rawInputData);

    // Construct the Disjoint Set Union data structure based on the provided connections.
    const dsuManager = DisjointSetManagementSystem.createFromLinks(totalNodes, connectionPairs);

    let numberOfMatches = 0; // Initialize a counter for elements that satisfy the condition.

    // Iterate through the permutation array.
    // The loop variable 'k' is a 0-based index, which corresponds to a 1-based node ID 'k + 1'.
    for (let k = 0; k < permutationValues.length; k++) {
        const currentPermutationValue = permutationValues[k];
        const correspondingNodeIdentifier = k + 1; // Convert 0-based index to 1-based node ID.

        // Additional validation: ensure the permutation value itself is a valid node ID.
        if (currentPermutationValue < 1 || currentPermutationValue > totalNodes) {
            console.warn(`Permutation value ${currentPermutationValue} at index ${k} is outside the valid node range (1 to ${totalNodes}). Skipping this check.`);
            continue;
        }
        // Also ensure the correspondingNodeIdentifier is within bounds, though it should be if loop condition is met.
        if (correspondingNodeIdentifier > totalNodes) {
             console.warn(`Node identifier ${correspondingNodeIdentifier} at index ${k} exceeds total nodes. Skipping this check.`);
             continue;
        }

        // Check if the current value from the permutation array is in the same set as its 1-based index.
        if (dsuManager.areElementsGroupedTogether(currentPermutationValue, correspondingNodeIdentifier)) {
            numberOfMatches++; // Increment the counter if the condition is met.
        }
    }

    // Log the final computed result to the console.
    console.log(`Calculated number of elements where their value and their index are in the same DSU set: ${numberOfMatches}`);

    // Return the final count.
    return numberOfMatches;
}

// --- Script Execution Entry Point ---
// This block handles reading input from standard input and invoking the main computation function.
// It mimics the original script's direct execution style for competitive programming environments.
try {
    // Node.js specific: read the entire file content from standard input synchronously.
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    computeMatchingElementsCount(fileContents);
} catch (executionError) {
    // If any error occurs during input reading or computation, log it.
    console.error("An error occurred during script execution:", executionError.message);
    // In a production script, you might also want to exit with a non-zero status code to indicate failure.
    // process.exit(1);
}