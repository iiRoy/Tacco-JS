function ExecuteProgram(rawData) {
    // Process the incoming raw data string
    rawData = rawData.trim().split("\n").map(function(lineFragment) { 
        return lineFragment.split(" ");
    });

    // Extract crucial dimensions and the maximum allowed sum
    const gridRows = parseInt(rawData[0][0], 10);
    const gridCols = parseInt(rawData[0][1], 10);
    const maxSegmentSum = parseInt(rawData[0][2], 10);

    // Initialize arrays to store cell values and their row-wise prefix sums
    let cellValues = [];
    let rowPrefixSums = [];
    
    let temporaryAccumulator; // A temporary variable for sum calculation

    // Populate the cell values and calculate prefix sums for each row
    for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
        cellValues.push(rawData[rowIndex + 1][0].split("").map(element => parseInt(element, 10)));
        rowPrefixSums.push([0]); // Start with a zero for prefix sum
        temporaryAccumulator = 0;
        for (let colIndex = 0; colIndex < gridCols; colIndex++) {
            temporaryAccumulator += cellValues[rowIndex][colIndex];
            rowPrefixSums[rowIndex].push(temporaryAccumulator);
        }
    }
    
    // Determine the number of potential horizontal divisions (N-1 for N rows)
    const numHorizontalCuts = gridRows - 1; 
    
    let horizDivisionMarkers;
    let mergedRowsData;
    let segmentSums; 
    let currentHorizontalCutCount;
    let verticalCutPositions;
    
    // Initialize the overall minimum cuts with a large value (or sum of max possible cuts)
    let minimumCuts = (gridRows - 1) + (gridCols - 1);

    // Label for the outer loop to allow early continuation
    mainIteration:
    for (let configIndex = 0; configIndex < Math.pow(2, numHorizontalCuts); configIndex++) {
        // Handle the special case where there are no horizontal divisions possible (only one row)
        if (numHorizontalCuts === 0) {
            mergedRowsData = [rowPrefixSums[0].slice()]; // Just the single row's prefix sums
            currentHorizontalCutCount = 0; // No horizontal cuts needed
        } else {        
            // Initialize an array to track horizontal division points (not strictly used but represents the divisions)
            horizDivisionMarkers = Array(gridRows).fill(0).map((_, idx) => idx);
            
            // Start with the first row's prefix sums
            mergedRowsData = [rowPrefixSums[0].slice()];
            
            // Convert the configuration index to a binary string and pad with leading zeros
            let binaryStringRepresentation = configIndex.toString(2);
            binaryStringRepresentation = ('0'.repeat(numHorizontalCuts) + binaryStringRepresentation).slice(-numHorizontalCuts);
            
            currentHorizontalCutCount = 0; // Reset horizontal cut counter for this configuration

            // Iterate through the binary string to determine horizontal merges/cuts
            for (let bitIndex = 0; bitIndex < binaryStringRepresentation.length; bitIndex++) {
                // If the bit is '0', merge the current row with the previous merged segment
                if (binaryStringRepresentation.charAt(bitIndex) === '0') {
                    horizDivisionMarkers[bitIndex + 1] = horizDivisionMarkers[bitIndex]; // No new division
                    mergedRowsData[mergedRowsData.length - 1] = PerformVectorOperation(
                        mergedRowsData[mergedRowsData.length - 1], 
                        rowPrefixSums[bitIndex + 1], 
                        '+'
                    );
                } 
                // If the bit is '1', start a new merged segment (i.e., a horizontal cut)
                else {
                    mergedRowsData.push(rowPrefixSums[bitIndex + 1].slice()); // New segment
                    currentHorizontalCutCount++;
                }
            }
        }
        
        // Initialize sums for each segment and an array to store vertical cut positions
        segmentSums = Array(mergedRowsData.length).fill(0);
        verticalCutPositions = [];

        // Iterate through columns to determine optimal vertical cuts
        segmentCheck:
        for (let currentColumn = 1; currentColumn <= gridCols; currentColumn++) {
            // Check each merged row segment
            for (let segmentIdx = 0; segmentIdx < mergedRowsData.length; segmentIdx++) {
                // If the sum of the current segment exceeds the maximum allowed sum
                if (mergedRowsData[segmentIdx][currentColumn] - segmentSums[segmentIdx] > maxSegmentSum) {
                    // If this is the very first column OR the previous column already had a cut, 
                    // this configuration is invalid, so skip to the next horizontal configuration
                    if (currentColumn === 1 || verticalCutPositions[verticalCutPositions.length - 1] === currentColumn - 1) {
                        continue mainIteration;
                    }
                    
                    // Otherwise, add a vertical cut before the current column
                    verticalCutPositions.push(currentColumn - 1); 
                    
                    // Reset segment sums based on the new cut position
                    for (let resetIdx = 0; resetIdx < mergedRowsData.length; resetIdx++) {
                        segmentSums[resetIdx] = mergedRowsData[resetIdx][currentColumn - 1];
                    }
                    
                    currentColumn--; // Re-evaluate the current column with the new cut
                    break segmentCheck; // Break from inner loop to re-check segments from currentColumn
                } 
            }
        }
        // Update the minimum total cuts found so far
        minimumCuts = Math.min(minimumCuts, currentHorizontalCutCount + verticalCutPositions.length);
    }
    console.log(minimumCuts); // Output the final minimum cuts
}


function PerformVectorOperation(vectorA, vectorB, operationType){
    let resultVector = []; // Array to store the result of the operation
    
    // Handle cases where vectorB might be a scalar (single element array)
    if (vectorA.length !== vectorB.length) {
      if (vectorB.length === 1){
        vectorB = Array.from({ length: (vectorA.length) }, () => vectorB[0]);
      } else {
          return null; // Return null if vectors are incompatible
      }
    }
    
    // Perform the specified operation element-wise
    for (let elementIndex = 0; elementIndex < vectorA.length; elementIndex++){
        if (operationType === '+') {
            resultVector.push(vectorA[elementIndex] + vectorB[elementIndex]);
        } 
        if (operationType === '-') {
            resultVector.push(vectorA[elementIndex] - vectorB[elementIndex]);
        } 
        if (operationType === '*') {
            resultVector.push(vectorA[elementIndex] * vectorB[elementIndex]);
        } 
        if (operationType === '/') {
            resultVector.push(vectorA[elementIndex] / vectorB[elementIndex]);
        } 
        if (operationType === '%') {
            resultVector.push(vectorA[elementIndex] % vectorB[elementIndex]);
        } 
        if (operationType === '||') { // Custom operation for element-wise maximum
            resultVector.push(Math.max(vectorA[elementIndex],vectorB[elementIndex]));
        } 
    }
    return resultVector;    // Return the new vector
}

// Invoke the primary function using file system input
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));