let fileSystemModule = require("fs"); // Import the file system module for I/O operations.

/**
 * Calculates a projected value based on an initial amount and a growth factor over time.
 * This function simulates a compound growth scenario.
 * @param {number} numberOfPeriods - The total number of periods for which the growth is applied.
 * @returns {number} The final calculated value after all periods, scaled by a constant.
 */
function calculateFutureValue(numberOfPeriods) {
    // Initialize the starting principal amount for the calculation.
    let principalAmount = 100;

    // Iterate through each period to apply the growth.
    for (let iterationIndex = 0; iterationIndex < numberOfPeriods; iterationIndex++) {
        // Apply a 5% growth rate to the current principal and round the result up.
        principalAmount = Math.ceil(principalAmount * 1.05);
    }

    // Return the final principal amount, multiplied by a specific scaling factor.
    return principalAmount * 1000;
}

// Read the entire content from standard input, convert it to a string, and remove any leading/trailing whitespace.
let rawInputData = fileSystemModule.readFileSync('/dev/stdin').toString().trim();

// Parse the cleaned input string into an integer and then pass it to our calculation function.
// The final computed result is then outputted to the console.
console.log(calculateFutureValue(parseInt(rawInputData)));
