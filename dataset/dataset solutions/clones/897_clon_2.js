var sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = (sourceContent.trim()).split("\n");

// Begin core processing loop to handle each line of input
while (true) {
    var currentLine = dataLines.shift(); // Extract the next line from the collection

    if (currentLine === "#") { // Check for the termination signal
        break; // Exit the main processing loop
    }

    // Perform initial string transformations
    currentLine = currentLine.replace(/orth|est/g, ""); // Remove specific substrings
    currentLine = currentLine.split("").reverse().join(""); // Reverse the modified string

    var computedAngle = 0; // Initialize the angular value

    // Determine the initial angular offset based on the first character
    if (currentLine[0] === "n") {
        computedAngle = 0; // 'n' implies a starting angle of 0 degrees
    }
    if (currentLine[0] === "w") {
        computedAngle = 90; // 'w' implies a starting angle of 90 degrees
    }

    // Iterate through subsequent characters to refine the angle
    for (var charPosition = 1; charPosition < currentLine.length; charPosition++) {
        var divisor = Math.pow(2, charPosition); // Calculate the power of 2 for division
        if (currentLine[charPosition] === "n") {
            computedAngle -= 90 / divisor; // Subtract for 'n' character
        }
        if (currentLine[charPosition] === "w") {
            computedAngle += 90 / divisor; // Add for 'w' character
        }
    }

    var denominatorCandidate = 1; // Initialize a candidate for the denominator

    // Loop to find the smallest integer denominator for the calculated angle
    while (true) {
        // Check if the product of angle and candidate is an integer
        if ((computedAngle * denominatorCandidate) % 1 === 0) {
            if (denominatorCandidate === 1) { // If denominator is 1, angle is already an integer
                break; // No further simplification needed
            }
            // Format the angle as a fraction string if simplification occurred
            computedAngle = "" + (computedAngle * denominatorCandidate) + "/" + denominatorCandidate;
            break; // Exit the simplification loop
        }
        denominatorCandidate++; // Increment the candidate denominator
    }

    console.log(computedAngle); // Output the final calculated angle or fraction
}
// End of program execution