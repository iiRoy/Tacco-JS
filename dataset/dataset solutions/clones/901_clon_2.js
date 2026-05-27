var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into lines and remove leading/trailing whitespace
var lineData = rawData.trim().split("\n");

// Discard the first line, which typically contains the count of elements for the first array
lineData.shift();

// Extract and parse the first array of numbers
var firstArray = lineData.shift().split(" ").map(Number);

// Sort the first array in ascending numerical order
firstArray.sort(function(valA, valB) {
    return valA - valB;
});

// Discard the next line, which typically contains the count of elements for the second array
lineData.shift();

// Extract and parse the second array of numbers
var secondArray = lineData.shift().split(" ").map(Number);

// Extract and parse the third array of numbers
var thirdArray = lineData.shift().split(" ").map(Number);

// Initialize a large array to store precomputed cumulative sums
var cumulativeSums = [];

// Populate the cumulative sums array with a default 'false' value
// This array is indexed by the values from 'firstArray'
for (var idx = 0; idx < 1000000; idx++) {
    cumulativeSums[idx] = false;
}

// Set the base case: the cumulative sum for 0 is 0
cumulativeSums[0] = 0;

// Calculate and store cumulative sums for elements present in 'firstArray'
var currentTotal = 0;
firstArray.forEach(function(elementValue) {
    currentTotal += elementValue;
    cumulativeSums[elementValue] = currentTotal;
});

// Iterate through the second array to perform the main logic
secondArray.forEach(function(currentBValue, bIndex) {
    // Find the largest value less than or equal to 'currentBValue'
    // for which a cumulative sum has been precomputed
    while (true) {
        if (cumulativeSums[currentBValue] !== false) {
            break; // A valid cumulative sum was found
        }
        currentBValue--; // Decrement to check the next smaller value
    }
    // Compare the corresponding element from 'thirdArray' with the found cumulative sum
    // and print "Yes" or "No" based on the comparison
    console.log((thirdArray[bIndex] <= cumulativeSums[currentBValue]) ? "Yes" : "No");
});
