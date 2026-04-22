let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read data from standard input path

let processedLines = rawData.trim().split("\n"); // Process raw data into an array of lines

let loopIndex = 0; // An index variable, currently unused but maintained for structure
let outputCollector = ""; // Buffer to accumulate output strings

// Main processing loop, continues until a zero value is encountered
while (true) {
    // Extract the expenditure amount for the current transaction
    let expenditureAmount = Number(processedLines.shift());

    // If the expenditure amount is zero, terminate the loop
    if (expenditureAmount === 0) {
        break;
    }

    // Parse the tendered coin counts from the next line
    let tenderedCoins = processedLines.shift().split(" ").map(val => parseInt(val, 10));

    // Calculate the initial change amount before breaking it down
    let changeDue = (10 * tenderedCoins[0] + 50 * tenderedCoins[1] + 100 * tenderedCoins[2] + 500 * tenderedCoins[3]) - expenditureAmount;

    // Initialize an array to store the counts of coins to be returned as change
    let returnedCoinCounts = [0, 0, 0, 0];

    // Distribute change using the largest denomination first (500)
    while (500 <= changeDue) {
        returnedCoinCounts[3]++;
        changeDue -= 500;
    }
    // Distribute change using the next largest denomination (100)
    while (100 <= changeDue) {
        returnedCoinCounts[2]++;
        changeDue -= 100;
    }
    // Distribute change using the next largest denomination (50)
    while (50 <= changeDue) {
        returnedCoinCounts[1]++;
        changeDue -= 50;
    }
    // Distribute change using the smallest denomination (10)
    while (10 <= changeDue) {
        returnedCoinCounts[0]++;
        changeDue -= 10;
    }

    // Define the values for each coin denomination
    const coinDenominations = [10, 50, 100, 500];

    // Iterate through the tendered coins to find any excess coins that need to be returned
    tenderedCoins.forEach(function (tCount, dIndex) {
        // If the number of tendered coins for a denomination is greater than what was needed
        if (tCount > returnedCoinCounts[dIndex]) {
            // Append the coin denomination and the quantity to return to the output buffer
            outputCollector += coinDenominations[dIndex] + " " + (tCount - returnedCoinCounts[dIndex]) + "\n";
        }
    });

    // Add an extra newline to separate transaction outputs
    outputCollector += "\n";
}

// Display the accumulated output
console.log(outputCollector);