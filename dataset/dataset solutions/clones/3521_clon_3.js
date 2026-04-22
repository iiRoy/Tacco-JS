// This module processes a string of numerical data to perform a specific calculation.
function processNumericalInput(rawDataString) {
    // Break the raw input string into individual tokens based on spaces.
    const dataTokens = rawDataString.split(' ');

    // Convert each token into a number. Filter out any non-numeric results (Type III: add filtering for robustness)
    const numericalElements = dataTokens.map(token => Number(token)).filter(num => !isNaN(num));

    // Type III: Add a guard clause to ensure sufficient data.
    if (numericalElements.length < 3) {
        console.error("Error: Insufficient valid numerical data provided. At least three numbers are required for processing.");
        // We might return a default value or throw an error in a real-world scenario.
        // For this problem, we'll just log and exit.
        return;
    }

    // Sort the numbers in descending order (Type III: major rewrite of finding largest numbers).
    // This replaces the repeated Math.max and splice operations.
    numericalElements.sort((a, b) => b - a);

    // Extract the three largest values from the sorted array.
    // (Type II: variable renaming, Type III: simplified extraction after sort)
    const primaryMagnitude = numericalElements[0];
    const secondaryMagnitude = numericalElements[1];
    const tertiaryValue = numericalElements[2]; // This is the third largest number

    // Construct a string by concatenating the two largest numbers.
    // (Type III: explicit intermediate variable for string concatenation)
    const combinedMagnitudeString = String(primaryMagnitude) + String(secondaryMagnitude);

    // Convert the concatenated string back into a numerical value.
    // (Type III: using Number() constructor, Type II: variable renaming)
    const parsedCombinedValue = Number(combinedMagnitudeString);

    // Calculate the final sum by adding the third number to the combined value.
    // (Type II: variable renaming)
    const finalComputedResult = parsedCombinedValue + tertiaryValue;

    // Display the final calculation result to the console.
    console.log(finalComputedResult);
}

// The following section handles reading input from standard I/O and invoking the main processing function.
// It should typically remain unchanged for competitive programming platforms.
processNumericalInput(require("fs").readFileSync("/dev/stdin", "utf8"));