let calculationFragment = '+= currentRadius * Math.'; // String portion for dynamic calculation of coordinate increments
let angularExpression = '(cumulativeAngle * Math.PI / 180)'; // String portion for angle conversion to radians

let currentXCoordinate = 0; // Initialize horizontal position to zero
let currentYCoordinate = 0; // Initialize vertical position to zero
let cumulativeAngle = 0; // Initialize total angle traversed to zero

// Use Node.js file system capabilities to read standard input synchronously.
require("fs")
    .readFileSync("/dev/stdin", "utf8") // Read the entire input stream as a UTF-8 string.
    .trim() // Eliminate any leading or trailing whitespace from the input.
    .split('\n') // Divide the string into an array of separate lines.
    .some(function(inputLine) { // Iterate through each line, stopping if a truthy value is returned.
        // Split the current line by a comma to get two numeric string parts.
        const lineData = inputLine.split(',');
        const currentRadius = +lineData[0]; // Convert the first part to a number (magnitude).
        const angleDelta = +lineData[1]; // Convert the second part to a number (angle change).

        // Only perform calculations if both the radius and angle change are valid (non-zero).
        if (currentRadius && angleDelta) {
            // Dynamically construct and execute code to update X and Y coordinates.
            // This effectively translates to:
            // currentXCoordinate += currentRadius * Math.sin(cumulativeAngle * Math.PI / 180);
            // currentYCoordinate += currentRadius * Math.cos(cumulativeAngle * Math.PI / 180);
            eval('currentXCoordinate' + calculationFragment + 'sin' + angularExpression +
                 ',currentYCoordinate' + calculationFragment + 'cos' + angularExpression);
            
            // Add the current angle increment to the total accumulated angle.
            cumulativeAngle += angleDelta;
        }
        // The .some() method continues processing all lines as this callback always returns undefined (falsy).
    });

// Print the final calculated X coordinate, truncated to an integer.
console.log(~~currentXCoordinate);

// Print the final calculated Y coordinate, also truncated to an integer.
console.log(~~currentYCoordinate);