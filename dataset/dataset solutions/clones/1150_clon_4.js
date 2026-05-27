try {
    var log = console.log;
    if (typeof process !== "undefined") {
        let inputAccumulator = "";
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (dataChunk) => {
            inputAccumulator += dataChunk;
        });
        process.stdin.on('end', () => {
            const processedLines = inputAccumulator.split("\n");
            analyzeGridForMaxRectangle(processedLines);
        });
    }

    function analyzeGridForMaxRectangle(rawInputLines) {
        const parsedGridData = rawInputLines.map(line => line.split(" ").map(Number));
        const [gridRows, gridCols] = parsedGridData.shift();
        const binaryMatrix = parsedGridData;

        let overallMaxArea = 0;

        // Precompute heights of consecutive 0s upwards for each cell.
        // `upwardZeroHeights[r][c]` stores the number of consecutive 0s ending at (r, c) and extending upwards.
        // If `binaryMatrix[r][c]` is 1, the height is 0.
        const upwardZeroHeights = Array.from({ length: gridRows }, () => Array(gridCols).fill(0));

        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridCols; c++) {
                if (binaryMatrix[r][c] === 0) {
                    upwardZeroHeights[r][c] = (r === 0) ? 1 : upwardZeroHeights[r - 1][c] + 1;
                } else {
                    upwardZeroHeights[r][c] = 0; // A '1' resets the height
                }
            }
        }

        // This function finds the largest rectangle in a given histogram (array of heights).
        // It uses a monotonic stack-based approach, which is a different strategy
        // compared to the original's complex 'dom' array and its filtering logic.
        const findLargestRectangleInHistogram = (histogramHeights) => {
            let currentMaxArea = 0;
            const stack = []; // Stores indices of bars in increasing order of height

            // Iterate through all bars, including an implicit bar of height 0 at the end
            // to ensure all elements in the stack are processed.
            for (let i = 0; i <= histogramHeights.length; i++) {
                const currentHeight = (i === histogramHeights.length) ? 0 : histogramHeights[i];

                // While the stack is not empty and the current bar is shorter than the bar at the stack's top
                while (stack.length > 0 && currentHeight < histogramHeights[stack[stack.length - 1]]) {
                    const topIndex = stack.pop(); // Pop the top bar's index
                    const height = histogramHeights[topIndex]; // Get its height

                    // Calculate the width of the rectangle formed by this popped bar.
                    // If the stack is empty, it means this bar extends from index 0 to `i-1`.
                    // Otherwise, it extends from the index of the new top of the stack + 1 to `i-1`.
                    const width = (stack.length === 0) ? i : i - stack[stack.length - 1] - 1;
                    currentMaxArea = Math.max(currentMaxArea, height * width);
                }
                stack.push(i); // Push current bar's index onto the stack
            }
            return currentMaxArea;
        };

        // Apply the Largest Rectangle in Histogram algorithm for each row.
        // Each row's `upwardZeroHeights` forms a histogram.
        for (let r = 0; r < gridRows; r++) {
            overallMaxArea = Math.max(overallMaxArea, findLargestRectangleInHistogram(upwardZeroHeights[r]));
        }

        log(overallMaxArea);
    }
} catch (e) {
    log(e);
}
