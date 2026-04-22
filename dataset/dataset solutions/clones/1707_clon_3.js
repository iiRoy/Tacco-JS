let rawInputContent;
try {
    // Attempt to read the entire input stream from standard input
    rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
} catch (ioError) {
    // If an error occurs during file reading, log it and terminate the process.
    console.error("Input reading failed: ", ioError.message);
    process.exit(1); // Indicate an error exit status
}

// Split the comprehensive input string into individual lines
const allInputLines = rawInputContent.split('\n');

// The very first line contains the total number of nodes for the graph
const firstLineStr = allInputLines[0];
// All subsequent lines represent the edges of the graph
const remainingLines = allInputLines.slice(1);

let graphSize; // This variable will hold the parsed integer value for N

// Perform validation and parsing for the graph size
if (firstLineStr && firstLineStr.trim() !== '') {
    // Parse the string into an integer, ensuring base 10
    graphSize = parseInt(firstLineStr.trim(), 10);

    // Validate that the parsed graph size is a valid positive number
    if (isNaN(graphSize) || graphSize <= 0) {
        console.error("Invalid or non-positive graph size detected: ", firstLineStr);
        process.exit(1);
    }
} else {
    // Handle cases where the first line containing graph size is missing or empty
    console.error("Graph size line is absent from the input.");
    process.exit(1);
}

// Calculate intermediate values for the initial sum formula
const incrementedSize = graphSize + 1;
const doubleIncrementedSize = graphSize + 2;
const combinationDivisor = 6; // Constant divisor for the sum of combinations (n * (n+1) * (n+2) / 6)

// Initialize the cumulative sum with the total possible value before considering edge subtractions.
// This formula represents the sum of all possible 'u * (N - v + 1)' terms for a complete graph
// where u < v, effectively. It's a closed form for the sum of triangular numbers up to N.
let cumulativeSum = (graphSize * incrementedSize * doubleIncrementedSize) / combinationDivisor;

// Process each line representing an edge in the graph
remainingLines.forEach((currentEdgePairStr, lineIndex) => {
    // Ignore any empty lines that might result from extra newlines in the input
    if (currentEdgePairStr.trim() === '') {
        return;
    }

    // Split the current edge line by one or more whitespace characters
    const vertexStringComponents = currentEdgePairStr.trim().split(/\s+/);

    // Validate that exactly two vertex components were found
    if (vertexStringComponents.length !== 2) {
        console.warn(`Skipping malformed edge entry on line ${lineIndex + 2}: "${currentEdgePairStr}"`);
        return;
    }

    // Parse the string components into integer vertex identifiers
    let firstVertexCandidate = parseInt(vertexStringComponents[0], 10);
    let secondVertexCandidate = parseInt(vertexStringComponents[1], 10);

    // Validate that both parsed vertices are valid positive integers
    if (isNaN(firstVertexCandidate) || isNaN(secondVertexCandidate) || firstVertexCandidate <= 0 || secondVertexCandidate <= 0) {
        console.warn(`Skipping edge with invalid vertex numbers on line ${lineIndex + 2}: "${currentEdgePairStr}"`);
        return;
    }

    // Ensure the vertices are ordered (smaller, larger) for consistent calculation,
    // as the original logic implicitly relies on u < v for the subtraction term.
    const smallerNodeIdentifier = Math.min(firstVertexCandidate, secondVertexCandidate);
    const largerNodeIdentifier = Math.max(firstVertexCandidate, secondVertexCandidate);

    // Add an optional guard clause to check if vertices are within the declared graph size
    if (smallerNodeIdentifier > graphSize || largerNodeIdentifier > graphSize) {
        console.warn(`Edge vertices (${smallerNodeIdentifier}, ${largerNodeIdentifier}) exceed declared graph size ${graphSize} on line ${lineIndex + 2}. Skipping.`);
        return;
    }

    // Calculate the specific term to subtract from the cumulative sum for this edge.
    // This term represents the paths removed by the presence of this edge.
    const subtractionTerm = smallerNodeIdentifier * (graphSize - largerNodeIdentifier + 1);
    cumulativeSum -= subtractionTerm;
});

// Output the final calculated sum to standard output
console.log(cumulativeSum);