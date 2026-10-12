"use strict"

// Helper function to encapsulate the value calculation for a given coin combination
function computeCombinationValue(count500, count100, count50, value500, value100, value50) {
    return (value500 * count500) + (value100 * count100) + (value50 * count50);
}

function calculateCoinCombinations(inputDataString) {
    // Define coin denominations as constants for clarity and potential reuse
    const denomination500 = 500;
    const denomination100 = 100;
    const denomination50 = 50;

    // Process input string: trim whitespace and split into lines
    const processedLines = inputDataString.trim().split('\n');

    // Parse input values into numerical variables
    const maxCount500Yen = Number(processedLines[0]);
    const maxCount100Yen = Number(processedLines[1]);
    const maxCount50Yen = Number(processedLines[2]);
    const desiredTotalAmount = Number(processedLines[3]);

    let numberOfValidCombinations = 0;

    // Iterate through all possible counts for 500-yen coins
    for (let current500Count = 0; current500Count <= maxCount500Yen; ++current500Count) {
        // Iterate through all possible counts for 100-yen coins
        for (let current100Count = 0; current100Count <= maxCount100Yen; ++current100Count) {
            // Iterate through all possible counts for 50-yen coins
            for (let current50Count = 0; current50Count <= maxCount50Yen; ++current50Count) {
                // Calculate the total value for the current combination using the helper function
                const currentCombinationSum = computeCombinationValue(
                    current500Count,
                    current100Count,
                    current50Count,
                    denomination500,
                    denomination100,
                    denomination50
                );

                // Check if the calculated sum matches the desired total amount
                if (currentCombinationSum === desiredTotalAmount) {
                    // If it matches, increment the counter for valid combinations
                    numberOfValidCombinations += 1;
                }
            }
        }
    }

    // Output the final count of valid combinations
    console.log(numberOfValidCombinations);
}

// Read input from stdin and pass it to the main function
const fileSystemModule = require("fs");
const standardInputFilePath = "/dev/stdin";
const fileEncoding = "utf8";
const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, fileEncoding);

calculateCoinCombinations(rawInputContent);
