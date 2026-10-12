var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineBuffer = (rawData.trim()).split("\n"); // Stores each line from the input

while (true) {
    // Retrieve the next line for processing
    var currentLine = lineBuffer.shift();

    // Check for the termination condition of the input stream
    if (currentLine === "#") {
        break; // Exit the main processing loop
    }

    // Remove specific directional suffixes to simplify the string
    currentLine = currentLine.replace(/orth|est/g, "");

    // Reverse the string to process characters in a specific order for angle calculation
    currentLine = currentLine.split("").reverse().join("");

    var angleValue = 0; // Initialize the calculated angle

    // Determine the base angle based on the first character
    if (currentLine[0] === "n") {
        angleValue = 0; // 'n' sets the initial angle to 0 degrees
    }
    if (currentLine[0] === "w") {
        angleValue = 90; // 'w' sets the initial angle to 90 degrees
    }

    // Iterate through the remaining characters to refine the angle
    for (var idx = 1; idx < currentLine.length; idx++) {
        // Adjust the angle based on subsequent 'n' or 'w' characters
        if (currentLine[idx] === "n") {
            angleValue -= 90 / Math.pow(2, idx); // Subtract a fractional angle
        }
        if (currentLine[idx] === "w") {
            angleValue += 90 / Math.pow(2, idx); // Add a fractional angle
        }
    }

    // Find the smallest integer multiplier to express the angle as an integer or a simple fraction
    var multiplier = 1;
    while (true) {
        // Check if the angle, when multiplied, becomes an integer
        if ((angleValue * multiplier) % 1 === 0) {
            // If the multiplier is 1, the angle is already an integer, no fractional representation needed
            if (multiplier === 1) {
                break;
            }
            // Format the angle as a string representing a fraction
            angleValue = "" + (angleValue * multiplier) + "/" + multiplier;
            break; // Exit the inner loop once the fraction is found
        }
        multiplier++; // Increment multiplier and try again
    }

    // Output the final calculated angle or its fractional representation
    console.log(angleValue);
}
