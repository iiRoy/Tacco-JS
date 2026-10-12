var inputData = []; // Array to store all lines read from input
var ioHandler = require('readline'); // Module for handling line-by-line input

var inputReader = ioHandler.createInterface({
    input: process.stdin, // Standard input stream
    output: process.stdout, // Standard output stream (not actively used for writing in this script)
});

// Event listener for each line of input received
inputReader.on('line', function (currentLine) {
    inputData.push(currentLine); // Add the current line to our collection
});

// Event listener for when the input stream closes
inputReader.on('close', function () {
    // Define a large prime modulus for calculations
    var primeModulus = Math.pow(10, 9) + 7;

    // The first line of input is the size of the array
    var arraySize = Number(inputData.shift());
    // Initialize an array to hold the color values
    var colorArray = Array(arraySize);

    // Populate the color array from the remaining input lines
    for (var idx = 0; idx < arraySize; idx++) {
        colorArray[idx] = Number(inputData[idx]);
    }

    // Object to store the frequency of each color based on specific conditions
    var colorCounts = {};
    // Variable to accumulate the final sum
    var finalSum = 0;

    // Iterate through the color array, checking adjacent elements
    // If two adjacent elements are different, increment the count for the first element's color
    for (var idx = 0; idx < arraySize - 1; idx++) {
        if (colorArray[idx] !== colorArray[idx + 1]) {
            // If the color hasn't been seen yet, initialize its count to 1; otherwise, increment
            colorCounts[colorArray[idx]] === undefined ? colorCounts[colorArray[idx]] = 1 : colorCounts[colorArray[idx]]++;
        }
    }
    // The last element of the array is always counted once, unconditionally
    colorCounts[colorArray[arraySize - 1]]++;

    // Iterate over the keys (colors) in the colorCounts object
    Object.keys(colorCounts).forEach(function (colorKey) {
        // Add the number of combinations (picking 2 items) for the current color's count
        finalSum += calculateCombinations(colorCounts[colorKey], 2);
        // Apply the modulus to keep the sum within bounds
        finalSum %= primeModulus;
    });

    // Output the final calculated sum, adding 1 as per problem requirements (likely for an initial state or base case)
    console.log(finalSum + 1);
});

// Function to compute permutations P(n, m)
function calculatePermutations(totalItems, selectItems) {
    var permResult = 1; // Initialize the result for permutations
    var loopCounter = 0; // Counter for the loop iterations
    while (loopCounter < selectItems) {
        permResult *= totalItems; // Multiply the result by the current totalItems value
        totalItems--; // Decrement totalItems for the next iteration
        loopCounter++; // Increment the loop counter
    }
    return (permResult); // Return the computed permutation value
}

// Function to compute combinations C(n, m) using permutations
function calculateCombinations(totalItems, selectItems) {
    // C(n, m) = P(n, m) / P(m, m)
    return (calculatePermutations(totalItems, selectItems) / calculatePermutations(selectItems, selectItems));
}
