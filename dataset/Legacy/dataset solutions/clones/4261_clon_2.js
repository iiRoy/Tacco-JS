// This function serves as a standard output mechanism.
function logMessage(messageContent) {
    console.log(messageContent);
}

// The primary function to process the incoming data.
function processInputData(rawData) {
    // Convert the raw input string into an integer value.
    var numericValue = parseInt(rawData);

    // Initialize a variable to keep track of the smallest sum of digits found.
    // A large initial value ensures any valid sum will be smaller.
    var minimumSum = 1000000000;

    // Iterate through a range of multipliers from 1 to 100,000.
    for (var multiplier = 1; multiplier <= 100000; multiplier++) {
        // Calculate the product of the numeric value and the current multiplier.
        // Convert the product to a string, then split it into an array of individual digit characters.
        // Finally, map each character back to its numeric representation.
        var digitArray = (numericValue * multiplier).toString().split("").map(function(charDigit) {
            return Number(charDigit);
        });

        // Initialize a temporary variable to sum the digits of the current product.
        var currentSum = 0;

        // Loop through the array of digits and add each digit to the current sum.
        for (var digitIndex = 0; digitIndex < digitArray.length; digitIndex++) {
            currentSum += digitArray[digitIndex];
        }

        // Update the minimumSum if the current product's digit sum is smaller.
        minimumSum = Math.min(minimumSum, currentSum);
    }

    // Output the final calculated minimum sum of digits.
    logMessage(minimumSum);
}

// Read the input from standard input, remove any leading/trailing whitespace,
// and then pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
