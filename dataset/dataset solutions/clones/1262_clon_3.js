// Acquire raw content from the standard input stream, ensuring UTF-8 encoding.
const rawDataString = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the input into individual line entries, handling various newline conventions.
// We also trim the overall input to prevent issues with leading/trailing whitespace or empty lines.
const dimensionLines = rawDataString.trim().split(/\r?\n/);

// A container to hold all generated rectangular patterns before final output.
const generatedPatterns = [];

// Helper function to check if a numeric value indicates termination.
const isTerminationValue = (val) => val === 0;

// Iterate through each line of dimension specifications.
for (let lineIndex = 0; lineIndex < dimensionLines.length; ++lineIndex) {
    const currentLine = dimensionLines[lineIndex];

    // Attempt to parse the numeric dimensions from the current line.
    // We expect two space-separated integers.
    const numericDimensions = currentLine.split(' ').map(Number);

    // Validate if we have exactly two dimensions and they are indeed valid numbers.
    if (numericDimensions.length !== 2 || numericDimensions.some(isNaN)) {
        // If a line is malformed, we can choose to skip it or handle an error.
        // For this clone, we'll simply proceed to the next line.
        continue;
    }

    // Assign parsed values to descriptive identifiers using destructuring for conciseness.
    const [rectangleHeight, rectangleWidth] = numericDimensions;

    // This specific condition (0 0) signals the termination of input processing.
    if (isTerminationValue(rectangleHeight) && isTerminationValue(rectangleWidth)) {
        break; // Exit the processing loop as per problem specification.
    }

    // Guard clause: ensure dimensions are positive for drawing.
    // While 0xN or Nx0 technically produce empty output (or a line/column),
    // negative dimensions are typically invalid for graphical representation tasks.
    if (rectangleHeight <= 0 || rectangleWidth <= 0) {
        // Skipping invalid or empty dimension sets.
        continue;
    }

    // Now, let's construct the visual representation of the hollow rectangle.
    // We'll build each row as an array of characters and then join them.
    const currentRectangleRows = [];

    // Loop through each row index of the rectangle.
    for (let currentY = 0; currentY < rectangleHeight; ++currentY) {
        const rowCharacters = []; // Buffer for characters in the current row.

        // Determine if the current row is a border row (first or last row).
        const isTopOrBottomEdge = (currentY === 0 || currentY === rectangleHeight - 1);

        // Loop through each column index in the current row.
        for (let currentX = 0; currentX < rectangleWidth; ++currentX) {
            // Determine if the current column is a border column (first or last column).
            const isLeftOrRightEdge = (currentX === 0 || currentX === rectangleWidth - 1);

            // Decide whether to place a '#' (border) or '.' (interior).
            // The character is '#' if it's on any of the four edges, otherwise it's '.'.
            rowCharacters.push(isTopOrBottomEdge || isLeftOrRightEdge ? '#' : '.');
        }
        // Join the characters to form the complete row string and add it to our collection of rows.
        currentRectangleRows.push(rowCharacters.join(''));
    }
    // Add the fully constructed rectangle string (with newlines between rows) to our collection.
    generatedPatterns.push(currentRectangleRows.join('\n'));
}

// Finally, output all collected patterns to standard output.
// Each pattern block is followed by an additional newline for separation.
for (const patternBlock of generatedPatterns) {
    process.stdout.write(patternBlock + '\n');
}