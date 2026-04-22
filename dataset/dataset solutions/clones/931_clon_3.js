const fileSystem = require('fs');

// Define a constant for representing an unreachable or infinitely high cost in computations.
const POSITIVE_INFINITY_COST = Number.POSITIVE_INFINITY;

/**
 * Reads raw input from standard input, decodes it, trims whitespace,
 * and splits it into an array of lines.
 * @returns {string[]} An array where each element is a line from the input.
 */
function acquireAndSegmentInputData() {
    try {
        // Read the entire content from the standard input as a UTF-8 string.
        const rawInputContentBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');
        // Trim any leading/trailing whitespace and then split into an array of lines.
        return rawInputContentBuffer.trim().split('\n');
    } catch (error) {
        // Log an error if reading from stdin fails, and return an empty array.
        // In a production environment, more robust error handling might be implemented.
        console.error("Error reading from standard input:", error);
        return []; 
    }
}

/**
 * Solves the Matrix Chain Multiplication problem to find the minimum number of
 * scalar multiplications needed to multiply a sequence of matrices.
 * This function encapsulates the main logic of the program.
 */
function orchestrateMatrixChainMultiplication() {
    // Obtain all lines of input data from the standard input.
    const inputDataRows = acquireAndSegmentInputData();

    // Perform initial validation: if no input lines are present, there's no cost.
    if (inputDataRows.length === 0) {
        console.log(0);
        return;
    }

    // The first line of input provides the total number of matrices (N).
    // Safely parse this value as an integer.
    const totalMatrixCount = parseInt(inputDataRows.shift(), 10);

    // Further validation for the total number of matrices.
    // If it's not a valid number or less than or equal to zero, the cost is zero.
    if (isNaN(totalMatrixCount) || totalMatrixCount <= 0) {
        console.log(0);
        return;
    }
    
    // A single matrix requires zero multiplications.
    if (totalMatrixCount === 1) {
        console.log(0);
        return;
    }

    // `matrixDimensionsArray` will store the dimensions p_0, p_1, ..., p_N.
    // For a chain of N matrices (A_1, ..., A_N), matrix A_i has dimensions p_{i-1} x p_i.
    // The original problem's 'r' array was 1-indexed, storing p_0 at r[1], p_1 at r[2], etc.
    // We'll replicate this 1-based indexing for `matrixDimensionsArray` for direct formula translation.
    // It will contain `totalMatrixCount + 2` elements, where indices 1 to `totalMatrixCount + 1` are used.
    const matrixDimensionsArray = new Array(totalMatrixCount + 2);

    // Iterate through the input lines to populate the `matrixDimensionsArray`.
    // Each line provides the row and column dimensions for a specific matrix.
    for (let currentMatrixSequenceIndex = 1; currentMatrixSequenceIndex <= totalMatrixCount; currentMatrixSequenceIndex++) {
        const dimensionStringPair = inputDataRows.shift().split(' ');
        // Convert string dimensions to numbers.
        const currentMatrixRows = Number(dimensionStringPair[0]);
        const currentMatrixCols = Number(dimensionStringPair[1]);

        // Store the row dimension (p_{i-1}) at `matrixDimensionsArray[i]`.
        matrixDimensionsArray[currentMatrixSequenceIndex] = currentMatrixRows;
        // Store the column dimension (p_i) at `matrixDimensionsArray[i+1]`.
        // This implicitly forms the sequence p_0, p_1, ..., p_N.
        // For example, matrix A_1 is `p_0 x p_1`, A_2 is `p_1 x p_2`, etc.
        // `matrixDimensionsArray[currentMatrixSequenceIndex + 1]` will be overwritten by the next matrix's row dimension if they are the same (as expected in valid input).
        matrixDimensionsArray[currentMatrixSequenceIndex + 1] = currentMatrixCols;
    }

    // `optimalScalarOperations` is a 2D array (matrix) that will store the minimum
    // number of scalar multiplications required to multiply the matrix chain
    // from index `i` to `j`. It is 1-indexed for convenience.
    const optimalScalarOperations = Array.from({ length: totalMatrixCount + 1 }, () => 
        Array.from({ length: totalMatrixCount + 1 }, () => POSITIVE_INFINITY_COST)
    );

    // Initialize the diagonal elements: multiplying a single matrix (chain of length 1)
    // requires zero scalar multiplications.
    for (let singleMatrixIndex = 1; singleMatrixIndex <= totalMatrixCount; singleMatrixIndex++) {
        optimalScalarOperations[singleMatrixIndex][singleMatrixIndex] = 0;
    }

    // This is the core dynamic programming algorithm for Matrix Chain Multiplication.
    // `currentChainLength` represents the length of the matrix subchain being considered (e.g., 2 for A_i * A_{i+1}).
    // It ranges from 1 (for a chain of two matrices) up to `totalMatrixCount - 1` (for the entire chain).
    for (let currentChainLength = 1; currentChainLength < totalMatrixCount; currentChainLength++) {
        // `subchainStartIndex` is the starting index of the current matrix subchain.
        // It iterates from 1 up to `totalMatrixCount - currentChainLength`.
        for (let subchainStartIndex = 1; subchainStartIndex <= totalMatrixCount - currentChainLength; subchainStartIndex++) {
            // `subchainEndIndex` is the calculated ending index of the current subchain.
            const subchainEndIndex = subchainStartIndex + currentChainLength;

            // `splitPointCandidate` iterates through all possible points `k` to split the subchain
            // (from `subchainStartIndex` to `subchainEndIndex`).
            // The split occurs between matrix A_{k-1} and A_k, effectively forming two subproblems:
            // (A_{subchainStartIndex} ... A_{splitPointCandidate-1}) and (A_{splitPointCandidate} ... A_{subchainEndIndex}).
            for (let splitPointCandidate = subchainStartIndex + 1; splitPointCandidate <= subchainEndIndex; splitPointCandidate++) {
                // Calculate the cost for this particular split.
                // This involves three components:
                // 1. The minimum cost to multiply the left subchain.
                const costOfLeftSubproblem = optimalScalarOperations[subchainStartIndex][splitPointCandidate - 1];
                // 2. The minimum cost to multiply the right subchain.
                const costOfRightSubproblem = optimalScalarOperations[splitPointCandidate][subchainEndIndex];
                // 3. The cost of multiplying the two resulting matrices from the left and right subproblems.
                //    If the left result is P x Q and the right result is Q x R, the cost is P * Q * R.
                //    In our dimension array, P = matrixDimensionsArray[subchainStartIndex],
                //    Q = matrixDimensionsArray[splitPointCandidate],
                //    R = matrixDimensionsArray[subchainEndIndex + 1].
                const costOfFinalPairMultiplication = matrixDimensionsArray[subchainStartIndex] * 
                                                     matrixDimensionsArray[splitPointCandidate] * 
                                                     matrixDimensionsArray[subchainEndIndex + 1];
                
                // Sum up all components to get the total cost for this split.
                const totalCandidateCost = costOfLeftSubproblem + costOfRightSubproblem + costOfFinalPairMultiplication;

                // If this `totalCandidateCost` is less than the currently recorded minimum cost
                // for the subchain (from `subchainStartIndex` to `subchainEndIndex`), update it.
                if (totalCandidateCost < optimalScalarOperations[subchainStartIndex][subchainEndIndex]) {
                    optimalScalarOperations[subchainStartIndex][subchainEndIndex] = totalCandidateCost;
                }
            }
        }
    }

    // The final result is the minimum cost to multiply the entire chain of matrices
    // from index 1 to `totalMatrixCount`.
    console.log(optimalScalarOperations[1][totalMatrixCount]);
}

// Initiate the matrix chain multiplication process.
orchestrateMatrixChainMultiplication();