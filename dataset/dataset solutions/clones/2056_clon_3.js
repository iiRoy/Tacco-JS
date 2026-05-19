function ProcessInput(rawDataString) {
    // Helper to parse initial dimensions and threshold
    function parseDimensionsAndThreshold(line) {
        const parts = line.split(" ").map(Number);
        return {
            numRows: parts[0],
            numCols: parts[1],
            maxSumThreshold: parts[2]
        };
    }

    // Helper for vector operations, encapsulating the original VO logic
    function performVectorOperation(vecA, vecB, operationType) {
        let resultVector = [];
        let effectiveVecB = vecB;

        // This conditional block is technically never hit by the main logic's usage
        // because all prefix sum arrays have the same length.
        // However, if it were hit, the original code's `v2 = Array.from(...)` would
        // create an array of single-element arrays, leading to NaN.
        // For strict behavioral equivalence, we assume this branch is unreachable
        // given the actual call patterns in the original code.
        if (vecA.length !== vecB.length) {
            if (vecB.length === 1) {
                // If vecB is a single-element array, broadcast its value.
                // This is a more robust interpretation than the original's potential bug.
                effectiveVecB = Array.from({ length: vecA.length }, () => vecB[0]);
            } else {
                return null; // Indicates an unhandled vector length mismatch
            }
        }

        for (let i = 0; i < vecA.length; i++) {
            switch (operationType) {
                case '+':
                    resultVector.push(vecA[i] + effectiveVecB[i]);
                    break;
                case '-':
                    resultVector.push(vecA[i] - effectiveVecB[i]);
                    break;
                case '*':
                    resultVector.push(vecA[i] * effectiveVecB[i]);
                    break;
                case '/':
                    resultVector.push(vecA[i] / effectiveVecB[i]);
                    break;
                case '%':
                    resultVector.push(vecA[i] % effectiveVecB[i]);
                    break;
                case '||': // Custom operation for Math.max
                    resultVector.push(Math.max(vecA[i], effectiveVecB[i]));
                    break;
                default:
                    // No other operations are expected based on original code
                    break;
            }
        }
        return resultVector;
    }

    // Helper to calculate prefix sums for a single row of values
    function calculateRowPrefixSums(rowValues) {
        const rowPrefixSums = [0];
        let currentAccumulatedSum = 0;
        for (const value of rowValues) {
            currentAccumulatedSum += value;
            rowPrefixSums.push(currentAccumulatedSum);
        }
        return rowPrefixSums;
    }

    const rawLines = rawDataString.trim().split("\n");
    const { numRows, numCols, maxSumThreshold } = parseDimensionsAndThreshold(rawLines[0]);

    const gridValues = []; // Stores the original grid values
    const prefixSumsGrid = []; // Stores prefix sums for each row

    // Populate gridValues and prefixSumsGrid
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        const rowData = rawLines[rowIndex + 1].split("").map(Number);
        gridValues.push(rowData);
        prefixSumsGrid.push(calculateRowPrefixSums(rowData));
    }

    const numHorizontalCutOptions = numRows - 1; // Number of possible horizontal cut positions
    let minTotalCuts = (numRows - 1) + (numCols - 1); // Initialize with max possible cuts

    // Iterate through all possible horizontal cut patterns using bit manipulation
    horizontalPatternIteration:
    for (let cutPatternIndex = 0; cutPatternIndex < Math.pow(2, numHorizontalCutOptions); cutPatternIndex++) {
        let currentPartitionPrefixSums;
        let horizontalCutCount = 0;

        if (numHorizontalCutOptions === 0) { // Special case: only one row (H=1), no horizontal cuts
            currentPartitionPrefixSums = [prefixSumsGrid[0].slice()];
        } else {
            // Convert the cut pattern index to a binary string, padded with leading zeros
            const binaryCutPattern = cutPatternIndex.toString(2).padStart(numHorizontalCutOptions, '0');
            
            currentPartitionPrefixSums = [prefixSumsGrid[0].slice()]; // Start with the first row's prefix sums

            // Build horizontal partitions based on the binary cut pattern
            for (let bitPosition = 0; bitPosition < numHorizontalCutOptions; bitPosition++) {
                const isCutAtThisPosition = binaryCutPattern[bitPosition] === '1';
                if (isCutAtThisPosition) {
                    // If '1', start a new partition with the next row's prefix sums
                    currentPartitionPrefixSums.push(prefixSumsGrid[bitPosition + 1].slice());
                    horizontalCutCount++;
                } else {
                    // If '0', merge the current row with the last partition
                    const lastPartitionIndex = currentPartitionPrefixSums.length - 1;
                    currentPartitionPrefixSums[lastPartitionIndex] = performVectorOperation(
                        currentPartitionPrefixSums[lastPartitionIndex],
                        prefixSumsGrid[bitPosition + 1],
                        '+'
                    );
                }
            }
        }

        // Array to track accumulated sums for each horizontal partition up to the current column
        const columnAccumulatedSums = new Array(currentPartitionPrefixSums.length).fill(0);
        const verticalCutPositions = []; // Stores column indices where vertical cuts are made

        // Iterate through columns to determine necessary vertical cuts
        for (let colIndex = 1; colIndex <= numCols; colIndex++) {
            // Check each horizontal partition for sum exceeding threshold
            for (let partitionIndex = 0; partitionIndex < currentPartitionPrefixSums.length; partitionIndex++) {
                const currentPartitionSumAtCol = currentPartitionPrefixSums[partitionIndex][colIndex];
                const accumulatedSumBeforeCol = columnAccumulatedSums[partitionIndex];
                
                // If the sum in a partition exceeds the threshold, a vertical cut is required
                if (currentPartitionSumAtCol - accumulatedSumBeforeCol > maxSumThreshold) {
                    // If a cut is needed at the first column, or immediately after a previous cut,
                    // this horizontal pattern is invalid.
                    const lastVerticalCutCol = verticalCutPositions[verticalCutPositions.length - 1];
                    if (colIndex === 1 || lastVerticalCutCol === colIndex - 1) {
                        continue horizontalPatternIteration; // Abandon this horizontal pattern
                    }
                    
                    // Add a vertical cut at the previous column boundary
                    verticalCutPositions.push(colIndex - 1);
                    
                    // Reset accumulated sums for all partitions to the values up to the *previous* column
                    for (let resetIdx = 0; resetIdx < currentPartitionPrefixSums.length; resetIdx++) {
                        columnAccumulatedSums[resetIdx] = currentPartitionPrefixSums[resetIdx][colIndex - 1];
                    }
                    
                    // Decrement colIndex to re-evaluate the current column after the new cut
                    colIndex--; 
                    break; // Break from inner partition loop, re-evaluate current column
                }
            }
        }
        
        // Update the minimum total cuts found
        minTotalCuts = Math.min(minTotalCuts, horizontalCutCount + verticalCutPositions.length);
    }

    console.log(minTotalCuts);
}

// Read input from stdin and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
