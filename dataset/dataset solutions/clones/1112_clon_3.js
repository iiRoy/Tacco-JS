// A simple module for file system operations.
const dataFetcher = require('fs');

// Define constants for input processing.
const standardInputPath = '/dev/stdin';
const textEncoding = 'utf8';
const inputDelimiterRegex = /[ |\n]/; // Matches space or newline characters.
const initialElementSkipCount = 1; // Number of elements to skip from the beginning.

/**
 * Reads content from a specified file path, processes it, and generates
 * a formatted string representing a binary tree structure.
 *
 * @param {string} filePath - The path to the input file.
 * @param {string} encoding - The character encoding for reading the file.
 * @param {RegExp} splitter - Regular expression to split the input string.
 * @param {number} skipCount - Number of initial elements to disregard.
 * @returns {string} A multi-line string with node information.
 */
function processAndFormatTreeData(filePath, encoding, splitter, skipCount) {
    // Attempt to read the raw input content from the designated source.
    let rawInputContent;
    try {
        rawInputContent = dataFetcher.readFileSync(filePath, encoding);
    } catch (readError) {
        // Log an error if file reading fails and return an empty string or throw.
        console.error(`Error reading input from ${filePath}: ${readError.message}`);
        return '';
    }

    // Clean up leading/trailing whitespace from the raw content.
    const trimmedInputString = rawInputContent.trim();

    // Split the cleaned string into an array of individual value tokens.
    const valueTokens = trimmedInputString.split(splitter);

    // If there are no tokens after splitting, or if all are skipped, handle gracefully.
    if (valueTokens.length <= skipCount) {
        console.warn("Input contained no meaningful data after splitting and skipping.");
        return '';
    }

    // Discard the initial 'skipCount' elements as per requirement.
    const relevantTokens = valueTokens.slice(skipCount);

    // If the relevant tokens array is empty after slicing, nothing to process.
    if (relevantTokens.length === 0) {
        return '';
    }

    /**
     * Helper function to determine and format a single node's details.
     * Assumes a 1-based indexing for tree structure.
     *
     * @param {string} currentElement - The value of the current node.
     * @param {number} zeroBasedIndex - The 0-based index of the current element in the array.
     * @param {string[]} fullArrayOfElements - The complete array of relevant elements.
     * @returns {string} Formatted string for the current node.
     */
    const formatNodeDetails = (currentElement, zeroBasedIndex, fullArrayOfElements) => {
        // Convert to 1-based index for typical tree array representation.
        const oneBasedNodeIndex = zeroBasedIndex + 1;
        let nodeInfoParts = [];

        // Add the current node's identifier and value.
        nodeInfoParts.push(`Node ${oneBasedNodeIndex}: Value = ${currentElement}`);

        // Calculate parent index (1-based)
        const parentOneBasedIndex = Math.floor(oneBasedNodeIndex / 2);
        // Check if a parent exists (only for nodes after the root).
        if (oneBasedNodeIndex > 1) {
            // Convert parent 1-based index back to 0-based for array access.
            const parentZeroBasedIndex = parentOneBasedIndex - 1;
            const parentValue = fullArrayOfElements[parentZeroBasedIndex];
            if (parentValue !== undefined) { // Ensure parent value exists
                nodeInfoParts.push(`Parent Value = ${parentValue}`);
            }
        }

        // Calculate left child index (1-based)
        const leftChildOneBasedIndex = 2 * oneBasedNodeIndex;
        // Check if a left child exists within the bounds of the array.
        if (leftChildOneBasedIndex <= fullArrayOfElements.length) {
            // Convert left child 1-based index back to 0-based.
            const leftChildZeroBasedIndex = leftChildOneBasedIndex - 1;
            const leftChildValue = fullArrayOfElements[leftChildZeroBasedIndex];
            if (leftChildValue !== undefined) { // Ensure left child value exists
                nodeInfoParts.push(`Left Child Value = ${leftChildValue}`);
            }
        }

        // Calculate right child index (1-based)
        const rightChildOneBasedIndex = 2 * oneBasedNodeIndex + 1;
        // Check if a right child exists within the bounds of the array.
        if (rightChildOneBasedIndex <= fullArrayOfElements.length) {
            // Convert right child 1-based index back to 0-based.
            const rightChildZeroBasedIndex = rightChildOneBasedIndex - 1;
            const rightChildValue = fullArrayOfElements[rightChildZeroBasedIndex];
            if (rightChildValue !== undefined) { // Ensure right child value exists
                nodeInfoParts.push(`Right Child Value = ${rightChildValue}`);
            }
        }

        // Join all collected parts with a comma and space.
        return nodeInfoParts.join(', ');
    };

    // Map each relevant token to its formatted node string.
    const formattedNodeStrings = relevantTokens.map(formatNodeDetails);

    // Join all formatted node strings with newlines for final output.
    return formattedNodeStrings.join('\n');
}

// Execute the processing and print the final result to standard output.
const finalOutputMessage = processAndFormatTreeData(
    standardInputPath,
    textEncoding,
    inputDelimiterRegex,
    initialElementSkipCount
);

console.log(finalOutputMessage);