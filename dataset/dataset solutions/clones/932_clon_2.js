let cacheMatrix = [];

/**
 * This function serves as the primary entry point for processing the input data.
 * It parses the dimensions, initializes the dynamic programming table,
 * and then calls the recursive solver to compute the minimum multiplication cost.
 * @param {string} receivedText - The raw string data received from standard input.
 */
function ProcessInput(receivedText) {
    // First, clean and structure the input string into a 2D array.
    const structuredDataLines = receivedText.trim().split("\n").map(lineSegment => lineSegment.split(" "));

    // Extract the total count of elements (matrices) from the initial input line.
    const numObjects = parseInt(structuredDataLines[0][0], 10);

    // Populate an array with the dimension values (p_i in matrix chain multiplication).
    let dimensionValues = [];
    for (let outerIndex = 0; outerIndex < numObjects; outerIndex++) {
        dimensionValues.push(parseInt(structuredDataLines[outerIndex + 1][0], 10));
    }
    // The final dimension value is typically found in a different input field.
    dimensionValues.push(parseInt(structuredDataLines[numObjects][1], 10));

    // Initialize the memoization table (`cacheMatrix`) for dynamic programming.
    // Each cell will store the [computed_cost, first_dimension, last_dimension] for a subproblem.
    for (let outerIndex = 0; outerIndex < numObjects; outerIndex++) {
        cacheMatrix.push([]);
        for (let innerIndex = 0; innerIndex < numObjects; innerIndex++) {
            cacheMatrix[outerIndex].push([null]); // 'null' indicates an uncomputed state.
        }
    }

    // Execute the core dynamic programming algorithm for the entire chain of objects.
    // The first element of the returned array contains the overall minimum cost.
    console.log(calculateSegmentCost(dimensionValues, 0, numObjects - 1)[0]);
}

/**
 * Recursively computes the minimum cost to multiply a chain of matrices within a given segment.
 * This function employs memoization to avoid redundant calculations, characteristic of dynamic programming.
 * @param {number[]} costFactors - The array of dimensions (p_0, p_1, ..., p_n).
 * @param {number} startIdx - The starting index (inclusive) of the current matrix segment.
 * @param {number} endIdx - The ending index (inclusive) of the current matrix segment.
 * @returns {Array<number>} An array: [minimum_cost_for_segment, first_matrix_dim, last_matrix_dim].
 */
function calculateSegmentCost(costFactors, startIdx, endIdx) {
    // Check if the solution for this specific segment has already been computed and cached.
    if (cacheMatrix[startIdx][endIdx][0] !== null) {
        return cacheMatrix[startIdx][endIdx];
    }

    // Base Case 1: If the segment consists of a single matrix (length 1).
    // The cost of multiplying a single matrix is zero.
    // Its effective dimensions are p_i and p_{i+1}.
    if (startIdx === endIdx) {
        return cacheMatrix[startIdx][endIdx] = [0, costFactors[startIdx], costFactors[startIdx + 1]];
    }

    // Base Case 2: If the segment consists of two adjacent matrices (length 2).
    // The cost is p_i * p_{i+1} * p_{i+2}.
    // Its effective dimensions are p_i and p_{i+2}.
    if (Math.abs(startIdx - endIdx) === 1) {
        const firstDim = costFactors[Math.min(startIdx, endIdx)];
        const middleDim = costFactors[Math.max(startIdx, endIdx)];
        const lastDim = costFactors[Math.max(startIdx, endIdx) + 1];
        return cacheMatrix[startIdx][endIdx] = [firstDim * middleDim * lastDim, firstDim, lastDim].slice();
    }

    // Recursive Step: Iterate through all possible split points for the current segment.
    let minimumOverallCost = Infinity;
    let currentSplitCost, leftSegmentResult, rightSegmentResult;

    for (let partitionIndex = startIdx; partitionIndex <= endIdx - 1; partitionIndex++) {
        // Recursively find the optimal costs for the left and right sub-segments.
        leftSegmentResult = calculateSegmentCost(costFactors, startIdx, partitionIndex);
        rightSegmentResult = calculateSegmentCost(costFactors, partitionIndex + 1, endIdx);

        // Calculate the total cost for this particular split:
        // (cost of left part) + (cost of right part) + (cost to combine the two results).
        currentSplitCost = leftSegmentResult[0] + rightSegmentResult[0] + leftSegmentResult[1] * leftSegmentResult[2] * rightSegmentResult[2];

        // Update the minimum cost found so far if the current split is better.
        if (currentSplitCost < minimumOverallCost) {
            minimumOverallCost = currentSplitCost;
        }
    }

    // Cache the computed optimal value for the current segment and return it.
    return cacheMatrix[startIdx][endIdx] = [minimumOverallCost, costFactors[startIdx], costFactors[endIdx + 1]];
}

// Read input from the standard input stream and begin processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));