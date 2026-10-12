'use strict';

console.log((function(inputContent) {
    // This helper function is responsible for parsing a single line of string input
    // into an array of integers. It handles trimming whitespace and converting
    // string representations of numbers to actual integer values.
    const processLineIntoNumbers = (lineStringSegment) => {
        // Ensure the line segment is not null, undefined, or just whitespace.
        // If it's effectively empty, return an empty array to avoid errors.
        if (!lineStringSegment || lineStringSegment.trim() === '') {
            return [];
        }
        // Trim whitespace from the line, split it by spaces, and then
        // map each resulting string token to its integer equivalent using parseInt.
        // Using radix 10 is crucial for consistent decimal parsing.
        return lineStringSegment.trim().split(' ').map(numericString => {
            const integerValue = parseInt(numericString, 10);
            // In a robust system, one might add error handling for NaN here.
            // For competitive programming, valid integer input is typically guaranteed.
            return integerValue;
        });
    };

    // --- Input Data Acquisition and Initial Processing ---

    // First, remove any leading or trailing whitespace from the entire input block.
    // Then, split the cleaned input string into an array of individual lines.
    const allInputLines = inputContent.trim().split('\n');

    // The first line of input typically contains global parameters for the problem.
    // Here, it's expected to provide the total number of nodes (N) and edges (M).
    const problemParameters = processLineIntoNumbers(allInputLines[0]);
    const totalNodeCount = problemParameters[0]; // Corresponds to 'N' in the original problem
    const totalEdgeCount = problemParameters[1]; // Corresponds to 'M' in the original problem

    // Initialize two arrays to store the details of each directed edge.
    // 'edgeSourceNodes[k]' will hold the starting node identifier for the k-th edge.
    // 'edgeTargetNodes[k]' will hold the ending node identifier for the k-th edge.
    const edgeSourceNodes = [];
    const edgeTargetNodes = [];

    // Iterate through the remaining input lines (starting from the second line)
    // to extract and store the information for each edge.
    // The loop runs 'totalEdgeCount' times, processing one edge per iteration.
    for (let currentEdgeIndex = 0; currentEdgeIndex < totalEdgeCount; currentEdgeIndex++) {
        // The edge data is found on line '1 + currentEdgeIndex' (since line 0 was for parameters).
        const currentEdgeDefinition = processLineIntoNumbers(allInputLines[1 + currentEdgeIndex]);
        // Add the source node (first number) and target node (second number) to their respective lists.
        edgeSourceNodes.push(currentEdgeDefinition[0]);
        edgeTargetNodes.push(currentEdgeDefinition[1]);
    }

    // --- Dynamic Programming Table Initialization ---

    // Create a 2D array, 'maximumPathLengths', to serve as our dynamic programming table.
    // Its dimensions will be (totalEdgeCount + 1) rows by (totalNodeCount + 1) columns.
    // Each cell 'maximumPathLengths[i][j]' will store the maximum path length
    // that ends at node 'j' after considering 'i' steps or edges.
    // We initialize all cells to 0, indicating no path found yet or a path of length zero.
    const maximumPathLengths = Array(totalEdgeCount + 1)
        .fill(null) // Fill with null first to ensure each map call creates a distinct array
        .map(() => Array(totalNodeCount + 1).fill(0));

    // --- Dynamic Programming Calculation ---

    // The outer loop represents the "steps" or "iterations" of our DP process.
    // 'currentStep' effectively means considering paths that could potentially
    // involve up to 'currentStep' edges. It starts from 1 because we're building paths.
    for (let currentStep = 1; currentStep <= totalEdgeCount; currentStep++) {
        // The inner loop iterates through each individual edge defined in our input.
        // For each step, we re-evaluate all available edges to update our path lengths.
        for (let edgePointer = 0; edgePointer < totalEdgeCount; edgePointer++) {
            // Retrieve the source and target nodes for the current edge being processed.
            const fromNode = edgeSourceNodes[edgePointer];
            const toNode = edgeTargetNodes[edgePointer];

            // Calculate a potential new path length. This is done by taking the
            // maximum path length ending at the 'fromNode' at the *previous* step ('currentStep - 1'),
            // and extending it by one (to account for the current edge from 'fromNode' to 'toNode').
            const prospectivePathLength = maximumPathLengths[currentStep - 1][fromNode] + 1;

            // Update the DP table: For the 'toNode' at the 'currentStep',
            // we store the maximum of its existing value and the 'prospectivePathLength'.
            // This ensures we always keep track of the longest path discovered so far
            // that ends at 'toNode' after 'currentStep' operations.
            maximumPathLengths[currentStep][toNode] = Math.max(
                maximumPathLengths[currentStep][toNode],
                prospectivePathLength
            );
        }
    }

    // --- Final Result Extraction ---

    // After completing all dynamic programming steps, the final result is found
    // by looking at the last row of our DP table ('maximumPathLengths[totalEdgeCount]').
    // This row contains the maximum path lengths ending at each respective node,
    // having considered all possible 'totalEdgeCount' steps.
    // We need to find the overall maximum value within this final row.
    const resultsAtFinalStep = maximumPathLengths[totalEdgeCount];
    const overallMaximumLengthFound = Math.max(...resultsAtFinalStep);

    // The problem requires the output to be a string.
    return overallMaximumLengthFound.toString();

})(require('fs').readFileSync('/dev/stdin', 'utf8')));