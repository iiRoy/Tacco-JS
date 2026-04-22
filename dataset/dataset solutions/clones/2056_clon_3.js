/**
 * This script is designed to determine the minimum number of cuts (horizontal and vertical)
 * required to partition a 2D binary grid into smaller rectangular regions.
 * Each resulting region must satisfy a condition: the sum of its '1's (or any integer value)
 * must not exceed a specified maximum limit.
 *
 * The algorithm explores all possible horizontal cutting patterns and, for each pattern,
 * calculates the necessary vertical cuts. It then identifies the pattern that yields
 * the fewest total cuts.
 */
const ProcessGridData = (rawInputString) => {
    // --- Input Validation and Parsing ---
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Input error: Provided data is either not a string or is empty.");
        return;
    }

    const inputLines = rawInputString.trim().split('\n');
    if (inputLines.length === 0) {
        console.error("Input error: No lines found after trimming the raw input.");
        return;
    }

    // Parse the first line for grid dimensions and the maximum allowed sum.
    const dimensionsAndLimit = inputLines[0].split(' ').map(Number);
    if (dimensionsAndLimit.length < 3 || dimensionsAndLimit.some(isNaN)) {
        console.error("Input error: First line must contain three valid numbers (Height, Width, MaxSum).");
        return;
    }

    const gridHeight = dimensionsAndLimit[0];    // Corresponds to H
    const gridWidth = dimensionsAndLimit[1];     // Corresponds to W
    const maxAllowedSum = dimensionsAndLimit[2]; // Corresponds to K

    // Basic sanity checks for dimensions
    if (gridHeight <= 0 || gridWidth <= 0 || maxAllowedSum < 0) {
        console.error(`Input error: Invalid grid dimensions or max sum. Height: ${gridHeight}, Width: ${gridWidth}, MaxSum: ${maxAllowedSum}`);
        return;
    }
    if (inputLines.length < gridHeight + 1) {
        console.error(`Input error: Expected ${gridHeight} data rows, but only ${inputLines.length - 1} were provided.`);
        return;
    }

    // --- Grid Data Structures Initialization ---
    // `parsedGridValues`: Stores the grid values as 0s and 1s.
    const parsedGridValues = [];
    // `cumulativeRowPrefixSums`: Stores prefix sums for each row.
    // Each inner array starts with 0 for convenience in calculating segment sums.
    const cumulativeRowPrefixSums = [];

    // Populate grid values and calculate prefix sums for each row.
    for (let rIdx = 0; rIdx < gridHeight; ++rIdx) {
        const rowDataString = inputLines[rIdx + 1];
        if (!rowDataString || rowDataString.length !== gridWidth) {
            console.error(`Input error: Row ${rIdx + 1} has invalid length or missing data. Expected ${gridWidth} characters.`);
            return;
        }
        
        const currentRowValues = rowDataString.split('').map(Number);
        parsedGridValues.push(currentRowValues);

        let currentRunningSum = 0;
        const rowSums = [0]; // Initialize with 0 for prefix sum logic
        for (let cIdx = 0; cIdx < gridWidth; ++cIdx) {
            currentRunningSum += currentRowValues[cIdx];
            rowSums.push(currentRunningSum);
        }
        cumulativeRowPrefixSums.push(rowSums);
    }

    // `maxHorizontalCutOptions`: Number of possible positions for horizontal cuts (H-1).
    const maxHorizontalCutOptions = gridHeight - 1;
    
    // Initialize `minTotalCutsFound` with a value guaranteed to be higher than any possible answer.
    // Max possible cuts = (H-1) horizontal + (W-1) vertical.
    let minTotalCutsFound = (gridHeight - 1) + (gridWidth - 1); 

    // --- Main Loop: Iterate through all horizontal cut combinations ---
    // Each integer `hPattern` represents a unique combination of horizontal cuts.
    // A '1' bit at position 'i' means a cut is made after row 'i'.
    mainHorizontalCutLoop:
    for (let hPattern = 0; hPattern < (1 << maxHorizontalCutOptions); ++hPattern) {
        let currentHorizontalCuts = 0;
        // `combinedRowSegmentSums`: Stores prefix sums for rows that are grouped together
        // due to no horizontal cut between them.
        let combinedRowSegmentSums = [];

        // Handle the special case where there are no horizontal cut possibilities (gridHeight = 1).
        if (maxHorizontalCutOptions === 0) {
            combinedRowSegmentSums = [cumulativeRowPrefixSums[0].slice()]; // Deep copy the single row's sums
            currentHorizontalCuts = 0;
        } else {
            // Convert the integer pattern to a binary string for easier bit-wise checking.
            const binaryPatternString = hPattern.toString(2).padStart(maxHorizontalCutOptions, '0');
            
            // Start with the first row's prefix sums as the initial segment.
            combinedRowSegmentSums.push(cumulativeRowPrefixSums[0].slice());

            // Process each potential horizontal cut position (from row 0 to H-2).
            for (let bitPosition = 0; bitPosition < maxHorizontalCutOptions; ++bitPosition) {
                // If the bit is '0', it means no cut, so merge the next row with the current segment.
                if (binaryPatternString[bitPosition] === '0') {
                    const rowToMergeIndex = bitPosition + 1;
                    combinedRowSegmentSums[combinedRowSegmentSums.length - 1] = performVectorOperation(
                        combinedRowSegmentSums[combinedRowSegmentSums.length - 1],
                        cumulativeRowPrefixSums[rowToMergeIndex],
                        '+'
                    );
                } else { // If the bit is '1', a horizontal cut is made, starting a new segment.
                    const newSegmentRowIndex = bitPosition + 1;
                    combinedRowSegmentSums.push(cumulativeRowPrefixSums[newSegmentRowIndex].slice());
                    currentHorizontalCuts++;
                }
            }
        }

        // --- Determine Vertical Cuts for the current horizontal grouping ---
        // `segmentSumsSinceLastVerticalCut`: Tracks the sum in each combined row segment
        // from the last vertical cut point up to the current column.
        const segmentSumsSinceLastVerticalCut = Array(combinedRowSegmentSums.length).fill(0);
        // `verticalCutPoints`: Stores the column indices where vertical cuts are made.
        const verticalCutPoints = [];

        // Iterate through columns (1-indexed for prefix sums) to identify vertical cut needs.
        verticalCutScanLoop:
        for (let currentColumn = 1; currentColumn <= gridWidth; ++currentColumn) {
            for (let groupIdx = 0; groupIdx < combinedRowSegmentSums.length; ++groupIdx) {
                // Calculate the sum of the current segment of the combined row group.
                const currentSegmentValue = combinedRowSegmentSums[groupIdx][currentColumn] - segmentSumsSinceLastVerticalCut[groupIdx];

                // If any segment sum exceeds the maximum allowed, a vertical cut is necessary.
                if (currentSegmentValue > maxAllowedSum) {
                    // Check for an impossible scenario:
                    // 1. If the sum exceeds the limit in the very first column.
                    // 2. If a cut was just made in the previous column, meaning a single column
                    //    segment (or part of it) already exceeds the limit.
                    const isFirstColumn = (currentColumn === 1);
                    const isCutImmediatelyBefore = (verticalCutPoints.length > 0 && verticalCutPoints[verticalCutPoints.length - 1] === currentColumn - 1);

                    if (isFirstColumn || isCutImmediatelyBefore) {
                        // This horizontal cut pattern is invalid because it leads to an unsolvable state.
                        continue mainHorizontalCutLoop; 
                    }

                    // A vertical cut is required before the current column.
                    verticalCutPoints.push(currentColumn - 1); 
                    
                    // Reset the `segmentSumsSinceLastVerticalCut` for all groups,
                    // as a new vertical segment begins from `currentColumn - 1`.
                    for (let resetIndex = 0; resetIndex < combinedRowSegmentSums.length; ++resetIndex) {
                        segmentSumsSinceLastVerticalCut[resetIndex] = combinedRowSegmentSums[resetIndex][currentColumn - 1];
                    }
                    
                    // Decrement `currentColumn` and break to re-evaluate the current column
                    // with the new segment sums starting from the last vertical cut.
                    currentColumn--; 
                    break verticalCutScanLoop; 
                }
            }
        }
        
        // Update the minimum total cuts found if the current combination is better.
        minTotalCutsFound = Math.min(minTotalCutsFound, currentHorizontalCuts + verticalCutPoints.length);
    }
    
    console.log(minTotalCutsFound);
};


/**
 * Performs an element-wise arithmetic or logical operation on two numeric arrays (vectors).
 * This function is generalized but primarily used for addition in the main logic.
 *
 * @param {number[]} vectorA - The first input array.
 * @param {number[]} vectorB - The second input array.
 * @param {string} operationSymbol - The symbol representing the operation (e.g., '+', '-', '||' for Math.max).
 * @returns {number[] | null} A new array containing the results of the operation, or null if an error occurs.
 */
const performVectorOperation = (vectorA, vectorB, operationSymbol) => {
    // Basic type and emptiness checks.
    if (!Array.isArray(vectorA) || !Array.isArray(vectorB) || vectorA.length === 0) {
        console.warn("Vector operation: One or both input vectors are invalid or empty.");
        return null;
    }

    let result = [];
    let effectiveVectorB = vectorB;

    // Handle cases where vectorB might be a scalar (represented as a single-element array)
    // and needs to be expanded to match vectorA's length.
    if (vectorA.length !== vectorB.length) {
        if (vectorB.length === 1) {
            effectiveVectorB = Array.from({ length: vectorA.length }, () => vectorB[0]);
        } else {
            console.error(`Vector operation error: Mismatched vector lengths (${vectorA.length} vs ${vectorB.length}). Cannot proceed.`);
            return null;
        }
    }

    // Apply the specified operation element by element.
    for (let elementIdx = 0; elementIdx < vectorA.length; ++elementIdx) {
        switch (operationSymbol) {
            case '+':
                result.push(vectorA[elementIdx] + effectiveVectorB[elementIdx]);
                break;
            case '-':
                result.push(vectorA[elementIdx] - effectiveVectorB[elementIdx]);
                break;
            case '*':
                result.push(vectorA[elementIdx] * effectiveVectorB[elementIdx]);
                break;
            case '/':
                // Guard against division by zero.
                if (effectiveVectorB[elementIdx] === 0) {
                    console.warn(`Vector operation: Division by zero at index ${elementIdx}. Resulting in Infinity.`);
                    result.push(Infinity); 
                } else {
                    result.push(vectorA[elementIdx] / effectiveVectorB[elementIdx]);
                }
                break;
            case '%':
                result.push(vectorA[elementIdx] % effectiveVectorB[elementIdx]);
                break;
            case '||': // Custom symbol for element-wise maximum
                result.push(Math.max(vectorA[elementIdx], effectiveVectorB[elementIdx]));
                break;
            default:
                console.error(`Vector operation error: Unsupported operation symbol '${operationSymbol}'.`);
                return null;
        }
    }
    return result;    
};

// --- Execution Entry Point ---
// Reads input from standard input and passes it to the main processing function.
try {
    const fileSystem = require("fs");
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    ProcessGridData(inputContent);
} catch (executionError) {
    console.error("Application runtime error:", executionError.message);
    // Exit with a non-zero code to indicate failure.
    process.exit(1); 
}