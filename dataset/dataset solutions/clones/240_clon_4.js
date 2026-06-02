const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const processLineData = (currentLine) => {
    // Parse the numeric values from the line.
    // Using split(" ") matches the original's behavior, where Number("") evaluates to 0.
    const coordinateValues = currentLine.split(" ").map(Number);

    // Destructure the array into named variables for clarity,
    // replacing the original's .apply(null, arr) pattern.
    const [
        rectA_x1, rectA_y1, rectA_x2, rectA_y2,
        rectB_x1, rectB_y1, rectB_x2, rectB_y2
    ] = coordinateValues;

    // Determine if there is an overlap along the X-axis.
    // An overlap exists if the maximum of the starting points is less than or equal to
    // the minimum of the ending points for that axis.
    const hasXAxisOverlap = Math.max(rectA_x1, rectB_x1) <= Math.min(rectA_x2, rectB_x2);

    // Determine if there is an overlap along the Y-axis using the same logic.
    const hasYAxisOverlap = Math.max(rectA_y1, rectB_y1) <= Math.min(rectA_y2, rectB_y2);

    // A full 2D overlap occurs only if both X and Y axes overlap.
    // This replaces the original's 'cnt' variable and two separate if statements.
    return (hasXAxisOverlap && hasYAxisOverlap) ? "YES" : "NO";
};

// Process each line of the input file.
// trim() removes leading/trailing whitespace, including a final newline if present.
// split('\n') creates an array of lines.
// map() transforms each line using the processLineData function.
const outputResults = fileContent.trim().split('\n').map(processLineData);

// Join all processed results with newlines and print to console.
// This replaces the original's line-by-line console.log within the forEach loop.
console.log(outputResults.join('\n'));
