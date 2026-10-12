var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input path
var lines = rawData.trim().split("\n"); // Split the raw input data into an array of lines

lines.shift(); // Discard the first line (usually a count, not needed for processing here)

var firstNumArray = lines.shift().split(" ").map(Number); // Take the next line, split by space, and convert to numbers
firstNumArray.sort(function(valA, valB) { // Sort the array of numbers in ascending order
    return valA - valB;
});

lines.shift(); // Discard another line (another count, also not used directly)

var secondNumArray = lines.shift().split(" ").map(Number); // Get the next line, split, and convert to numbers
var stringArray = lines.shift().split(" "); // Get the final line, split by space, keeping as strings

var prefixSums = []; // Initialize an array to store prefix sums for quick lookup

// Populate the prefixSums array with a sentinel value (-1)
// This array will store the cumulative sum up to each number encountered in firstNumArray.
for (var i = 0; i < 1000000; i++) {
    prefixSums[i] = -1;
}

prefixSums[0] = [0, 0]; // The sum up to 0 is [0, 0] (base case for large number arithmetic)

var currentTotal = [0, 0]; // Initialize a two-part array to handle large sums (higher part, lower part)
// The lower part handles numbers up to 1,000,000,000 - 1.

firstNumArray.forEach(function(currentVal) { // Iterate through each number in the sorted first array
    currentTotal[1] += currentVal; // Add the current number to the lower part of the running total

    // Check if the lower part has overflowed (exceeded 1,000,000,000)
    if (currentTotal[1] >= 1000000000) {
        currentTotal[0]++; // Increment the higher part of the total
        currentTotal[1] -= 1000000000; // Subtract the overflow amount from the lower part
    }
    // Store a copy of the current total at the index corresponding to the current value
    // This means prefixSums[X] will hold the sum of all numbers in firstNumArray up to X.
    prefixSums[currentVal] = currentTotal.slice();
});

secondNumArray.forEach(function(targetVal, idx) { // Process each target value from the second array
    // Find the largest value less than or equal to targetVal for which a prefix sum is stored
    while (true) {
        if (prefixSums[targetVal] !== -1) { // If a valid prefix sum is found, break the loop
            break;
        }
        targetVal--; // Decrement targetVal and try the next smaller number
    }

    var currentString = stringArray[idx]; // Get the corresponding string from the third array

    // Parse the string into a two-part large number representation
    // The string is split into a higher part (all but last 9 digits) and a lower part (last 9 digits).
    var parsedBigInt = [
        currentString.slice(0, currentString.length - 9) - 0, // Convert higher part to number
        currentString.slice(-9) - 0 // Convert lower part to number
    ];

    var resultString = ""; // Initialize the string to store the comparison result

    // Compare the parsed big integer with the calculated prefix sum
    if (parsedBigInt[0] < prefixSums[targetVal][0]) { // If the higher part of the parsed number is smaller
        resultString = "Yes";
    }
    // If higher parts are equal, compare the lower parts
    else if (parsedBigInt[0] === prefixSums[targetVal][0] && parsedBigInt[1] <= prefixSums[targetVal][1]) {
        resultString = "Yes";
    }
    else { // Otherwise, the parsed big integer is larger than the prefix sum
        resultString = "No";
    }
    console.log(resultString); // Output the comparison result
});
