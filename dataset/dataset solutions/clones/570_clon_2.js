var dataString = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
dataString = dataString.trim(); // Remove leading/trailing whitespace

var joiCount = 0; // Initialize counter for "JOI" occurrences
var ioiCount = 0; // Initialize counter for "IOI" occurrences

// Iterate through the string to find occurrences of "JOI" and "IOI"
for (var idx = 0; idx < dataString.length - 2; idx++) { // Loop up to length - 3 to allow for 3-character checks
    // Check for "JOI" pattern
    if (dataString[idx] + dataString[idx + 1] + dataString[idx + 2] === "JOI") {
        joiCount++; // Increment JOI counter
    }
    // Check for "IOI" pattern
    if (dataString[idx] + dataString[idx + 1] + dataString[idx + 2] === "IOI") {
        ioiCount++; // Increment IOI counter
    }
}

// Output the final counts
console.log(joiCount);
console.log(ioiCount);
