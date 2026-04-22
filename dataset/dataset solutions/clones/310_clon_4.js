const dataStream = {
    contentBuffer: '',
    currentPosition: 0,
    extractNext: function(variant) {
        // The original code uses `+input[input_index++]` which converts
        // an empty string to 0. We must replicate this behavior.
        // `split(/\s+/)` might produce empty strings at the start/end
        // or between multiple spaces.
        const datum = this.contentBuffer[this.currentPosition++];
        if (variant === 'text') {
            return datum;
        } else {
            return +datum; // Converts '' to 0, '  ' to 0, etc.
        }
    }
};

const outputDisplay = {
    showOutcome: function(value) {
        console.log(value);
    }
};

// Function to calculate the maximum sum of a contiguous sub-array (Kadane's Algorithm)
const determineSequenceMaxSum = (numberSeries) => {
    return numberSeries.reduce((accumulator, currentValue) => {
        // Calculate the maximum sum ending at the current position
        const currentMaximumEndingHere = Math.max(currentValue, accumulator.currentRunningSum + currentValue);
        // Update the overall maximum sum found so far
        const overallMaximumFound = Math.max(accumulator.overallPeak, currentMaximumEndingHere);
        return { currentRunningSum: currentMaximumEndingHere, overallPeak: overallMaximumFound };
    }, { currentRunningSum: -Infinity, overallPeak: -Infinity }).overallPeak; // Initial state for reduction
};

// Main processing function
function commenceCalculations() {
    const matrixDimension = dataStream.extractNext();

    // Generate the initial grid by reading input values
    const baseGrid = Array.from({ length: matrixDimension }, () =>
        Array.from({ length: matrixDimension }, () => dataStream.extractNext())
    );

    // Compute row-wise prefix sums for the entire grid.
    // Each element `cumulativeGrid[r][c]` will store the sum of `baseGrid[r][0]` to `baseGrid[r][c]`.
    const cumulativeGrid = baseGrid.map(line =>
        line.reduce((sumSequence, itemValue, itemIndex) => {
            // If it's the first element in the row, its prefix sum is itself.
            // Otherwise, it's the current value plus the previous prefix sum.
            sumSequence.push((sumSequence[itemIndex - 1] || 0) + itemValue);
            return sumSequence;
        }, [])
    );

    let ultimateMaximum = -Infinity;

    // Iterate through all possible right column boundaries (j in original)
    Array.from({ length: matrixDimension }, (_, rightColumnBoundary) => rightColumnBoundary).forEach(rightColumnBoundary => {
        // Iterate through all possible left column boundaries (i in original)
        // 'leftColumnBoundary' ranges from 'rightColumnBoundary - 1' down to '-1'.
        // This covers all 'i < j' pairs, including 'i = -1' for sums from column 0.
        Array.from({ length: rightColumnBoundary + 1 }, (_, offset) => rightColumnBoundary - 1 - offset).forEach(leftColumnBoundary => {
            // For the current column range [leftColumnBoundary + 1, rightColumnBoundary],
            // calculate the sum for each row. This effectively compresses the 2D slice
            // into a 1D array.
            const verticalSliceSums = Array.from({ length: matrixDimension }, (_, rowIndex) => {
                const rightSum = cumulativeGrid[rowIndex][rightColumnBoundary];
                // If leftColumnBoundary is -1, it means the sum starts from column 0,
                // so we subtract 0 (as per the original's x[i][-1] = 0 trick).
                const leftSum = (leftColumnBoundary === -1) ? 0 : cumulativeGrid[rowIndex][leftColumnBoundary];
                return rightSum - leftSum;
            });

            // Apply Kadane's algorithm to this 1D array of row sums
            // to find the maximum sum sub-array (which corresponds to the
            // maximum sum sub-rectangle for the chosen column boundaries).
            const sliceMaxSum = determineSequenceMaxSum(verticalSliceSums);
            ultimateMaximum = Math.max(ultimateMaximum, sliceMaxSum);
        });
    });

    outputDisplay.showOutcome(ultimateMaximum);
}

// Node.js specific input handling to gather all data before processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    dataStream.contentBuffer += chunk;
});

process.stdin.on('end', function() {
    // Split the entire input by any whitespace.
    // The `+` operator in `extractNext` will convert empty strings to 0,
    // matching the original's implicit behavior.
    dataStream.contentBuffer = dataStream.contentBuffer.split(/\s+/);
    commenceCalculations();
});