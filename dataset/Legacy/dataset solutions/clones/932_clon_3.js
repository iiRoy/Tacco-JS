let memoTable;

/**
 * Parses a string to an integer with radix 10.
 * @param {string} str - The string to parse.
 * @returns {number} The parsed integer.
 */
function parseDecimalInteger(str) {
    return parseInt(str, 10);
}

/**
 * Calculates the scalar multiplication cost for multiplying two matrices.
 * Given dimensions (rowsA x colsA) and (colsA x colsB), the cost is rowsA * colsA * colsB.
 * @param {number} rowsA - The number of rows of the first matrix.
 * @param {number} colsA - The number of columns of the first matrix (must equal rows of the second).
 * @param {number} colsB - The number of columns of the second matrix.
 * @returns {number} The cost of the matrix multiplication.
 */
function computeMatrixProductCost(rowsA, colsA, colsB) {
    return rowsA * colsA * colsB;
}

function ProcessInput(rawDataString) {
    const lines = rawDataString.trim().split("\n");
    const firstLineParts = lines[0].split(" ");
    const matrixCount = parseDecimalInteger(firstLineParts[0]);

    const dimensionsArray = [];
    // Extract the row dimensions for N matrices
    for (let idx = 0; idx < matrixCount; idx++) {
        const currentMatrixRowDim = parseDecimalInteger(lines[idx + 1][0]);
        dimensionsArray.push(currentMatrixRowDim);
    }
    // Extract the column dimension of the last matrix
    const lastMatrixColDim = parseDecimalInteger(lines[matrixCount].split(" ")[1]);
    dimensionsArray.push(lastMatrixColDim);

    // Initialize the memoization table for dynamic programming
    // Each cell stores [minimum_cost, resulting_rows, resulting_cols]
    memoTable = Array.from({ length: matrixCount }, () =>
        Array.from({ length: matrixCount }, () => [-1])
    );

    // Calculate the minimum scalar multiplications for the entire chain
    const finalResult = calculateMinScalarMultiplications(dimensionsArray, 0, matrixCount - 1);
    console.log(finalResult[0]); // Output only the minimum cost
}

function calculateMinScalarMultiplications(dims, leftIndex, rightIndex) {
    // If this subproblem has already been computed, return the stored result
    if (memoTable[leftIndex][rightIndex][0] !== -1) {
        return memoTable[leftIndex][rightIndex];
    }

    // Base Case 1: A single matrix (no multiplications needed, cost is 0)
    if (leftIndex === rightIndex) {
        const matrixRows = dims[leftIndex];
        const matrixCols = dims[leftIndex + 1];
        const singleMatrixResult = [0, matrixRows, matrixCols];
        memoTable[leftIndex][rightIndex] = singleMatrixResult;
        return singleMatrixResult;
    }

    // Base Case 2: Two adjacent matrices (e.g., M_i * M_{i+1})
    // This corresponds to a subproblem of length 2 (rightIndex = leftIndex + 1)
    if (rightIndex === leftIndex + 1) {
        const dimP = dims[leftIndex];      // Rows of the first matrix
        const dimQ = dims[rightIndex];     // Columns of the first, rows of the second
        const dimR = dims[rightIndex + 1]; // Columns of the second matrix
        const directCost = computeMatrixProductCost(dimP, dimQ, dimR);
        const twoMatricesResult = [directCost, dimP, dimR];
        memoTable[leftIndex][rightIndex] = twoMatricesResult;
        return twoMatricesResult;
    }

    let overallMinimumCost = Infinity;

    // Iterate through all possible split points 'k' (splitPoint)
    // The chain (M_leftIndex ... M_rightIndex) is split into
    // (M_leftIndex ... M_splitPoint) and (M_splitPoint+1 ... M_rightIndex)
    for (let splitPoint = leftIndex; splitPoint < rightIndex; splitPoint++) {
        const leftSubproblemSolution = calculateMinScalarMultiplications(dims, leftIndex, splitPoint);
        const rightSubproblemSolution = calculateMinScalarMultiplications(dims, splitPoint + 1, rightIndex);

        // The dimensions of the resulting matrix from the left subproblem are:
        // leftSubproblemSolution[1] (rows) x leftSubproblemSolution[2] (cols)
        // The dimensions of the resulting matrix from the right subproblem are:
        // rightSubproblemSolution[1] (rows) x rightSubproblemSolution[2] (cols)

        // Cost to merge these two resulting matrices:
        // (rows of left result) * (cols of left result) * (cols of right result)
        const mergeCost = computeMatrixProductCost(
            leftSubproblemSolution[1], // Rows of the combined left part (which is dims[leftIndex])
            leftSubproblemSolution[2], // Columns of the combined left part (which is dims[splitPoint + 1])
            rightSubproblemSolution[2] // Columns of the combined right part (which is dims[rightIndex + 1])
        );

        const currentTotalCost = leftSubproblemSolution[0] + rightSubproblemSolution[0] + mergeCost;

        if (currentTotalCost < overallMinimumCost) {
            overallMinimumCost = currentTotalCost;
        }
    }

    // Store the computed result for the current subproblem before returning
    const finalRowsDimension = dims[leftIndex];
    const finalColsDimension = dims[rightIndex + 1];
    const finalSubproblemResult = [overallMinimumCost, finalRowsDimension, finalColsDimension];
    memoTable[leftIndex][rightIndex] = finalSubproblemResult;
    return finalSubproblemResult;
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
