let ProcessInput = (rawData) => {
    // This function processes grid data to find the minimum number of cuts
    // required to divide it into sub-regions, where each sub-region's
    // sum of elements does not exceed a specified limit.

    // Clean and parse the initial input string.
    // The first line contains grid dimensions (height, width) and the sum limit.
    // Subsequent lines represent rows of the grid.
    let parsedLines = rawData.trim().split("\n").map((lineSegment) => {
        return lineSegment.split(" ");
    });

    // Extract grid dimensions and the maximum sum allowed per segment.
    const gridHeight = parseInt(parsedLines[0x0][0x0], 0xA); // Original H
    const gridWidth = parseInt(parsedLines[0x0][0x1], 0xA); // Original W
    const maxSumLimit = parseInt(parsedLines[0x0][0x2], 0xA); // Original K

    // Initialize arrays to store the original grid and its prefix sums.
    let originalGrid = []; // Original arr_S
    let prefixSumsGrid = []; // Original arr_SS

    let currentSumAccumulator; // Original tmp

    // Populate the grid and calculate prefix sums for each row.
    for (let rowIdx = 0x0; rowIdx < gridHeight; rowIdx++) {
        // Parse each character in the row string to an integer.
        originalGrid.push(parsedLines[rowIdx + 0x1][0x0].split("").map(digitChar => parseInt(digitChar, 0xA)));
        
        // Initialize prefix sum array for the current row.
        prefixSumsGrid.push([0x0]);
        currentSumAccumulator = 0x0;

        // Calculate prefix sums for the current row.
        for (let colIdx = 0x0; colIdx < gridWidth; colIdx++) {
            currentSumAccumulator += originalGrid[rowIdx][colIdx];
            prefixSumsGrid[rowIdx].push(currentSumAccumulator);
        }
    }
    
    // Determine the number of possible horizontal division points.
    // This corresponds to the number of bits in the binary representation
    // for iterating through all horizontal cut patterns.
    const numHorizontalDivisions = gridHeight - 0x1; // Original N

    let horizontalDivisionMap; // Original hDiv
    let currentCombinedRows; // Original tmpRowSet
    let columnPrefixSums; // Original tmpSum
    let horizontalCutCount; // Original CountHCut
    let verticalCutPoints; // Original tmpCut

    // Initialize the minimum number of cuts found so far.
    // In the worst case, we might cut every row and every column.
    let minimumCuts = (gridHeight - 0x1) + (gridWidth - 0x1); // Original ans

    // Label for the outer loop, allowing early exit from nested loops.
    outerLoopForHorizontalPatterns:
    for (let divisionPatternIndex = 0x0; divisionPatternIndex < Math.pow(0x2, numHorizontalDivisions); divisionPatternIndex++) {
        // Initialize horizontal division map and combined row set for the current pattern.
        horizontalDivisionMap = [0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7]; // Max H is 8, so this covers it.
        horizontalDivisionMap.length = gridHeight; // Adjust length based on actual H.
        
        // Start with the first row's prefix sums as the initial combined row.
        currentCombinedRows = [prefixSumsGrid[0x0].slice()];

        // Convert the division pattern index to a binary string.
        // Pad with leading zeros to ensure correct length.
        let binaryPatternString = divisionPatternIndex.toString(0x2); // Original tmp
        binaryPatternString = (String.fromCharCode(0x30).repeat(numHorizontalDivisions) + binaryPatternString).slice(-0x1 * numHorizontalDivisions);
        
        horizontalCutCount = 0x0; // Reset horizontal cut count for this pattern.

        // Process the binary pattern to determine horizontal cuts and combine rows.
        for (let patternCharIndex = 0x0; patternCharIndex < binaryPatternString.length; patternCharIndex++) {
            // If the bit is '0', combine the current row with the previous combined row.
            if (binaryPatternString.substring(patternCharIndex, 0x1) === String.fromCharCode(0x30)) { // '0'
                horizontalDivisionMap[patternCharIndex + 0x1] = horizontalDivisionMap[patternCharIndex];
                currentCombinedRows[currentCombinedRows.length - 0x1] = VectorMathOp(
                    currentCombinedRows[currentCombinedRows.length - 0x1],
                    prefixSumsGrid[patternCharIndex + 0x1],
                    String.fromCharCode(0x2B) // '+'
                );
            } else {
                // If the bit is '1', create a new combined row, indicating a horizontal cut.
                currentCombinedRows.push(prefixSumsGrid[patternCharIndex + 0x1].slice());
                horizontalCutCount++;
            }
        }

        // Initialize arrays for tracking column sums and vertical cut points.
        columnPrefixSums = new Array(currentCombinedRows.length).fill(0x0);
        verticalCutPoints = [];

        // Iterate through columns to determine necessary vertical cuts.
        for (let colIdx = 0x1; colIdx <= gridWidth; colIdx++) {
            // Label for the inner loop, allowing early exit to the next horizontal pattern.
            innerLoopForVerticalChecks:
            for (let combinedRowIdx = 0x0; combinedRowIdx < currentCombinedRows.length; combinedRowIdx++) {
                // Check if the sum of elements in the current segment exceeds the limit K.
                if (currentCombinedRows[combinedRowIdx][colIdx] - columnPrefixSums[combinedRowIdx] > maxSumLimit) {
                    // If it exceeds, a vertical cut is needed.
                    // If it's the first column or the previous column already had a cut,
                    // this horizontal pattern is invalid, so skip to the next.
                    if (colIdx === 0x1 || verticalCutPoints[verticalCutPoints.length - 0x1] === colIdx - 0x1) {
                        continue outerLoopForHorizontalPatterns;
                    }
                    
                    // Add a vertical cut point.
                    verticalCutPoints.push(colIdx - 0x1); // Cut between colIdx-1 and colIdx.
                    
                    // Reset column prefix sums for the new segment starting after the cut.
                    for (let elementIdx = 0x0; elementIdx < currentCombinedRows.length; elementIdx++) {
                        columnPrefixSums[elementIdx] = currentCombinedRows[elementIdx][colIdx - 0x1];
                    }
                    colIdx--; // Re-evaluate the current column with new sums.
                    break innerLoopForVerticalChecks; // Break from inner loop to re-check current column.
                } 
            }
        }
        // Update the minimum cuts if the current pattern yields fewer cuts.
        minimumCuts = Math.min(minimumCuts, horizontalCutCount + verticalCutPoints.length);
    }
    // Output the final minimum number of cuts.
    console.log(minimumCuts);
};


/**
 * Performs element-wise vector operations.
 * @param {number[]} vectorOne - The first vector.
 * @param {number[]} vectorTwo - The second vector.
 * @param {string} operationType - The operation to perform ('+', '-', '*', '/', '%', '||' for max).
 * @returns {number[]|null} A new vector with the results, or null if dimensions are incompatible.
 */
let VectorMathOp = (vectorOne, vectorTwo, operationType) => {
    let resultVector = []; // Original ans
    // Handle cases where vectorTwo might be a scalar (represented as a single-element array).
    if (vectorOne.length !== vectorTwo.length) {
      if (vectorTwo.length === 0x1){
        // Expand vectorTwo to match vectorOne's length if it's a scalar.
        vectorTwo = Array.from({ length: (vectorOne.length) }, () => vectorTwo[0x0]);
      } else {
          // If lengths are incompatible and vectorTwo is not a scalar, return null.
          return null;
      }
    }
    
    // Perform the specified element-wise operation.
    for (let elementIdx = 0x0; elementIdx < vectorOne.length; elementIdx++){
        if (operationType === String.fromCharCode(0x2B)) { // '+'
            resultVector.push(vectorOne[elementIdx] + vectorTwo[elementIdx]);
        } 
        else if (operationType === String.fromCharCode(0x2D)) { // '-'
            resultVector.push(vectorOne[elementIdx] - vectorTwo[elementIdx]);
        } 
        else if (operationType === String.fromCharCode(0x2A)) { // '*'
            resultVector.push(vectorOne[elementIdx] * vectorTwo[elementIdx]);
        } 
        else if (operationType === String.fromCharCode(0x2F)) { // '/'
            resultVector.push(vectorOne[elementIdx] / vectorTwo[elementIdx]);
        } 
        else if (operationType === String.fromCharCode(0x25)) { // '%'
            resultVector.push(vectorOne[elementIdx] % vectorTwo[elementIdx]);
        } 
        else if (operationType === String.fromCharCode(0x7C, 0x7C)) { // '||' (for Math.max)
            resultVector.push(Math.max(vectorOne[elementIdx], vectorTwo[elementIdx]));
        } 
    }
    return resultVector;    
};

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
