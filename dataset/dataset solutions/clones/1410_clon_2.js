function getInputData() {
    // This function reads input from standard input.
    // It uses Node.js 'fs' module to read the file synchronously.
    let inputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // The content is then split into an array of lines.
    return inputContent.split(/\n\r?/);
}

// Process each line obtained from the input.
getInputData().every(function(currentLine) {
    // Split the current line by space to get two parts.
    let lineParts = currentLine.split(' ');

    // Parse the first part as the height value (H).
    let heightVal = +lineParts[0];

    // Parse the second part as the width value (W).
    let widthVal = +lineParts[1];

    // Initialize an array to store the resulting grid rows.
    let resultGrid = new Array(heightVal);

    // Loop through each row index to construct the grid.
    for (let idx = 0; idx < resultGrid.length; idx++) {
        // Determine the pattern based on whether the row index is even or odd.
        // If even, use '#.'; if odd, use '.#'.
        // Repeat the pattern enough times (W+1) to ensure it covers the width.
        // Then, slice the string to the exact required width.
        resultGrid[idx] = new Array(widthVal + 1).join(!(idx % 2) ? '#.' : '.#').slice(0, widthVal);
    }

    // Check if both height and width are zero.
    // If so, return false to stop the 'every' iteration.
    // Otherwise, print the joined grid and return the negation of console.log's return value (which is undefined, so !undefined is true).
    return !heightVal && !widthVal ? false : !console.log(resultGrid.join("\n") + "\n");
});
