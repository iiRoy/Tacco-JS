var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineData = rawData.trim().split("\n"); // Split the input into an array of lines, removing leading/trailing whitespace

// Main processing loop
while (true) {
    // Extract the current number from the beginning of the lineData array
    // The '-0' converts the string to a number
    var currentNum = lineData.shift() - 0;

    // If the number is 0, terminate the loop
    if (currentNum === 0) {
        break;
    }

    // Calculate the cube of the current number
    var cubeOfNum = currentNum * currentNum * currentNum;

    // Initialize an empty array to store calculated differences
    var resultsList = [];

    // Outer loop: iterates from (currentNum - 1) down to 1
    for (var outerIdx = currentNum - 1; outerIdx > 0; outerIdx--) {
        // Inner loop: iterates from outerIdx down to 1
        for (var innerIdx = outerIdx; innerIdx > 0; innerIdx--) {
            // Calculate the difference: cubeOfNum - outerIdx^3 - innerIdx^3
            var diffVal = cubeOfNum - outerIdx * outerIdx * outerIdx - innerIdx * innerIdx * innerIdx;

            // If the difference is positive, add it to the results list
            if (diffVal > 0) {
                resultsList.push(diffVal);
            }
        }
    }

    // Print the minimum value found in the resultsList
    console.log(Math.min.apply(null, resultsList));
}
