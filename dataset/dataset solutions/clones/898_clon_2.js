var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data by trimming whitespace and splitting into individual lines.
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop. Continues until a specific termination character is found.
while (true) {
    // Retrieve the next line segment from the array.
    var currentSegment = lineSegments.shift();

    // Check for the termination condition.
    if (currentSegment === "#") {
        break; // Exit the loop if the segment is "#".
    }

    // Remove specific substrings ("orth" and "est") from the current segment.
    currentSegment = currentSegment.replace(/orth|est/g, "");

    // Initialize a variable to accumulate the calculated angle.
    var totalAngle = 0;

    // Determine the initial angle based on the first character of the segment.
    if (currentSegment[0] === "n") {
        totalAngle = 0;
    }
    if (currentSegment[0] === "w") {
        totalAngle = 90;
    }

    // Store the first character for comparison in the upcoming loop.
    var previousChar = currentSegment[0];
    // Initialize an exponent counter for the angle calculation.
    var powerExponent = 1;

    // Iterate through the segment starting from the second character.
    for (var charIndex = 1; charIndex < currentSegment.length; charIndex++) {
        // Adjust the total angle based on the current character and the previous character.
        if (currentSegment[charIndex] === "n" && previousChar !== "n") {
            totalAngle -= 90 / Math.pow(2, powerExponent);
        }
        if (currentSegment[charIndex] === "w" && previousChar !== "w") {
            totalAngle += 90 / Math.pow(2, powerExponent);
        }

        // Update the exponent counter: increment if the character is the same, reset to 1 otherwise.
        powerExponent = (previousChar === currentSegment[charIndex]) ? powerExponent + 1 : 1;
        // Update the previous character for the next iteration.
        previousChar = currentSegment[charIndex];
    }

    // Initialize a denominator candidate for fraction simplification.
    var denominatorCandidate = 1;
    // Loop to find the smallest integer denominator to represent the angle as a fraction.
    while (true) {
        // Check if the product of the total angle and the candidate is an integer.
        if ((totalAngle * denominatorCandidate) % 1 === 0) {
            // If the candidate is 1, the angle is already an integer or can be represented as X/1.
            if (denominatorCandidate === 1) {
                break;
            }
            // If a suitable denominator is found, format the angle as a string fraction.
            totalAngle = "" + (totalAngle * denominatorCandidate) + "/" + denominatorCandidate;
            break; // Exit the simplification loop.
        }
        denominatorCandidate++; // Increment the candidate and try again.
    }

    // Output the final calculated angle or fraction to the console.
    console.log(totalAngle);
}
