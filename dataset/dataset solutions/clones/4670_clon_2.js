var inputLines = []; // Array to store all input lines from stdin
var nodeReadline = require('readline'); // Import the standard Node.js 'readline' module

// Create an interface for reading input line by line
var inputHandler = nodeReadline.createInterface({
    input: process.stdin, // Standard input stream
    output: process.stdout, // Standard output stream (not used for direct output here, but required by interface)
});

// Event listener for each line of input received
inputHandler.on('line', function (currentLine) {
    inputLines.push(currentLine); // Add the current line to our collection
});

// Event listener for when the input stream closes (EOF)
inputHandler.on('close', function () {
    // Process the first line of input
    var tempData = inputLines.shift(); // Get and remove the first line
    var parts = tempData.split(" "); // Split it by space

    var countElements = Number(parts[0]); // N: Total number of elements
    var minSelection = Number(parts[1]); // A: Minimum number of elements to select
    var maxSelection = Number(parts[2]); // B: Maximum number of elements to select

    var valueArray = new Array(countElements); // Initialize an array to hold the numbers

    // Process the second line of input, which contains the numbers
    tempData = inputLines.shift().split(" "); // Get and remove the second line, then split
    for (var idx = 0; idx < countElements; idx++) {
        valueArray[idx] = Number(tempData[idx]); // Convert each part to a number and store
    }

    // Sort the array in descending order to easily pick the largest values
    valueArray.sort(function (valA, valB) {
        return (valB - valA); // Descending sort
    });

    var calculatedAverage = 0; // Variable to store the sum for average calculation
    var valueCounts = {}; // Object to store frequency of each number

    // Iterate through the sorted array to calculate sum for average and count frequencies
    for (var idx = 0; idx < countElements; idx++) {
        // Sum the first 'minSelection' elements for the average
        if (idx < minSelection) {
            calculatedAverage += valueArray[idx];
        }

        // Initialize count if number is seen for the first time
        if (valueCounts[valueArray[idx]] === undefined) {
            valueCounts[valueArray[idx]] = 0;
        }
        valueCounts[valueArray[idx]]++; // Increment count for the current number
    }

    // Finalize average calculation
    calculatedAverage /= minSelection;
    console.log(calculatedAverage); // Output the calculated average

    var currentCount = 0; // Counter for elements processed in the combination logic
    var tempVarOne = 1; // A temporary variable, initialized to 1 as in original

    var totalCombinations; // Variable to store the final combination count

    // Check if the smallest of the 'minSelection' largest numbers is different from the largest
    // This determines which combination calculation path to take
    if (valueArray[0] !== valueArray[minSelection - 1]) {
        totalCombinations = 1; // Initialize combinations for this path

        // Iterate through the array to calculate combinations
        for (var idx = 0; idx < countElements; idx++) {
            // If the current number appears at least twice
            if (valueCounts[valueArray[idx]] >= 2) {
                var loopIndex; // Temporary index for combination function
                // Determine 'j' based on remaining slots for 'minSelection'
                if (valueCounts[valueArray[idx]] > (minSelection - currentCount)) {
                    loopIndex = minSelection - currentCount;
                } else {
                    loopIndex = valueCounts[valueArray[idx]];
                }

                // Multiply total combinations by the combinations of current number
                totalCombinations *= calculateCombinations(valueCounts[valueArray[idx]], loopIndex);
                currentCount += valueCounts[valueArray[idx]]; // Update processed count
                idx += valueCounts[valueArray[idx]] - 1; // Skip already processed identical numbers
            } else {
                currentCount += valueCounts[valueArray[idx]]; // Just update count for unique numbers
            }
        }
    } else {
        // If all numbers from 0 to minSelection-1 are the same
        totalCombinations = 0; // Initialize combinations for this path

        // Sum combinations for selecting 'j' items, where 'j' ranges from 'minSelection' to 'maxSelection'
        for (var loopIndex = minSelection; loopIndex <= maxSelection; loopIndex++) {
            totalCombinations += calculateCombinations(valueCounts[valueArray[0]], loopIndex);
        }
    }
    console.log(totalCombinations); // Output the total combinations
});

/**
 * Calculates the number of permutations (nPr).
 * @param {number} totalItems - The total number of items (n).
 * @param {number} selectedItems - The number of items to choose (r).
 * @returns {number} The number of permutations.
 */
function calculatePermutations(totalItems, selectedItems) {
    var resultValue = 1; // Initialize result
    for (var iter = 0; iter < selectedItems; iter++) {
        resultValue *= totalItems - iter; // Multiply by (n-0), (n-1), ..., (n-(r-1))
    }
    return resultValue;
}

/**
 * Calculates the number of combinations (nCr).
 * @param {number} totalItems - The total number of items (n).
 * @param {number} selectedItems - The number of items to choose (r).
 * @returns {number} The number of combinations.
 */
function calculateCombinations(totalItems, selectedItems) {
    // nCr = nPr / rPr
    return calculatePermutations(totalItems, selectedItems) / calculatePermutations(selectedItems, selectedItems);
}
