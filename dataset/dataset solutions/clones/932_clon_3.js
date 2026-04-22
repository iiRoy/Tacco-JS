function ProcessMatrixChainInput(rawInputData) {
    // Extensive Type II and Type III changes begin here.

    // 1. Input parsing and validation (Type III: guard clauses, updated parsing)
    if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.trim() === '') {
        console.error("Error: Input data is empty or invalid.");
        return; // Early exit for invalid input
    }

    // Convert raw string input into structured data.
    // Using split and map, but with more explicit steps.
    const lines = rawInputData.trim().split("\n");

    if (lines.length === 0) {
        console.error("Error: No lines found in input data.");
        return;
    }

    // Parse the total number of matrices (N)
    // Type II: Renamed identifier 'n' to 'numMatrices'
    const numMatrices = parseInt(lines[0].split(" ")[0], 10);

    if (isNaN(numMatrices) || numMatrices <= 0) {
        console.error("Error: Invalid number of matrices specified (must be a positive integer).");
        return;
    }

    // 2. Prepare the dimension array (p-array) for matrix chain multiplication.
    // This array will hold p_0, p_1, ..., p_N where matrix_i has dimensions p_i x p_{i+1}.
    // Type II: Renamed 'v_rc' to 'matrixDimensionsArray'
    // Type III: Changed array population method to use map for initial rows, then push for the last column.
    const matrixDimensionsArray = lines.slice(1, numMatrices + 1).map(line => {
        const parts = line.split(" ");
        // For the i-th matrix (0-indexed), its dimensions are r_i x c_i.
        // The p-array stores [r_0, r_1, ..., r_{N-1}, c_{N-1}].
        // This implicitly assumes c_i = r_{i+1} for i=0 to N-2.
        return parseInt(parts[0], 10); // Extracting r_i
    });

    // The last element of the p-array is the column dimension of the last matrix, c_{N-1}.
    // Original: v_rc.push(parseInt(input[n][1], 10))
    // This means input[n] is the (n+1)-th line (0-indexed).
    // So lines[numMatrices] is the line containing the last matrix's dimensions.
    const lastMatrixLine = lines[numMatrices];
    if (!lastMatrixLine) {
        console.error("Error: Missing dimensions for the last matrix (line N+1).");
        return;
    }
    const lastColDimension = parseInt(lastMatrixLine.split(" ")[1], 10); // Extracting c_{N-1}
    if (isNaN(lastColDimension)) {
        console.error("Error: Invalid last column dimension (non-numeric).");
        return;
    }
    matrixDimensionsArray.push(lastColDimension);

    // Basic validation for the dimensions array (Type III: added validation)
    if (matrixDimensionsArray.length !== numMatrices + 1) {
        console.error(`Dimension array length mismatch. Expected ${numMatrices + 1} elements, got ${matrixDimensionsArray.length}.`);
        return;
    }
    if (matrixDimensionsArray.some(dim => isNaN(dim) || dim <= 0)) {
        console.error("Error: One or more matrix dimensions are invalid (non-numeric or non-positive).");
        return;
    }

    // 3. Initialize memoization table (DP table).
    // Type II: Renamed 'dp' to 'memoTableForCosts'
    // Type III: Using Array.from for initialization, and storing objects instead of arrays for clarity.
    // Each entry will store { cost: number, rowDim: number, colDim: number }
    // Initializing with null to signify 'not computed'.
    const memoTableForCosts = Array.from({ length: numMatrices }, () =>
        Array.from({ length: numMatrices }, () => null)
    );

    // 4. Invoke the recursive DP solver and output the result.
    // Type II: Renamed 'kukanDP' to 'solveMatrixChainMultiplication'
    // Type III: Accessing the 'cost' property from the returned object.
    const finalResult = solveMatrixChainMultiplication(matrixDimensionsArray, 0, numMatrices - 1, memoTableForCosts);

    // Ensure a valid result was returned before printing (Type III: added check)
    if (finalResult && typeof finalResult.cost === 'number' && finalResult.cost !== Infinity) {
        console.log(finalResult.cost);
    } else {
        console.error("Calculation did not return a valid cost or encountered an error.");
    }
}

// Type II: Renamed function and parameters
// Type III: Return type changed from array to object for better readability.
//           Removed a redundant base case.
function solveMatrixChainMultiplication(dimensionsArr, startMatrixIndex, endMatrixIndex, memoizationCache) {
    // Type II: Renamed 'w' to 'dimensionsArr', 'l' to 'startMatrixIndex', 'r' to 'endMatrixIndex', 'dp' to 'memoizationCache'

    // Type III: Added input validation for indices.
    // Ensure the indices are within the valid range for matrices (0 to N-1).
    if (startMatrixIndex < 0 || endMatrixIndex >= dimensionsArr.length - 1 || startMatrixIndex > endMatrixIndex) {
        console.warn(`Warning: Invalid matrix index range encountered: [${startMatrixIndex}, ${endMatrixIndex}].`);
        // Return a sentinel object indicating an invalid state or infinite cost.
        return { cost: Infinity, rowDim: -1, colDim: -1 };
    }

    // Type III: Check if the result for this subproblem has already been computed. Using null as sentinel.
    const cachedResult = memoizationCache[startMatrixIndex][endMatrixIndex];
    if (cachedResult !== null) {
        return cachedResult;
    }

    // Base Case 1: A single matrix chain (e.g., M_i). No multiplication needed, so cost is 0.
    // The resulting matrix has dimensions p_i x p_{i+1}.
    // Type II: Renamed identifiers.
    if (startMatrixIndex === endMatrixIndex) {
        const singleMatrixCost = 0;
        const rowDimension = dimensionsArr[startMatrixIndex];
        const colDimension = dimensionsArr[startMatrixIndex + 1];
        // Type III: Storing an object instead of an array for structured data.
        return memoizationCache[startMatrixIndex][endMatrixIndex] = {
            cost: singleMatrixCost,
            rowDim: rowDimension,
            colDim: colDimension
        };
    }

    // Type III: The original code had a specific base case for `Math.abs(l - r) === 1`.
    // This case, representing two matrices (e.g., M_i * M_{i+1}), is correctly handled
    // by the general loop below. Removing it simplifies the code without altering functionality.

    // Recursive step: Find the optimal split point to minimize operations.
    // Type II: Renamed 'res' to 'minimumOperations', 'tmp' to 'currentSplitCost', 'mid' to 'splitPoint'
    let minimumOperations = Infinity;
    // The final resulting matrix from multiplying M_start to M_end will have dimensions
    // p_startMatrixIndex x p_{endMatrixIndex + 1}.
    const finalChainRowDimension = dimensionsArr[startMatrixIndex];
    const finalChainColDimension = dimensionsArr[endMatrixIndex + 1];

    // Iterate through all possible split points 'k' (where k = splitPoint).
    // The chain M_start...M_end is split into (M_start...M_k) and (M_{k+1}...M_end).
    for (let splitPoint = startMatrixIndex; splitPoint < endMatrixIndex; splitPoint++) {
        // Recursively solve for the left and right subproblems.
        // Type II: Renamed 'tmpL' to 'leftSubproblemResult', 'tmpR' to 'rightSubproblemResult'
        const leftSubproblemResult = solveMatrixChainMultiplication(
            dimensionsArr,
            startMatrixIndex,
            splitPoint,
            memoizationCache
        );
        const rightSubproblemResult = solveMatrixChainMultiplication(
            dimensionsArr,
            splitPoint + 1,
            endMatrixIndex,
            memoizationCache
        );

        // Type III: Added more descriptive variable names for dimensions involved in the multiplication cost.
        // Left subproblem result dimensions: (p_startMatrixIndex) x (p_{splitPoint + 1})
        // Right subproblem result dimensions: (p_{splitPoint + 1}) x (p_{endMatrixIndex + 1})
        const leftMatrixRowDim = leftSubproblemResult.rowDim;     // Corresponds to p_startMatrixIndex
        const leftMatrixColDim = leftSubproblemResult.colDim;     // Corresponds to p_{splitPoint + 1}
        const rightMatrixColDim = rightSubproblemResult.colDim;   // Corresponds to p_{endMatrixIndex + 1}

        // Calculate the total cost for this specific split point.
        // This is the sum of costs for subproblems plus the cost of multiplying their results.
        // Type II: Renamed 'tmp' to 'currentSplitCost'
        const currentSplitCost = leftSubproblemResult.cost +
                                 rightSubproblemResult.cost +
                                 (leftMatrixRowDim * leftMatrixColDim * rightMatrixColDim);

        // Update the minimum operations if this split yields a better (lower) cost.
        if (currentSplitCost < minimumOperations) {
            minimumOperations = currentSplitCost;
        }
    }

    // Store the computed result in the memoization cache and return it.
    // Type III: Storing an object with structured properties.
    return memoizationCache[startMatrixIndex][endMatrixIndex] = {
        cost: minimumOperations,
        rowDim: finalChainRowDimension,
        colDim: finalChainColDimension
    };
}

// Execute the main processing function with input from stdin.
// Type III: Added a try-catch block for more robust input reading and error handling.
try {
    ProcessMatrixChainInput(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (error) {
    console.error("Failed to read input from stdin or process it:", error.message);
}