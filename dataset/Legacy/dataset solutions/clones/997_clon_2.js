(function(rawData) {
    // This function processes input data to find the maximum difference between elements.

    // Split the raw input string by newline characters and convert each part to a number.
    var parsedNumbers = rawData.split('\n').map(Number);

    // The first number in the input indicates the count of elements to consider.
    var countElements = parsedNumbers.shift();

    // Extract the actual numeric array based on the specified count.
    var numericArray = parsedNumbers.slice(0, countElements);

    // Initialize a variable to store the greatest difference found so far.
    // Start with negative infinity to ensure any valid difference will be greater.
    var greatestDifference = -Infinity;

    // Iterate through the array with an outer loop.
    for (var outerIndex = 0; outerIndex < numericArray.length; outerIndex++) {
        // Use an inner loop that starts one position after the outer loop's current index.
        // This ensures we always compare a later element with an earlier one.
        for (var innerIndex = outerIndex + 1; innerIndex < numericArray.length; innerIndex++) {
            // Calculate the difference between the current pair of elements.
            // If this difference is greater than the currently stored greatest difference, update it.
            if (numericArray[innerIndex] - numericArray[outerIndex] > greatestDifference) {
                greatestDifference = numericArray[innerIndex] - numericArray[outerIndex];
            }
        }
    }

    // Output the final calculated greatest difference to the console.
    console.log(greatestDifference);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input using Node.js file system module.
