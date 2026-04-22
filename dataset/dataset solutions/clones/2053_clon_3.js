function processGridSplits(inputString) {
    if (!inputString || inputString.trim() === '') {
        console.error("Error: Empty input provided for grid processing.");
        return;
    }

    const inputLines = inputString.trim().split("\n");
    const gridDimensions = inputLines[0].split(" ").map(Number);
    const rowCount = gridDimensions[0];
    const colCount = gridDimensions[1];
    const maxSegmentSum = gridDimensions[2];

    if (rowCount <= 0 || colCount <= 0 || maxSegmentSum <= 0) {
        console.error("Invalid grid dimensions or capacity detected.");
        return;
    }

    const cellValuesMatrix = [];
    const cumulativeRowSumMatrix = [];

    for (let r = 0; r < rowCount; r++) {
        const currentRowData = inputLines[r + 1][0].split("").map(Number);
        cellValuesMatrix.push(currentRowData);

        let runningSum = 0;
        const currentCumulativeSums = [0]; // Prefix sums start with 0 for 1-based column indexing
        for (let c = 0; c < colCount; c++) {
            runningSum += currentRowData[c];
            currentCumulativeSums.push(runningSum);
        }
        cumulativeRowSumMatrix.push(currentCumulativeSums);
    }

    const totalPossibleHorizontalCuts = rowCount - 1;
    let overallMinimumCuts = totalPossibleHorizontalCuts + (colCount - 1); // Initialize with maximum possible cuts

    horizontalConfigurationLoop:
    for (let configValue = 0; configValue < (1 << totalPossibleHorizontalCuts); configValue++) {
        let currentHorizontalCutCount = 0;
        const activeSegmentPrefixSums = []; // Stores cumulative sums for currently merged rows

        // Start with the first row's cumulative sums as the first segment
        activeSegmentPrefixSums.push(cumulativeRowSumMatrix[0].slice());

        // Evaluate each potential horizontal split point
        for (let splitRowIndex = 0; splitRowIndex < totalPossibleHorizontalCuts; splitRowIndex++) {
            const isCutAtThisRow = (configValue >> splitRowIndex) & 1; // Check bit for split decision

            if (isCutAtThisRow === 0) { // No cut, merge current row with the previous segment
                const lastSegment = activeSegmentPrefixSums[activeSegmentPrefixSums.length - 1];
                const nextRowData = cumulativeRowSumMatrix[splitRowIndex + 1];
                const mergedSegment = [];
                for (let i = 0; i < lastSegment.length; i++) {
                    mergedSegment.push(lastSegment[i] + nextRowData[i]);
                }
                activeSegmentPrefixSums[activeSegmentPrefixSums.length - 1] = mergedSegment;
            } else { // Cut, start a new horizontal segment
                activeSegmentPrefixSums.push(cumulativeRowSumMatrix[splitRowIndex + 1].slice());
                currentHorizontalCutCount++;
            }
        }

        let segmentStartingColumnSums = Array(activeSegmentPrefixSums.length).fill(0); // Sums at the start of current column for each segment
        const verticalCutPositions = [];

        columnProcessingLoop:
        for (let currentColumnIndex = 1; currentColumnIndex <= colCount; currentColumnIndex++) {
            for (let segmentIdx = 0; segmentIdx < activeSegmentPrefixSums.length; segmentIdx++) {
                const segmentColumnValue = activeSegmentPrefixSums[segmentIdx][currentColumnIndex] - segmentStartingColumnSums[segmentIdx];
                
                if (segmentColumnValue > maxSegmentSum) {
                    if (currentColumnIndex === 1) { // If the very first column already exceeds capacity
                        continue horizontalConfigurationLoop; // This horizontal configuration is invalid
                    }
                    
                    const lastVerticalCut = verticalCutPositions.length > 0 ? verticalCutPositions[verticalCutPositions.length - 1] : -1;
                    if (lastVerticalCut === currentColumnIndex - 1) {
                         // A cut was just made at the previous column, but this column still exceeds capacity.
                         // This horizontal configuration is impossible.
                         continue horizontalConfigurationLoop;
                    }

                    verticalCutPositions.push(currentColumnIndex - 1); // Add a vertical cut before this column
                    
                    // Reset starting sums for all segments to the value at the cut point
                    for (let i = 0; i < activeSegmentPrefixSums.length; i++) {
                        segmentStartingColumnSums[i] = activeSegmentPrefixSums[i][currentColumnIndex - 1];
                    }
                    
                    // Re-evaluate the current column with the new cut
                    currentColumnIndex--; 
                    break columnProcessingLoop; // Restart column loop from the same column
                }
            }
        }
        overallMinimumCuts = Math.min(overallMinimumCuts, currentHorizontalCutCount + verticalCutPositions.length);
    }
    
    console.log(overallMinimumCuts);
}

// Entry point for execution, handling input file reading
try {
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    processGridSplits(fileContents);
} catch (error) {
    console.error("An error occurred during input reading or processing:", error.message);
    // Optionally, provide a default test case for local debugging:
    // processGridSplits("3 3 5\n101\n001\n110"); 
}