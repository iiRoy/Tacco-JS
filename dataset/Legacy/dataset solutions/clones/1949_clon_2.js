let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input as a UTF-8 string

// Convert the input string into an array of characters (though not strictly used as such,
// its length is used for loop bounds, similar to the original's N.length)
let charArray = rawData.split('');

// Initialize a counter for the number of valid substrings
let resultCount = 0;

// Outer loop iterates through possible starting positions of substrings
for (let outerIndex = 0; outerIndex < charArray.length; outerIndex++) {
    // Inner loop iterates through possible ending positions of substrings
    // The condition 'outerIndex + 4' ensures a minimum substring length of 4 characters
    // 'charArray.length - 1' is the last valid index for substring end
    for (let innerIndex = outerIndex + 4; innerIndex <= charArray.length; innerIndex++) {
        // Extract a substring from the original raw data
        // parseInt converts it to an integer with base 10
        let currentValue = parseInt(rawData.substring(outerIndex, innerIndex), 10);

        // Check if the parsed integer is divisible by 2019
        if (currentValue % 2019 === 0) {
            // If divisible, increment the result counter
            resultCount++;
        }
    }
}

// Output the final count of substrings divisible by 2019
console.log(resultCount);
