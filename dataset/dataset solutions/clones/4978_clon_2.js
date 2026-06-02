function ProcessInput(inputLines) {
    // Parse the initial configuration from the first line of input.
    // This line contains the grid dimensions (H, W) and the number of points (N).
    inputLines[0] = inputLines[0].split(" ").map(valStr => parseInt(valStr, 10));

    // Calculate the adjusted height and width. These represent the maximum
    // row and column indices for the top-left corner of a 3x3 subgrid.
    const heightAdjusted = inputLines[0][0] - 2;
    const widthAdjusted = inputLines[0][1] - 2;
    const numPoints = inputLines[0][2];

    // Initialize a data structure to store counts of points within 3x3 squares.
    // 'pointCountsByRowMod' is an array of three objects. Each object corresponds
    // to a row index modulo 3. Inside each object, keys are column indices (actualX)
    // and values are the number of points found in the 3x3 square starting at (actualX, actualY).
    var pointCountsByRowMod = [{}, {}, {}];

    // Process the remaining input lines to extract point coordinates.
    // The original inputLines array is reused and modified in place.
    for (var idx = 0; idx < numPoints; idx++) {
        inputLines[idx] = inputLines[idx + 1].split(" ").map(valStr => parseInt(valStr, 10));
    }
    // Remove the last element, which is now a duplicate or empty after shifting.
    inputLines.pop();

    // Sort the points primarily by their row coordinate to facilitate processing.
    inputLines = inputLines.sort((coordA, coordB) => coordA[0] - coordB[0]);

    // Initialize an array to store the final counts of 3x3 squares
    // containing 0 to 9 points.
    var resultCounts = Array(10).fill(0);

    // 'currentRow' tracks the current row being processed in the main loop.
    var currentRow = 1;

    // Iterate through each given point.
    for (idx = 0; idx < numPoints; idx++) {
        var skipCounter = 0; // Helps optimize by skipping large gaps between points.

        // This loop processes rows that fall between the previously handled 'currentRow'
        // and the current point's row. It ensures all 3x3 squares whose top-left
        // corner is in these intermediate rows are accounted for.
        while (currentRow + 2 < inputLines[idx][0]) {
            // For each column in the current row's modulo group, add its accumulated
            // point count to the 'resultCounts' array.
            for (var colKey in pointCountsByRowMod[currentRow % 3]) {
                resultCounts[pointCountsByRowMod[currentRow % 3][colKey]]++;
            }
            // Clear the counts for the processed row modulo group, as they've been tallied.
            pointCountsByRowMod[currentRow % 3] = {};
            currentRow++; // Move to the next row.
            skipCounter++; // Increment the skip counter.
            // If we've skipped 3 or more rows, it means there's a significant gap.
            // We can jump 'currentRow' directly to just before the current point's row
            // to avoid unnecessary iterations.
            if (skipCounter >= 3) currentRow = inputLines[idx][0] - 2;
        }
        // Update the counts for all 3x3 squares affected by the current point.
        // The point (inputLines[idx][1], inputLines[idx][0]) is the bottom-right corner
        // of the 3x3 squares being considered.
        updateCounts(inputLines[idx][1], inputLines[idx][0]);
    }

    // Helper function to increment counts in 'pointCountsByRowMod' for 3x3 squares.
    // 'currentX' and 'currentY' are the coordinates of a point.
    // This function identifies all 3x3 squares that contain this point.
    function updateCounts(currentX, currentY) {
        // Iterate through possible column offsets for the top-left corner of a 3x3 square.
        // A point (currentX, currentY) can be in a 3x3 square whose top-left corner
        // is at (currentX-2, currentY-2), (currentX-1, currentY-2), ..., (currentX, currentY).
        for (var colOffset = -2; colOffset <= 0; colOffset++) {
            var actualX = currentX + colOffset; // Calculate the actual column of the top-left corner.
            if (actualX < 1) continue; // Skip if the column is out of bounds (too far left).
            if (actualX > widthAdjusted) break; // Stop if the column is out of bounds (too far right).

            // Iterate through possible row offsets for the top-left corner.
            for (var rowOffset = -2; rowOffset <= 0; rowOffset++) {
                var actualY = currentY + rowOffset; // Calculate the actual row of the top-left corner.
                if (actualY < 1) continue; // Skip if the row is out of bounds (too far up).
                if (actualY > heightAdjusted) break; // Stop if the row is out of bounds (too far down).

                // Increment the count for the 3x3 square starting at (actualX, actualY).
                // The modulo operator (actualY % 3) distributes counts across the three objects.
                if (!pointCountsByRowMod[actualY % 3][actualX]) {
                    pointCountsByRowMod[actualY % 3][actualX] = 1;
                } else {
                    pointCountsByRowMod[actualY % 3][actualX]++;
                }
            }
        }
    }

    // After processing all points, any remaining counts in 'pointCountsByRowMod'
    // need to be added to 'resultCounts'.
    for (idx = 0; idx < 3; idx++) {
        for (colKey in pointCountsByRowMod[idx]) {
            resultCounts[pointCountsByRowMod[idx][colKey]]++;
        }
    }

    // Calculate the total number of possible 3x3 squares in the grid.
    // This value initially represents the count of squares with 0 points.
    resultCounts[0] = heightAdjusted * widthAdjusted;

    // Handle potential large numbers for resultCounts[0] to prevent JavaScript's
    // number precision issues for very large integers.
    var overflowFactor = 0;
    if (resultCounts[0] > 9 * 10**15) { // Check if the number exceeds safe integer limits for direct calculation.
        // Perform calculation in parts using modulo arithmetic.
        resultCounts[0] = (heightAdjusted % 100000 * widthAdjusted);
        overflowFactor = Math.floor(resultCounts[0] / 100000);
        resultCounts[0] %= 100000;
    }

    // Subtract the counts of squares with 1 to 9 points from the total.
    // The remaining value in resultCounts[0] will be the actual count of
    // squares with zero points.
    for (idx = 1; idx <= 9; idx++) {
        resultCounts[0] -= resultCounts[idx];
    }

    // If overflow handling was used, adjust resultCounts[0] and overflowFactor.
    if (overflowFactor) {
        overflowFactor += Math.floor(heightAdjusted / 100000) * widthAdjusted;
        // Propagate any "borrows" if resultCounts[0] became negative due to subtraction.
        while (resultCounts[0] < 0) {
            overflowFactor--;
            resultCounts[0] += 100000;
        }
        // Format resultCounts[0] with leading zeros and prepend the overflow factor.
        resultCounts[0] = ("00000" + resultCounts[0] % 100000).slice(-5);
        resultCounts[0] = overflowFactor + resultCounts[0];
    }

    // Output the final counts, each on a new line.
    console.log(resultCounts.join("\n"));
}

// Read input from standard input, split it by newlines, and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
