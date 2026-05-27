function ProcessInput(rawData) {
    const parsedLines = rawData.trim().split("\n").map(line => line.split(" "));
    const matrixCount = parseInt(parsedLines[0][0], 10);

    const dimensions = [];
    for (let currentIdx = 0; currentIdx < matrixCount; currentIdx++) {
        dimensions.push(parseInt(parsedLines[currentIdx + 1][0], 10));
    }
    dimensions.push(parseInt(parsedLines[matrixCount][1], 10));

    // memoTable[i][j] will store an object representing the optimal solution
    // for multiplying matrices from index i to j.
    // The object contains:
    //   - totalCost: The minimum scalar multiplications needed.
    //   - firstDimension: The row count of the resulting matrix (p_i).
    //   - lastDimension: The column count of the resulting matrix (p_{j+1}).
    const memoTable = Array(matrixCount).fill(null).map(() =>
        Array(matrixCount).fill(null)
    );

    // Initialize memoTable for chains of length 1 (single matrices).
    // The cost is 0, and dimensions are p_i x p_{i+1}.
    for (let currentIdx = 0; currentIdx < matrixCount; currentIdx++) {
        memoTable[currentIdx][currentIdx] = {
            totalCost: 0,
            firstDimension: dimensions[currentIdx],
            lastDimension: dimensions[currentIdx + 1]
        };
    }

    // Fill memoTable for chains of increasing length.
    // chainLength iterates from 2 up to matrixCount.
    for (let chainLength = 2; chainLength <= matrixCount; chainLength++) {
        // startIdx iterates through all possible starting points for a chain of currentLength.
        for (let startIdx = 0; startIdx <= matrixCount - chainLength; startIdx++) {
            const endIdx = startIdx + chainLength - 1;
            let currentMinCost = Infinity;

            // Iterate through all possible split points (k) for the current chain (startIdx to endIdx).
            // The chain is split into (startIdx to splitPoint) and (splitPoint + 1 to endIdx).
            for (let splitPoint = startIdx; splitPoint < endIdx; splitPoint++) {
                const leftSubproblem = memoTable[startIdx][splitPoint];
                const rightSubproblem = memoTable[splitPoint + 1][endIdx];

                // Calculate the cost to merge the two sub-results.
                // This is (rows of left) * (cols of left) * (cols of right).
                // Which corresponds to p_startIdx * p_{splitPoint+1} * p_{endIdx+1}.
                const mergeCost = leftSubproblem.firstDimension * leftSubproblem.lastDimension * rightSubproblem.lastDimension;
                const combinedOperationCost = leftSubproblem.totalCost + rightSubproblem.totalCost + mergeCost;

                if (combinedOperationCost < currentMinCost) {
                    currentMinCost = combinedOperationCost;
                }
            }
            // Store the result for the current chain (startIdx to endIdx).
            memoTable[startIdx][endIdx] = {
                totalCost: currentMinCost,
                firstDimension: dimensions[startIdx],
                lastDimension: dimensions[endIdx + 1]
            };
        }
    }

    // The final answer is the totalCost for the chain from index 0 to matrixCount - 1.
    console.log(memoTable[0][matrixCount - 1].totalCost);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
