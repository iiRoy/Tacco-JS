// Import the Node.js file system module to handle input operations.
var rawData = require('fs')
    // Synchronously read the entire content of the standard input file.
    .readFileSync('/dev/stdin', 'utf8')
    // Remove any leading or trailing whitespace from the input string.
    .trim();

// Split the processed input string into an array of individual lines, using the newline character as a delimiter.
var dataRows = rawData.split('\n');

// Begin an infinite loop to process input pairs until a specific termination condition is met.
while (true) {
    // Extract the first line from the 'dataRows' array, convert it to a number, and assign it to 'baseSide'.
    var baseSide = +dataRows.shift();
    // Extract the next line from the 'dataRows' array, convert it to a number, and assign it to 'heightVal'.
    var heightVal = +dataRows.shift();

    // Check if the sum of the two extracted numbers is exactly zero.
    // This condition typically signals the end of input in competitive programming problems.
    if (baseSide + heightVal === 0) {
        break; // If the condition is true, exit the infinite loop.
    }

    // Calculate the total surface area of a square pyramid.
    // The formula used is: (base area) + (lateral surface area)
    // Base area = baseSide * baseSide
    // Lateral surface area = baseSide * Math.sqrt(4 * heightVal * heightVal + baseSide * baseSide)
    // This formula correctly calculates the sum of the base area and the area of the four triangular faces.
    var totalSurfaceArea = (baseSide * baseSide) + (baseSide * Math.sqrt(4 * heightVal * heightVal + baseSide * baseSide));

    // Print the calculated total surface area to the console, formatted to exactly 6 decimal places.
    console.log(totalSurfaceArea.toFixed(6));
}
