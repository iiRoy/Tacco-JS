process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming data from standard input
var globalInputBuffer = '';

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function(inputChunk) {
    globalInputBuffer += inputChunk;
});

// Event listener for 'end' of stdin stream
process.stdin.on('end', function() {
    // Split the accumulated input into lines and pass to the main processing function
    ProcessInputData(globalInputBuffer.split(/\r?\n/));
});

/**
 * Main function to process the input data.
 * @param {string[]} linesOfData - An array of strings, where each string is a line from the input.
 */
function ProcessInputData(linesOfData) {
    // Parse the first line to get the number of elements
    var countElements = parseInt(linesOfData[0], 10);

    // Split the second line to get string representations of array elements
    var stringArrayElements = linesOfData[1].split(' ');

    // Create a new array to store the parsed numeric elements
    var numericArray = new Array(countElements);

    // Populate the numeric array by parsing each string element
    for (var idx = 0; idx < countElements; idx++) {
        numericArray[idx] = parseInt(stringArrayElements[idx], 10);
    }

    // Call the recursive calculation function starting from index 0
    var finalResult = calculateRecursiveSum(0, numericArray);

    // Output the computed result to the console
    console.log(finalResult);

    // Return 0, indicating successful execution (though not typically used in Node.js scripts this way)
    return 0;
}

/**
 * Recursively calculates a sum based on array elements and their positions.
 * The calculation involves powers of 3 and conditional multiplication by 2.
 * @param {number} currentIndex - The current index in the array being processed.
 * @param {number[]} dataArray - The array of numbers to process.
 * @returns {number} The calculated sum for the current subproblem.
 */
function calculateRecursiveSum(currentIndex, dataArray) {
    // Base case: if the current index is beyond the array length, return 0
    if (currentIndex >= dataArray.length) {
        return 0;
    }

    // Initialize a partial sum for the current level
    var partialSumOne = 1;

    // Calculate 3 raised to the power of (dataArray.length - (currentIndex + 1))
    // This is equivalent to 3^(number of elements remaining after current)
    for (var loopIndex = currentIndex + 1; loopIndex < dataArray.length; loopIndex++) {
        partialSumOne *= 3;
    }

    // Recursively call the function for the next element
    var partialSumTwo = calculateRecursiveSum(currentIndex + 1, dataArray);

    // Initialize the result for the current step
    var currentResult = 0;

    // Apply conditional logic based on the parity of the current array element
    if (dataArray[currentIndex] % 2 === 0) {
        // If the element is even, apply this formula
        currentResult = partialSumOne + 2 * partialSumTwo;
    }
    else {
        // If the element is odd, apply this alternative formula
        currentResult = 2 * partialSumOne + partialSumTwo;
    }

    // Return the computed result for the current recursive step
    return currentResult;
}
