/*
 * Configuration parameters for the application.
 * This object will hold parsed values from standard input.
 */
let configData = {};

/*
 * A two-dimensional array representing the "ladder" or grid structure.
 * Elements can be:
 *   - -1: Indicates a horizontal bar extending to the left (from the current position).
 *   -  0: No horizontal bar at this position.
 *   -  1: Indicates a horizontal bar extending to the right (from the current position).
 */
let ladderGrid = [];

/**
 * Traces a path through the ladder grid from a specified starting column and row.
 *
 * @param {number} initialColumn The starting column index (0-based).
 * @param {number} [initialRow=0] The starting row index (0-based). Defaults to 0.
 * @returns {number[]} An array representing the sequence of column positions at each row.
 */
const traceForward = function(initialColumn, initialRow = 0) {
    let currentPos = initialColumn;
    const pathSequence = [currentPos]; // Store the initial position

    // Iterate through the ladder rows from the starting row
    for (let rowIndex = initialRow; rowIndex < ladderGrid.length; rowIndex++) {
        // Update the current position based on the ladder element
        currentPos += ladderGrid[rowIndex][currentPos];
        pathSequence.push(currentPos); // Add the new position to the sequence
    }

    return pathSequence;
};

/**
 * Traces a path backwards from a specified ending column to determine its origin.
 * The returned path is reversed to represent the sequence from start to end.
 *
 * @param {number} finalColumn The target column index at the bottom of the ladder (0-based).
 * @returns {number[]} An array representing the sequence of column positions from top to bottom.
 */
const traceBackward = function(finalColumn) {
    let currentPos = finalColumn;
    const pathSequence = [currentPos]; // Store the final position

    // Iterate through the ladder rows in reverse order
    for (let rowIndex = ladderGrid.length - 1; rowIndex >= 0; rowIndex--) {
        // Update the current position based on the ladder element
        // Note: The logic `now += data[y][now]` works for both forward and backward traversal
        // because a bar at `data[y][now]` means `now` moves to `now + data[y][now]`.
        // If we are at `now + data[y][now]` and want to go back to `now`, we need to subtract `data[y][now]`.
        // However, the original code uses `now += data[y][now]` which effectively means if `data[y][now]` is 1,
        // it came from `now-1`. If it's -1, it came from `now+1`. If 0, it came from `now`.
        // The original code's `now += data[y][now]` for reverse path is a bit tricky.
        // Let's re-evaluate the original `rf` function:
        // `now += data[y][now];`
        // If `data[y][now]` is 1, it means a bar is to the right. So, if we are at `now`, we came from `now-1`.
        // If `data[y][now]` is -1, it means a bar is to the left. So, if we are at `now`, we came from `now+1`.
        // If `data[y][now]` is 0, it means no bar. So, we came from `now`.
        // This implies the original `rf` function is actually tracing the *reverse* movement.
        // Example: if `data[y][now]` is 1, `now` becomes `now+1`. This means if we are at `now+1`, we came from `now`.
        // So, to find the previous position, we need to find `prev_pos` such that `prev_pos + data[y][prev_pos] == now`.
        // The original code's `now += data[y][now]` for reverse path is actually correct for finding the *previous* column
        // that would lead to `now` if traversing forward.
        // If `data[y][now]` is 1, it means a bar is at `now` going to `now+1`. So if we are at `now+1`, we came from `now`.
        // If `data[y][now]` is -1, it means a bar is at `now-1` going to `now`. So if we are at `now`, we came from `now-1`.
        // The original code's `now += data[y][now]` is a clever way to reverse the movement.
        // If `data[y][now]` is 1, `now` becomes `now+1`. This means if we are at `now`, the previous position was `now-1`.
        // If `data[y][now]` is -1, `now` becomes `now-1`. This means if we are at `now`, the previous position was `now+1`.
        // If `data[y][now]` is 0, `now` remains `now`. This means if we are at `now`, the previous position was `now`.
        // This is effectively `now = now - data[y][now]` if `data[y][now]` is the value at the *previous* position.
        // But `data[y][now]` is the value at the *current* position.
        // Let's stick to the original logic: `now += ladderGrid[rowIndex][currentPos];`
        // This is the key to Type II: preserve the exact algorithm.
        currentPos += ladderGrid[rowIndex][currentPos];
        pathSequence.push(currentPos); // Add the new position to the sequence
    }

    return pathSequence.reverse(); // Reverse the path to be from top to bottom
};

// Array to store raw input lines from standard input
const rawInputLines = [];

// Set up standard input processing
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event handler for incoming data chunks
process.stdin.on('data', function (inputSegment) {
    // Split the chunk by newline, trim each line, and add to the rawInputLines array
    inputSegment.trim().split('\n').forEach(function(singleLine) {
        rawInputLines.push(singleLine);
    });
});

// Event handler for the end of standard input
process.stdin.on('end', function() {
    let finalOutcome = ""; // Variable to store the final result string

    // Re-initialize configData and ladderGrid for each run (if multiple test cases were in one input, though not typical for this problem)
    configData = {};
    ladderGrid = [];

    // Process each line from the collected input
    for (let lineIndex = 0; lineIndex < rawInputLines.length; lineIndex++) {
        const currentLineContent = rawInputLines[lineIndex];

        // If a line contains "0", it signifies the end of input for the current test case.
        // The original code uses `return false;` which exits the `on('end')` callback entirely.
        if (currentLineContent === "0") {
            return; // Exit the entire `on('end')` function
        }

        // Define the keys for the initial configuration parameters
        const configKeys = ["lines", "start", "end", "steps"];

        // Parse the first few lines as configuration parameters
        if (lineIndex < configKeys.length) {
            configData[configKeys[lineIndex]] = parseInt(currentLineContent, 10);
            // The original code uses `return;` here, which exits the current iteration of the `forEach` loop.
            // Since I'm using a `for` loop, `continue;` is the equivalent behavior to skip to the next iteration.
            continue;
        }

        // For lines beyond the configuration parameters, parse the ladder grid data
        // (lineIndex >= configKeys.length)
        const currentRow = [];
        // Iterate up to `configData.lines - 1` because the last column is handled separately
        for (let colIdx = 0; colIdx < configData.lines - 1; colIdx++) {
            let charValue = parseInt(currentLineContent.charAt(colIdx), 10);

            // Special handling for converting '0' to '-1' if the previous element was '1'
            // This ensures consistent representation of horizontal bars.
            if (colIdx > 0 && charValue === 0 && currentRow[colIdx - 1] === 1) {
                charValue = -1;
            }
            currentRow.push(charValue);
        }
        // Add the last element to the current row based on the previous element
        // If the last element was '1', the current position must be '-1' (bar to the left).
        // Otherwise, it's '0' (no bar).
        currentRow.push((currentRow[currentRow.length - 1] === 1) ? -1 : 0);
        ladderGrid.push(currentRow); // Add the completed row to the ladder grid
    }

    // Adjust start and end positions to be 0-indexed
    configData.start -= 1;
    configData.end -= 1;

    // Calculate the forward path from the starting position
    const forwardPath = traceForward(configData.start);

    // Check if the starting path directly leads to the end position
    if (forwardPath[forwardPath.length - 1] === configData.end) {
        console.log("0"); // Output "0" if no new bar is needed
        return; // Exit the function as the task is complete
    }

    // Calculate the path that would lead to the end position (traced backwards then reversed)
    const goalPath = traceBackward(configData.end);

    // Iterate through each step (row) to find a suitable position to insert a new bar
    for (let rowIndex = 0; rowIndex < configData.steps; rowIndex++) {
        // Check if the two paths are adjacent and both positions on the ladder are empty (0)
        if (Math.abs(forwardPath[rowIndex] - goalPath[rowIndex]) === 1 &&
            ladderGrid[rowIndex][forwardPath[rowIndex]] === 0 &&
            ladderGrid[rowIndex][goalPath[rowIndex]] === 0) {
            // If conditions met, a bar can be inserted.
            // The result is the row number (1-indexed) and the smaller of the two adjacent column numbers (1-indexed).
            finalOutcome = (rowIndex + 1) + " " + (Math.min(forwardPath[rowIndex], goalPath[rowIndex]) + 1);
            break; // Stop searching after the first suitable position is found
        }
    }

    // If no suitable position was found after checking all steps, output "1"
    if (finalOutcome === "") {
        finalOutcome = "1";
    }

    // Print the final result
    console.log(finalOutcome);
});
