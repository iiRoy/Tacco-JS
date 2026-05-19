let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

let lineSegments = (rawData.trim()).split("\n"); // Split the input into an array of lines.

lineSegments.forEach(function(currentLine) {
    // For each line, parse the numeric values.
    let numericValues = currentLine.split(" ").map(Number);

    let overlapCount = 0; // Initialize a counter for dimensional overlaps.

    // Define an anonymous function to check for interval overlaps and immediately execute it.
    (function(firstX1, firstY1, firstX2, firstY2, secondX1, secondY1, secondX2, secondY2) {
        // Check if the X-intervals overlap.
        // An overlap occurs if the end of the second interval is not before the start of the first,
        // AND the start of the second interval is not after the end of the first.
        if (secondX2 >= firstX1 && secondX1 <= firstX2) {
            overlapCount++; // Increment if X-axis intervals intersect.
        }

        // Check if the Y-intervals overlap using the same logic.
        if (secondY2 >= firstY1 && secondY1 <= firstY2) {
            overlapCount++; // Increment if Y-axis intervals intersect.
        }
    }).apply(null, numericValues); // Pass the parsed numbers as arguments to the function.

    // Output "YES" if both X and Y dimensions showed an overlap, otherwise "NO".
    console.log((overlapCount === 2) ? "YES" : "NO");
});
