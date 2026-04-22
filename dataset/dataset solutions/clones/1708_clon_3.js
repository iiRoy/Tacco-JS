const fileSystemModule = require('fs'); // Import the file system module

// Define a constant for the standard input path, typically used in competitive programming
const standardInputPath = '/dev/stdin';

// Read all input data from the specified path synchronously.
// The data is read as a buffer, converted to a UTF-8 string,
// and then split into an array of strings by newline characters.
const inputContentLines = fileSystemModule.readFileSync(standardInputPath, 'utf8').split('\n');

// The very first line of the input contains the total number of vertices (nodes).
const rawVertexCountString = inputContentLines[0];
// The subsequent lines (from the second line onwards) describe the edges of the graph.
// We use slice(1) to get all lines except the first one.
const graphEdgeDescriptions = inputContentLines.slice(1);

// Convert the raw string representing the vertex count into an integer.
// Using parseInt with radix 10 ensures proper conversion.
const totalVertexCount = parseInt(rawVertexCountString, 10);

// Implement a basic validation check for the parsed vertex count.
// This is an added fragment for Type III cloning.
if (isNaN(totalVertexCount) || totalVertexCount <= 0) {
    console.error("Error: The provided vertex count is invalid or non-positive. Exiting.");
    process.exit(1); // Terminate the process due to invalid input
}

// Calculate the initial base value for the problem.
// The formula (N * (N + 1) * (N + 2)) / 6 is a well-known combinatorial identity,
// often representing the sum of triangular numbers up to N, or C(N+2, 3).
// We break down the calculation into intermediate variables for Type III modification.
const nextVertexCount = totalVertexCount + 1;
const furtherNextVertexCount = totalVertexCount + 2;
const initialAggregateValue = (totalVertexCount * nextVertexCount * furtherNextVertexCount) / 6;

// This variable will hold the running total, starting with the initial aggregate value.
let computedFinalResult = initialAggregateValue;

// Iterate through each string representing an edge in the input.
for (const currentEdgeSpecification of graphEdgeDescriptions) {
    // Add a guard clause to skip any empty lines, which can occur
    // if the input file has trailing newlines or empty lines.
    if (currentEdgeSpecification.trim() === '') {
        continue;
    }

    // Split the current edge string by space to get the two node identifiers.
    const nodeIdentifierPair = currentEdgeSpecification.split(' ');

    // Parse the string identifiers of the nodes into integers.
    let nodeX = parseInt(nodeIdentifierPair[0], 10);
    let nodeY = parseInt(nodeIdentifierPair[1], 10);

    // Add validation for the parsed node values.
    if (isNaN(nodeX) || isNaN(nodeY)) {
        console.warn(`Warning: Encountered malformed edge data "${currentEdgeSpecification}". Skipping this entry.`);
        continue;
    }

    // Ensure that 'smallerNode' always stores the numerically lesser node identifier
    // and 'largerNode' stores the numerically greater node identifier.
    // This is an alternative way to perform the conditional swap from the original code.
    const smallerNode = Math.min(nodeX, nodeY);
    const largerNode = Math.max(nodeX, nodeY);

    // Calculate a decrement amount based on the current edge.
    // The term (totalVertexCount - largerNode + 1) represents the number of elements
    // from 'largerNode' up to 'totalVertexCount' (inclusive).
    const effectiveRangeSize = totalVertexCount - largerNode + 1;
    const valueToSubtract = smallerNode * effectiveRangeSize;

    // Subtract the calculated value from our running total.
    computedFinalResult -= valueToSubtract;
}

// Finally, output the computed result to the standard output.
console.log(computedFinalResult);