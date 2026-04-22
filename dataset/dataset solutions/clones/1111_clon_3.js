// A dedicated utility for interacting with the file system.
const fileSystemAccess = require('fs');

// Define the universal input stream path and the character encoding.
const standardInputPath = '/dev/stdin';
const standardEncoding = 'utf8';

// Obtain the raw byte stream from the specified input source.
let rawBufferContent = fileSystemAccess.readFileSync(standardInputPath, standardEncoding);

// Sanitize the input by removing any leading or trailing whitespace characters.
let cleanedUpContent = rawBufferContent.trim();

// Tokenize the cleaned content into an array of strings, splitting by any sequence of whitespace.
// A subsequent filter ensures that no empty strings are included in the token list,
// which can occur if multiple whitespace characters are adjacent.
let initialTokenList = cleanedUpContent.split(/\s+/).filter(Boolean);

// According to the problem's convention, the very first token in the input stream
// is typically a metadata element (like a count) and should be disregarded for processing.
let significantTokens = initialTokenList.slice(1);

// An array to accumulate the formatted output strings before final presentation.
let finalOutputStrings = [];

// Implement a safeguard: if no significant data tokens remain after initial processing,
// log a specific message and terminate further tree-related operations.
if (significantTokens.length === 0) {
    console.log("Input stream contains no valid data elements for binary tree analysis.");
} else {
    // Iterate through the array of significant tokens. Each token represents a node's value.
    // The array is treated as a 0-indexed representation of a 1-indexed complete binary tree.
    for (let currentZeroOffsetIndex = 0; currentZeroOffsetIndex < significantTokens.length; currentZeroOffsetIndex++) {
        const currentElementData = significantTokens[currentZeroOffsetIndex];
        // Convert the 0-based array index to its corresponding 1-based tree node identifier.
        const treeNodeID = currentZeroOffsetIndex + 1;

        // Start building the string for the current node, including its ID and data.
        let nodeDescriptor = `Node ${treeNodeID}: Value = ${currentElementData}`;

        // Logic for determining and appending parent node information.
        // A node has a parent if its 1-based ID is greater than 1 (i.e., it's not the root).
        if (treeNodeID > 1) {
            // Calculate the 1-based ID of the parent node.
            const parentTreeNodeID = Math.floor(treeNodeID / 2);
            // Convert the parent's 1-based ID back to a 0-based array index.
            const parentZeroOffsetIndex = parentTreeNodeID - 1;

            // Validate that the calculated parent index is within the bounds of our data array.
            if (parentZeroOffsetIndex >= 0 && parentZeroOffsetIndex < significantTokens.length) {
                nodeDescriptor += `, Parent Value = ${significantTokens[parentZeroOffsetIndex]}`;
            }
        }

        // Logic for determining and appending left child node information.
        // Calculate the 1-based ID of the left child node.
        const leftChildTreeNodeID = 2 * treeNodeID;
        // Convert the left child's 1-based ID back to a 0-based array index.
        const leftChildZeroOffsetIndex = leftChildTreeNodeID - 1;

        // Verify if a left child exists by checking if its 0-based index is within array bounds.
        if (leftChildZeroOffsetIndex < significantTokens.length) {
            nodeDescriptor += `, Left Child Value = ${significantTokens[leftChildZeroOffsetIndex]}`;
        }

        // Logic for determining and appending right child node information.
        // Calculate the 1-based ID of the right child node.
        const rightChildTreeNodeID = (2 * treeNodeID) + 1;
        // Convert the right child's 1-based ID back to a 0-based array index.
        const rightChildZeroOffsetIndex = rightChildTreeNodeID - 1;

        // Verify if a right child exists by checking if its 0-based index is within array bounds.
        if (rightChildZeroOffsetIndex < significantTokens.length) {
            nodeDescriptor += `, Right Child Value = ${significantTokens[rightChildZeroOffsetIndex]}`;
        }
        
        // Add the fully constructed node descriptor string to our collection.
        finalOutputStrings.push(nodeDescriptor);
    }

    // Concatenate all collected output strings, separating each with a newline character,
    // and print the final result to the console.
    console.log(finalOutputStrings.join('\n'));
}