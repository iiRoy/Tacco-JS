// This JavaScript module is designed to analyze graph connection data
// provided via standard input, determining the frequency of each vertex's
// appearance in the given edge descriptions.

/**
 * Processes raw input data to calculate and display vertex frequencies.
 * @param {string} rawDataContent - The entire input content as a single string.
 */
const processInputData = (rawDataContent) => {
    // Split the comprehensive input string into an array of individual lines.
    const inputLines = rawDataContent.split('\n');

    // The first line typically contains global parameters:
    // the total number of nodes (vertices) and the number of edges.
    const headerLine = inputLines[0];

    // Separate the two numerical values from the header line.
    const headerParts = headerLine.split(' ');

    // Convert string parts to numbers for calculation.
    const totalNodes = Number(headerParts[0]); // Represents 'N' from original
    const numEdges = Number(headerParts[1]);   // Represents 'M' from original

    // Implement a basic validation check for the parsed numerical inputs.
    // Ensures that totalNodes is a positive integer and numEdges is a non-negative integer.
    if (isNaN(totalNodes) || totalNodes <= 0 || !Number.isInteger(totalNodes) ||
        isNaN(numEdges) || numEdges < 0 || !Number.isInteger(numEdges)) {
        console.error("Input Data Error: Node count or edge count is invalid. Please check the first line of input.");
        return; // Terminate execution if header data is malformed.
    }

    // Extract the lines that describe the edges. These are all lines after the header,
    // up to the number of edges specified.
    const edgeDescriptionLines = inputLines.slice(1, numEdges + 1);

    // Concatenate all vertex identifiers from the edge descriptions into a single string.
    // This step effectively flattens all edge data (e.g., "1 2", "2 3" becomes "1223").
    // Using 'reduce' for a distinct approach compared to simple map/join.
    const allVertexReferences = edgeDescriptionLines.reduce((accumulator, currentLine) => {
        // Remove all whitespace characters from the current line before appending.
        return accumulator + currentLine.replace(/\s/g, '');
    }, ''); // The initial value for the accumulator is an empty string.

    // Initialize a Map object to efficiently store and retrieve the frequency
    // of each unique vertex ID encountered. This is a performance optimization.
    const vertexFrequencyMap = new Map();

    // Iterate over each character in the concatenated vertex string.
    // Each character represents a vertex ID.
    for (const charReference of allVertexReferences) {
        const vertexId = Number(charReference); // Convert the character to its numeric value.

        // Update the frequency count for this vertexId in the map.
        // If the vertexId is new, initialize its count to 0 before incrementing.
        vertexFrequencyMap.set(vertexId, (vertexFrequencyMap.get(vertexId) || 0) + 1);
    }

    // Prepare an array to hold the final frequency counts for output.
    // This array will contain counts for vertices from 1 up to 'totalNodes'.
    const finalCountsBuffer = [];

    // Loop through each possible vertex ID, from 1 to 'totalNodes'.
    // This ensures that all vertices are accounted for, even if they don't appear in edges.
    for (let currentVertexIdentifier = 1; currentVertexIdentifier <= totalNodes; currentVertexIdentifier++) {
        // Retrieve the frequency from the map. If a vertex ID was never present in the edges,
        // its frequency will be 0 (due to the `|| 0` fallback).
        const frequency = vertexFrequencyMap.get(currentVertexIdentifier) || 0;
        finalCountsBuffer.push(frequency); // Add the frequency to the results buffer.
    }

    // Output all collected frequencies, with each frequency on a new line.
    console.log(finalCountsBuffer.join('\n'));
};

// The primary execution block: responsible for reading input and initiating processing.
try {
    // Dynamically import the 'fs' (file system) module.
    const fileSystemUtility = require('fs');
    const standardInputPath = '/dev/stdin'; // Standard POSIX path for input.

    // Read the entire content of the standard input stream synchronously.
    // Specify 'utf8' encoding to handle text data correctly.
    const fileContents = fileSystemUtility.readFileSync(standardInputPath, 'utf8');

    // Invoke the main processing function with the read file contents.
    processInputData(fileContents);
} catch (readingError) {
    // Catch and report any errors that occur during the file reading process.
    console.error("An error occurred while attempting to read from standard input:", readingError.message);
    // Optionally, provide more details for debugging.
    console.error("Ensure input is correctly piped or redirected to the script.");
}