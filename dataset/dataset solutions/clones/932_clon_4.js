function orchestrateComputation(sourceText) {
    const segmentedLines = sourceText.trim().split("\n");
    const topRowElements = segmentedLines[0].split(" ");
    const totalMatrixCount = Number(topRowElements[0]);

    const matrixBoundaryValues = [];
    // The input provides N matrices: M1(R1 x C1), M2(R2 x C2), ..., MN(RN x CN).
    // For matrix chain multiplication, we need a sequence of dimensions P = [P0, P1, ..., PN]
    // where M_i has dimensions P_(i-1) x P_i.
    // Given the input, this sequence becomes [R1, C1, C2, ..., CN].
    // (Assuming C_i = R_(i+1) for valid chain multiplication).

    // Add the first matrix's row dimension (R1 or P0).
    const firstMatrixSpec = segmentedLines[1].split(" ");
    matrixBoundaryValues.push(Number(firstMatrixSpec[0]));

    // Add all matrices' column dimensions (C1, C2, ..., CN or P1, P2, ..., PN).
    for (let currentLineIndex = 1; currentLineIndex <= totalMatrixCount; currentLineIndex++) {
        const currentMatrixSpec = segmentedLines[currentLineIndex].split(" ");
        matrixBoundaryValues.push(Number(currentMatrixSpec[1]));
    }

    // Initialize a 2D array to store the minimum scalar multiplication costs.
    // `operationCounts[i][j]` will store the cost for multiplying matrices from index `i` to `j`.
    const operationCounts = Array.from({ length: totalMatrixCount }, () => Array(totalMatrixCount).fill(0));

    // Iterate over the chain length (number of matrices in the subproblem).
    // A chain of length 1 (single matrix) has 0 cost, which is handled by initialization.
    for (let chainLength = 2; chainLength <= totalMatrixCount; chainLength++) {
        // Iterate over the starting index of the subproblem.
        for (let startIndex = 0; startIndex <= totalMatrixCount - chainLength; startIndex++) {
            const endIndex = startIndex + chainLength - 1; // Calculate the ending index.
            operationCounts[startIndex][endIndex] = Infinity; // Initialize with a very high cost.

            // Iterate over all possible split points within the current subproblem.
            for (let splitPoint = startIndex; splitPoint < endIndex; splitPoint++) {
                // Cost for the left sub-chain (matrices from startIndex to splitPoint).
                const leftSubchainCost = operationCounts[startIndex][splitPoint];
                // Cost for the right sub-chain (matrices from splitPoint + 1 to endIndex).
                const rightSubchainCost = operationCounts[splitPoint + 1][endIndex];
                
                // Cost to multiply the two resulting matrices from the left and right sub-chains.
                // The dimensions are P_startIndex x P_(splitPoint+1) x P_(endIndex+1).
                const mergeCost = 
                    matrixBoundaryValues[startIndex] * 
                    matrixBoundaryValues[splitPoint + 1] * 
                    matrixBoundaryValues[endIndex + 1];

                const currentTotalCost = leftSubchainCost + rightSubchainCost + mergeCost;

                // Update the minimum cost if the current split yields a lower cost.
                if (currentTotalCost < operationCounts[startIndex][endIndex]) {
                    operationCounts[startIndex][endIndex] = currentTotalCost;
                }
            }
        }
    }

    // The result for the entire chain (from matrix 0 to totalMatrixCount - 1).
    console.log(operationCounts[0][totalMatrixCount - 1]);
}

orchestrateComputation(require("fs").readFileSync("/dev/stdin", "utf8"));