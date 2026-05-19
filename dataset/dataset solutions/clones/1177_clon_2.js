(function(rawData) {
    // Split the entire input string into an array of lines
    var lineSegments = rawData.split('\n');

    // Loop indefinitely until a specific condition is met
    while (true) {
        // Extract the first line, convert it to a number, and store it as the count
        var countOfElements = Number(lineSegments.shift());

        // If the count is zero, it signifies the end of input, so exit the function
        if (countOfElements === 0) {
            return;
        }

        // Get the next line, split it by spaces, take 'countOfElements' parts, and convert them to numbers
        var numericValues = lineSegments.shift().split(' ', countOfElements).map(Number);

        // Calculate and print the standard deviation for the current set of numbers
        console.log(determineStdDev(numericValues));
    }

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input using Node.js file system module


/**
 * Computes the arithmetic average of an array of numbers.
 * @param {number[]} dataArray - The array of numbers.
 * @returns {number} The mean value.
 */
function calculateAverage(dataArray) {
    // Sum all elements and divide by the total count of elements
    return dataArray.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
    }) / dataArray.length;
}

/**
 * Calculates the variance of an array of numbers.
 * @param {number[]} dataArray - The array of numbers.
 * @returns {number} The variance value.
 */
function computeDispersion(dataArray) {
    // First, find the average of the dataset
    var avgValue = calculateAverage(dataArray);
    var dispersionSum = 0; // Initialize sum for squared differences

    // Iterate through each element to calculate the sum of squared differences from the mean
    dataArray.forEach(function(elementValue) {
        // Add the squared difference of the element from the mean, divided by the total count
        dispersionSum += Math.pow(elementValue - avgValue, 2) / dataArray.length;
    });

    return dispersionSum; // Return the calculated variance
}

/**
 * Determines the standard deviation of an array of numbers.
 * @param {number[]} dataArray - The array of numbers.
 * @returns {number} The standard deviation value.
 */
function determineStdDev(dataArray) {
    // The standard deviation is the square root of the variance
    return Math.sqrt(computeDispersion(dataArray));
}
