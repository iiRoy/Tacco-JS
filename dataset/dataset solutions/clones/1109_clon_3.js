/*
 * This module processes a string representation of a binary heap structure
 * received via standard input. It parses the number of elements and their
 * corresponding key values, then iterates through each node in the heap
 * (assuming a 1-indexed array representation) to display its key,
 * its parent's key, and its children's keys if they exist.
 */
function processHeapData(rawInputContent) {
    // --- Input Processing and Validation Phase ---

    // Guard clause: Ensure the provided input content is a non-empty string.
    if (!rawInputContent || typeof rawInputContent !== 'string') {
        console.error("Error: Input data is either missing or not a valid string type.");
        return; // Terminate execution if input is invalid.
    }

    // Split the raw input string into individual lines.
    // Use .trim() to remove leading/trailing whitespace from the entire input,
    // then filter out any potentially empty lines that might result from extra newlines.
    const parsedInputLines = rawInputContent.trim().split("\n").filter(lineText => lineText.length > 0);

    // Validate that we have at least two lines: one for the node count and one for the elements.
    if (parsedInputLines.length < 2) {
        console.error("Input format error: Expected at least two lines (node count and elements).");
        return;
    }

    // Extract and parse the total number of nodes from the first line.
    // Using the global Number() function for type conversion.
    const totalHeapNodes = Number(parsedInputLines[0]);

    // Validate the parsed node count: it must be a valid positive integer.
    if (isNaN(totalHeapNodes) || totalHeapNodes <= 0) {
        console.error(`Data parsing error: Invalid or non-positive node count detected: '${parsedInputLines[0]}'.`);
        return;
    }

    // Extract the string containing all heap element keys from the second line.
    // Then, split this string by spaces to get individual key strings.
    const keyStringSegments = parsedInputLines[1].split(" ");

    // Cross-validation: Check if the number of actual key elements matches the declared total node count.
    if (keyStringSegments.length !== totalHeapNodes) {
        console.error(`Data consistency error: Declared node count (${totalHeapNodes}) does not match the number of provided elements (${keyStringSegments.length}).`);
        return;
    }

    // --- Heap Array Initialization and Population Phase ---

    // Initialize the primary data structure for the heap.
    // We use a 1-indexed array, so its size is 'totalHeapNodes + 1'.
    // Filling with 'null' initially helps in debugging and distinguishes empty slots from actual zero values.
    const heapRepresentationArray = new Array(totalHeapNodes + 1).fill(null);

    // Iterate through the parsed key string segments to populate the heap array.
    // The input elements are 0-indexed, but the heap array is 1-indexed.
    for (let currentSegmentIdx = 0; currentSegmentIdx < totalHeapNodes; ++currentSegmentIdx) {
        const numericalKey = Number(keyStringSegments[currentSegmentIdx]);

        // Validate each individual key element to ensure it's a number.
        if (isNaN(numericalKey)) {
            console.error(`Data parsing error: Non-numeric element found at input position ${currentSegmentIdx + 1}: '${keyStringSegments[currentSegmentIdx]}'.`);
            return;
        }
        // Store the parsed numerical key into the 1-indexed heap array.
        heapRepresentationArray[currentSegmentIdx + 1] = numericalKey;
    }

    // --- Node Information Output Phase ---

    // Iterate through each node position in the 1-indexed heap array, from 1 up to 'totalHeapNodes'.
    for (let currentNodeIndex = 1; currentNodeIndex <= totalHeapNodes; ++currentNodeIndex) {
        // Retrieve the key value for the current node.
        const currentNodesKeyValue = heapRepresentationArray[currentNodeIndex];

        // Start building the output string for the current node using a template literal.
        let outputMessageBuilder = `node ${currentNodeIndex}: key = ${currentNodesKeyValue}`;

        // Calculate the potential parent's index. In a binary heap, parent of node 'i' is 'floor(i/2)'.
        const potentialParentIndex = Math.floor(currentNodeIndex / 2);

        // Check if the current node is not the root (i.e., has a parent).
        if (currentNodeIndex > 1) {
            const parentKey = heapRepresentationArray[potentialParentIndex];
            outputMessageBuilder += `, parent key = ${parentKey}`;
        }

        // Calculate the potential left child's index. In a binary heap, left child of 'i' is '2*i'.
        const potentialLeftChildIndex = currentNodeIndex * 2;

        // Check if a left child exists within the bounds of the heap.
        if (potentialLeftChildIndex <= totalHeapNodes) {
            const leftChildKey = heapRepresentationArray[potentialLeftChildIndex];
            outputMessageBuilder += `, left key = ${leftChildKey}`;
        }

        // Calculate the potential right child's index. In a binary heap, right child of 'i' is '2*i + 1'.
        const potentialRightChildIndex = currentNodeIndex * 2 + 1;

        // Check if a right child exists within the bounds of the heap.
        if (potentialRightChildIndex <= totalHeapNodes) {
            const rightChildKey = heapRepresentationArray[potentialRightChildIndex];
            outputMessageBuilder += `, right key = ${rightChildKey}`;
        }

        // Output the final constructed message for the current node.
        // The original implementation included a trailing comma and space, which is preserved here.
        console.log(outputMessageBuilder + ", ");
    }
}

// --- Application Entry Point ---

// Use Node.js 'fs' module to read the standard input file.
const fileSystemOperations = require("fs");

// Read the entire content of standard input into a buffer.
const stdinBufferContent = fileSystemOperations.readFileSync("/dev/stdin");

// Convert the buffer content to a UTF-8 string.
const decodedStdinString = stdinBufferContent.toString("utf8");

// Invoke the main processing function with the decoded input.
processHeapData(decodedStdinString);