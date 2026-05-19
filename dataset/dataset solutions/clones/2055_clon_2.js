var resultContainer = 0x0;

// This function processes the main input data.
function ProcessInput(rawData) {
    // Parse dimensions and limit from the first line of input.
    var gridHeight = rawData[0].split(" ")[0] - 0x0;
    var gridWidth = rawData[0].split(" ")[0b1] - 0x0;
    var maxOnesPerSegment = rawData[0].split(" ")[0b10] - 0x0;

    // Initialize the grid data from subsequent input lines.
    var gridData = [];
    for (var rowIdx = 0x1; rowIdx <= gridHeight; rowIdx++) {
        gridData[rowIdx - 0x1] = rawData[rowIdx];
    }

    // Initialize the global minimum result with a large value.
    resultContainer = gridHeight * gridWidth;

    // Generate all possible horizontal partition combinations.
    var partitionCombinations = GeneratePartitions(gridHeight - 0x1);

    // Iterate through each partition combination and evaluate it.
    partitionCombinations.forEach(currentPartition => {
        EvaluatePartition(gridData, currentPartition, maxOnesPerSegment, gridHeight);
    });

    // Output the final minimum cost.
    console.log(resultContainer);
}

// This function evaluates a specific horizontal partitioning of the grid.
function EvaluatePartition(currentGrid, partitionInfo, limitValue, gridRows) {
    var currentCost = partitionInfo.splitCount; // Initial cost is the number of horizontal cuts.
    var columnCount = currentGrid[0x0].length;
    var segmentCounter = 0x0; // This variable is declared but not used in the original logic.
    var segmentOnesCount = []; // Stores the count of '1's for each segment in the current column.
    var isValidSegment = false; // Flag to indicate if the current column processing is valid.
    var segmentAdded = false; // Flag to indicate if a new vertical cut was added.

    // Loop through each column of the grid.
    columnTraversal: for (var colIdx = 0x0; colIdx < columnCount; colIdx++) {
        var currentSegmentIndex = 0x0; // Index for the current horizontal segment.
        for (var rowIter = 0x0; rowIter < gridRows; rowIter++) {
            // If the current cell contains '1', increment the count for its segment.
            if (currentGrid[rowIter][colIdx] === "1") {
                segmentOnesCount[currentSegmentIndex] = (segmentOnesCount[currentSegmentIndex] || 0x0) + 0x1;
            }

            // If any segment exceeds the allowed '1's limit.
            if (segmentOnesCount[currentSegmentIndex] > limitValue) {
                // If this is the first time exceeding the limit for the current column,
                // it means this partition is invalid for this column without a new vertical cut.
                if (!isValidSegment) {
                    return; // This partition is impossible, so exit.
                }
                isValidSegment = false; // Reset flag.
                segmentAdded = true; // Mark that a vertical cut was added.
                colIdx--; // Re-process the current column with a new vertical cut.
                segmentOnesCount = []; // Reset segment counts for the new vertical segment.
                continue columnTraversal; // Move to the next iteration of the column loop.
            }

            // If there's a horizontal cut at this row, increment the segment index.
            if (partitionInfo.segmentVector[rowIter] === "1") {
                currentSegmentIndex++;
            }
        }
        isValidSegment = true; // Mark that the current column was processed successfully.
        if (segmentAdded) {
            currentCost++; // Increment cost if a vertical cut was added.
        }

        // If this is the last column, update the global minimum result.
        if (colIdx === columnCount - 0x1) {
            resultContainer = Math.min(resultContainer, currentCost);
        }
    }
    return currentCost; // Return the cost for this specific partition (though not used by Main).
}

// This function generates all possible horizontal partition configurations.
function GeneratePartitions(partitionLength) {
    var partitionList = [];
    // Iterate through all numbers from 0 to 2^(partitionLength) - 1.
    for (var iterationIndex = 0x0; iterationIndex < Math.pow(0b10, partitionLength); iterationIndex++) {
        // Convert the number to its binary string representation.
        // Pad with leading zeros and slice to get the correct length.
        let binaryString = ("0000000000" + iterationIndex.toString(0b10)).slice(-partitionLength);
        partitionList.push({
            splitCount: countSetBits(iterationIndex), // Number of '1's (cuts) in the binary string.
            segmentVector: binaryString // The binary string representing the cuts.
        });
    }
    // Sort the partitions by the number of cuts (splitCount) in ascending order.
    return partitionList.sort((a, b) => a.splitCount - b.splitCount);
}

// This function counts the number of set bits (1s) in a 32-bit integer using a bit manipulation trick.
function countSetBits(inputNumber) {
    inputNumber = inputNumber - ((inputNumber >> 0x1) & 0x55555555);
    inputNumber = (inputNumber & 0x33333333) + ((inputNumber >> 0b10) & 0x33333333);
    return ((inputNumber + (inputNumber >> 0b100) & 0xF0F0F0F) * 0x1010101) >> 0x18;
}

// Read input from stdin, process it, and pass to the main function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
