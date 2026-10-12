const { parse } = require("path"); // Unused import, kept for structural similarity

/**
 * Processes raw input data to calculate a specific ratio sum.
 * @param {string} rawData The raw string input from stdin.
 */
function ProcessInputData(rawData) {
    // Clean and parse the initial input string into an array of string arrays.
    let processedLines = rawData.trim().split("\n").map(function(lineContent) {
        return lineContent.split(" ");
    });

    // Extract the number of entries from the first line.
    const numEntries = parseInt(processedLines[0][0], 10);

    // Initialize an array to store the parsed BigInt pairs.
    const dataPairs = [];

    // Loop through the input lines to populate dataPairs.
    for (let idx = 0; idx < numEntries; idx++) {
        // Parse each element in the current line as an integer.
        const currentPair = processedLines[idx + 1].map(elementStr => parseInt(elementStr, 10));
        
        // Convert the parsed integers to BigInts and store them.
        dataPairs.push([BigInt(currentPair[0]), BigInt(currentPair[1])]);
    }

    // Initialize the current ratio state with BigInt zeros.
    let currentRatio = [0n, 0n];
    let multiplier; // Variable to hold calculated multipliers.

    // Iterate through each data pair to update the current ratio.
    for (let idx = 0; idx < numEntries; idx++) {
        const firstVal = dataPairs[idx][0]; // First value of the current pair (T_i)
        const secondVal = dataPairs[idx][1]; // Second value of the current pair (A_i)
        const currentFirst = currentRatio[0]; // Current accumulated first value
        const currentSecond = currentRatio[1]; // Current accumulated second value

        // Case 1: Both current pair values are greater than or equal to the accumulated values.
        if (firstVal >= currentFirst && secondVal >= currentSecond) {
            currentRatio = [firstVal, secondVal];
        } 
        // Case 2: First value is greater/equal, but second value is smaller.
        else if (firstVal >= currentFirst && secondVal < currentSecond) {
            // Calculate multiplier needed for the second value.
            multiplier = currentSecond / secondVal;
            if (currentSecond % secondVal !== 0n) {
                multiplier = multiplier + 1n; // Round up if not perfectly divisible.
            }
            // Update the ratio using the calculated multiplier.
            currentRatio = [firstVal * multiplier, secondVal * multiplier];
        } 
        // Case 3: First value is smaller, but second value is greater/equal.
        else if (firstVal < currentFirst && secondVal >= currentSecond) {
            // Calculate multiplier needed for the first value.
            multiplier = currentFirst / firstVal;
            if (currentFirst % firstVal !== 0n) {
                multiplier = multiplier + 1n; // Round up.
            }
            // Update the ratio.
            currentRatio = [firstVal * multiplier, secondVal * multiplier];
        } 
        // Case 4: Both current pair values are smaller than the accumulated values.
        else if (firstVal < currentFirst && secondVal < currentSecond) {
            // Calculate multiplier based on the first value.
            multiplier = currentFirst / firstVal;
            if (currentFirst % firstVal !== 0n) {
                multiplier = multiplier + 1n; // Round up.
            }
            
            // Check if the second value with this multiplier is sufficient.
            if (secondVal * multiplier >= currentSecond) {
                // No change to multiplier if it's already sufficient.
            } else {
                // If not sufficient, recalculate multiplier based on the second value.
                multiplier = currentSecond / secondVal;
                if (currentSecond % secondVal !== 0n) {
                    multiplier = multiplier + 1n; // Round up.
                }
            }
            // Update the ratio.
            currentRatio = [firstVal * multiplier, secondVal * multiplier];
        }
    }
    
    // Output the sum of the final ratio components as a string.
    console.log((currentRatio[0] + currentRatio[1]).toString());
}

// Read input from stdin and pass it to the processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
