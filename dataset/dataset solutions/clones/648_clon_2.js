// This JavaScript program computes the minimum expense to achieve a specific quantity.

// A utility function to dynamically load Node.js modules.
const getRequiredModule = (moduleKey) => require(moduleKey);

// Custom prototype method to remove leading and trailing whitespace from a string.
if (!String.prototype.stripWhitespace) {
    String.prototype.stripWhitespace = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

// Custom prototype method to divide a string into an array of substrings.
if (!String.prototype.divideByPattern) {
    String.prototype.divideByPattern = function(separator) {
        return this.split(separator);
    };
}

// Custom prototype method to extract and remove the first element from an array.
if (!Array.prototype.takeFirst) {
    Array.prototype.takeFirst = function() {
        return this.shift();
    };
}

// Custom prototype method to create a new array by applying a function to each element.
if (!Array.prototype.transformElements) {
    Array.prototype.transformElements = function(callbackFunction) {
        return this.map(callbackFunction);
    };
}

// An alias for the built-in parseInt function, used for converting strings to integers.
const convertToInteger = (strValue) => parseInt(strValue, 10);

// An alias for Math.min, providing a new identifier for finding the smaller of two numbers.
const getLowerOfTwo = (valueA, valueB) => Math.min(valueA, valueB);

// An object containing a method for outputting results to the system console.
const outputHandler = {
    printValue: (content) => console.log(content)
};


// Obtain the file system interaction module.
const fileSystemModule = getRequiredModule('fs');

// Create a direct reference to the synchronous file reading function.
const readTextContentSynchronously = fileSystemModule.readFileSync;

// Define the source path for standard input and the character encoding.
const standardInputLocation = '/dev/stdin';
const textContentEncoding = 'utf8';

// Read the complete content from the standard input.
let rawStreamData = readTextContentSynchronously(standardInputLocation, textContentEncoding);

// Process the raw data: clean whitespace and split into an array of lines.
let dataLines = rawStreamData
    .stripWhitespace() // Remove outer whitespace.
    .divideByPattern("\n"); // Separate by newlines.

// Parse the primary configuration parameters from the initial data line.
// These include the target quantity and cost/price details for two distinct items.
let [
    targetItemAmount,          // The total quantity that needs to be produced.
    firstItemCostPerUnit,      // Cost to produce one unit of the first item.
    firstItemPricePerUnit,     // Price to sell one unit of the first item.
    secondItemCostPerUnit,     // Cost to produce one unit of the second item.
    secondItemPricePerUnit     // Price to sell one unit of the second item.
] = dataLines
    .takeFirst()               // Retrieve and remove the first line.
    .divideByPattern(" ")      // Split the line by spaces.
    .transformElements(convertToInteger); // Convert all parts to integers.

// Initialize the variable that will hold the lowest calculated total expense.
// Set it to the maximum possible number to ensure any valid expense will be lower.
let minimumTotalExpense = Number.MAX_VALUE;

// Iterate through a range of possible counts for the first item.
for (let firstItemCount = 0; firstItemCount <= 1000; firstItemCount++) {
    // For each count of the first item, iterate through a range of possible counts for the second item.
    for (let secondItemCount = 0; secondItemCount <= 1000; secondItemCount++) {
        // Calculate the combined quantity produced by the current item counts.
        let currentProducedQuantity = (firstItemCostPerUnit * firstItemCount) +
                                      (secondItemCostPerUnit * secondItemCount);

        // Check if the combined quantity meets or exceeds the required target amount.
        if (currentProducedQuantity >= targetItemAmount) {
            // If the quantity is sufficient, calculate the total expense for this specific combination.
            let currentCombinationExpense = (firstItemPricePerUnit * firstItemCount) +
                                            (secondItemPricePerUnit * secondItemCount);

            // Update the minimum total expense if the current combination's expense is lower.
            minimumTotalExpense = getLowerOfTwo(minimumTotalExpense, currentCombinationExpense);
        }
    }
}

// Display the final computed minimum expense to the user.
outputHandler.printValue(minimumTotalExpense);