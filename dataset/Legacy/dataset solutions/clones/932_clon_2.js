function ProcessInput(rawInputData) {
    // Process the raw input string: trim, split by newline, then split each line by space.
    rawInputData = rawInputData.trim().split("\n").map(function(lineStr) {
        return lineStr.split(" ");
    });

    // Extract the number of matrices from the first line.
    var matrixCount = parseInt(rawInputData[0][0], 10);

    // Initialize an array to store the dimensions (p_0, p_1, ..., p_n).
    var dimensionsArray = [];
    // Populate the dimensions array with the 'rows' part of each matrix.
    for (var idx = 0; idx < matrixCount; idx++) {
        dimensionsArray.push(parseInt(rawInputData[idx + 1][0], 10));
    }
    // Add the 'columns' part of the last matrix.
    dimensionsArray.push(parseInt(rawInputData[matrixCount][1], 10));

    // Initialize a 3D memoization table for dynamic programming.
    // Each cell will store [min_cost, p_i, p_j+1] for the subproblem (i, j).
    memoizationTable = [];
    for (var rowIdx = 0; rowIdx < matrixCount; rowIdx++) {
        memoizationTable.push([]);
        for (var colIdx = 0; colIdx < matrixCount; colIdx++) {
            memoizationTable[rowIdx].push([-1]); // -1 indicates not yet computed.
        }
    }

    // Call the recursive DP function and print the minimum cost (first element of the result).
    console.log(calculateMinCost(dimensionsArray, 0, matrixCount - 1)[0]);
}

// Recursive function to calculate the minimum scalar multiplications for a subchain.
function calculateMinCost(dimArr, leftBound, rightBound) {
    // Check if the result for this subproblem is already memoized.
    if (memoizationTable[leftBound][rightBound][0] !== -1) {
        return memoizationTable[leftBound][rightBound];
    }

    // Base case: If the subchain contains only one matrix (l == r).
    // The cost is 0, and its dimensions are dimArr[l] x dimArr[l+1].
    if (leftBound === rightBound) {
        return memoizationTable[leftBound][rightBound] = [0, dimArr[leftBound], dimArr[leftBound + 1]];
    }

    // Base case: If the subchain contains two matrices (abs(l - r) == 1).
    // Cost is p_l * p_r * p_r+1. Dimensions are p_min(l,r) x p_max(l,r)+1.
    if (Math.abs(leftBound - rightBound) === 1) {
        return memoizationTable[leftBound][rightBound] = [
            dimArr[leftBound] * dimArr[rightBound] * dimArr[Math.max(leftBound, rightBound) + 1],
            dimArr[Math.min(leftBound, rightBound)],
            dimArr[Math.max(leftBound, rightBound) + 1]
        ].slice(); // .slice() creates a new array copy.
    }

    let minOperations = Infinity; // Initialize minimum operations to a very large value.
    let currentCost;
    let leftSubproblemResult, rightSubproblemResult;

    // Iterate through all possible split points for the current subchain.
    for (let splitPoint = leftBound; splitPoint <= rightBound - 1; splitPoint++) {
        // Recursively solve for the left and right subproblems.
        leftSubproblemResult = calculateMinCost(dimArr, leftBound, splitPoint);
        rightSubproblemResult = calculateMinCost(dimArr, splitPoint + 1, rightBound);

        // Calculate the cost for this specific split:
        // cost_left + cost_right + (rows_left * cols_left * cols_right)
        currentCost = leftSubproblemResult[0] + rightSubproblemResult[0] +
                      leftSubproblemResult[1] * leftSubproblemResult[2] * rightSubproblemResult[2];

        // Update the minimum operations if the current split yields a lower cost.
        if (currentCost < minOperations) {
            minOperations = currentCost;
        }
    }

    // Memoize and return the result for the current subproblem.
    // The result includes the minimum cost, and the dimensions of the resulting matrix (p_l x p_r+1).
    return memoizationTable[leftBound][rightBound] = [minOperations, dimArr[leftBound], dimArr[rightBound + 1]];
}

// Global variable for memoization table.
var memoizationTable;

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
