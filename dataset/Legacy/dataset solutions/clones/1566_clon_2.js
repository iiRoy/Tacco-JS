(async () => {
    // This variable will accumulate all incoming data from standard input.
    let rawData = '';

    // Asynchronously iterate over chunks of data from stdin and append them.
    for await (const dataPiece of process.stdin) {
        rawData += dataPiece;
    }

    // Split the accumulated data into an array of strings, one for each line.
    let inputRows = rawData.split(/\n/);

    // Extract the height and width values from the first line.
    // The first line is removed from the inputRows array.
    // Values are split by whitespace and converted to numbers.
    const [heightVal, widthVal] = inputRows.shift().split(/\s/).map(strVal => +strVal);

    // Trim the inputRows array to only include 'heightVal' number of rows.
    inputRows = inputRows.slice(0, heightVal);

    // Process each remaining row: split by whitespace, convert to numbers, and subtract 1.
    inputRows = inputRows.map(currentRow =>
        currentRow.split(/\s/).map(numStr => numStr - 1)
    );

    // Output the parsed dimensions and the processed input rows for debugging/verification.
    console.log(heightVal, widthVal, inputRows);

    // Initialize an array 'cellTracker' of size 'widthVal' with all elements set to 0.
    let cellTracker = new Array(widthVal).fill(0);

    // Iterate through each row of the processed input data.
    for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
        // Initialize a 'minValInRow' variable to a large number for tracking minimums within the current row's processing.
        let minValInRow = 1_000_000;

        // Iterate through each column for the current row.
        for (let colIdx = 0; colIdx < widthVal; colIdx++) {
            // Optimization: If the current cell's tracker value and the row's minimum tracker are both very high, skip.
            if (cellTracker[colIdx] > 500_000 && minValInRow > 500_000) {
                continue;
            }

            // Destructure the start and end range values from the current input row.
            const [startRange, endRange] = inputRows[rowIdx];

            // Check if the current column index falls outside the specified range [startRange, endRange].
            if (colIdx < startRange || colIdx > endRange) {
                // If outside the range, increment the tracker for this cell.
                cellTracker[colIdx]++;
                // Update the minimum tracker value for the current row's processing.
                minValInRow = Math.min(minValInRow, cellTracker[colIdx]);
            } else if (minValInRow > 500_000) {
                // If inside the range AND the minimum tracker is very high, set this cell's tracker to a very high value.
                cellTracker[colIdx] = 1_000_000;
            } else {
                // If inside the range AND the minimum tracker is not very high, increment the minimum tracker.
                minValInRow++;
                // Assign the incremented minimum tracker value to the current cell's tracker.
                cellTracker[colIdx] = minValInRow;
            }
        }

        // After processing all columns for the current row, log the updated cellTracker array.
        console.log(cellTracker);

        // Check if any element in 'cellTracker' is less than 500,000.
        if (cellTracker.find(elementVal => elementVal < 500_000)) {
            // If such an element exists, find the minimum value in 'cellTracker' (capped at 500,000) and log it.
            console.log(cellTracker.reduce((accumulator, currentValue) => Math.min(accumulator, currentValue), 500_000));
        } else {
            // If all elements are 500,000 or greater, log -1.
            console.log(-1);
        }
    }
})();
