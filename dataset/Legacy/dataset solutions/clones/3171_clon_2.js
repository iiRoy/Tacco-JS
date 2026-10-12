"use strict";

/**
 * This function processes a given input string to calculate a total monetary value.
 * It reads the number of entries from the first line, then iterates through
 * subsequent lines, parsing amounts and currency types.
 * Bitcoin (BTC) amounts are converted using a fixed exchange rate.
 *
 * @param {string} rawData - The complete input string, typically read from standard input,
 *                           where lines are separated by newline characters.
 */
function ProcessInput(rawData) {
    // Divide the entire input string into an array of individual lines.
    let inputLines = rawData.split("\n");

    // The very first line of the input specifies the total count of data entries
    // that follow. We convert this string to a numerical value.
    let numEntries = inputLines[0] - 0;

    // Initialize a variable to store the cumulative sum of all processed values.
    // This will hold our final result.
    let totalValue = 0;

    // Begin a loop that iterates through each data entry.
    // The loop starts from index 1 because index 0 contained the entry count.
    // It continues as long as the current index is less than or equal to the total number of entries.
    for (let idx = 1; idx <= numEntries; idx++) {
        // For each line representing an entry, split it by any whitespace character.
        // This separates the numerical amount from its associated currency type.
        let entryParts = inputLines[idx].split(/\s/);

        // Extract the numerical amount from the first part of the split line
        // and convert it into a number.
        let amount = entryParts[0] - 0;

        // Conditionally add the amount to our running total.
        // If the currency type (the second part of the split line) is 'BTC',
        // we multiply the amount by a predefined conversion rate (380,000.0).
        // Otherwise, if it's any other currency, we add the amount as is.
        totalValue += (entryParts[1] == 'BTC') ? amount * 380000.0 : amount;
    }

    // After processing all entries, print the final calculated total value to the console.
    console.log(totalValue);
}

// The program execution starts here.
// It reads the entire content of standard input as a UTF-8 encoded string
// and then passes this string to the 'ProcessInput' function for processing.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
