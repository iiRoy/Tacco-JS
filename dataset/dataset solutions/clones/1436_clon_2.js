/* This module calculates the Euclidean distance between two 2D points. */
function ProcessCoordinates (rawData) { // Primary routine to handle coordinate data.

    // Parse the incoming string data into an array of numbers.
    // It first removes leading/trailing spaces, then splits by any whitespace or newline,
    // and finally converts each resulting string fragment into a numerical value.
    var numericValues = rawData.trim()
                                .split(/\s|\n/)
                                .map(Number);

    // Calculate the difference in X-coordinates (horizontal displacement).
    let deltaX = numericValues[2] - numericValues[0];

    // Determine the difference in Y-coordinates (vertical displacement).
    let deltaY = numericValues[3] - numericValues[1];

    // Output the computed straight-line distance.
    // The distance is found using the Pythagorean theorem: sqrt(dx^2 + dy^2).
    console.log(
        Math.sqrt(
            deltaX * deltaX + deltaY * deltaY
        )
    );
}

// Execute the main processing function by reading input from standard input.
// This uses Node.js 'fs' module to synchronously read the entire file content.
ProcessCoordinates(
    require("fs").readFileSync("/dev/stdin", "utf8")
);