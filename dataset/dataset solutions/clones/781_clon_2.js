var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// This variable will hold each line of input data after initial processing
var lineDataCollection = (fileContent.trim()).split("\n");

// A general-purpose counter, though not explicitly used in the main logic flow
var cycleCount = 0;

// Main processing loop, continues until a specific termination condition is met
while (true) {
    // Extract the current payment value from the input stream
    // Using Number() for explicit type conversion from string to number
    var customerPayment = Number(lineDataCollection.shift());

    // Check for the termination signal (payment of 0)
    if (customerPayment === 0) {
        break; // Exit the processing loop
    }

    // Retrieve the available coin stock for the current transaction
    // The input line is split by spaces and each part converted to a number
    var initialCoinSupply = (lineDataCollection.shift()).split(" ").map(Number);

    // Calculate the total change that needs to be returned to the customer
    // Based on available coins in stock minus the payment received
    var amountToReturn = (10 * initialCoinSupply[0] + 50 * initialCoinSupply[1] + 100 * initialCoinSupply[2] + 500 * initialCoinSupply[3]) - customerPayment;

    // Array to track the number of each coin type that will be dispensed
    var dispensedCoinQuantities = [0, 0, 0, 0];

    // Greedy algorithm for dispensing change: start with the largest denomination
    while (500 <= amountToReturn) {
        dispensedCoinQuantities[3]++; // Increment count of 500-unit coins
        amountToReturn -= 500;       // Reduce remaining change
    }

    while (100 <= amountToReturn) {
        dispensedCoinQuantities[2]++; // Increment count of 100-unit coins
        amountToReturn -= 100;       // Reduce remaining change
    }

    while (50 <= amountToReturn) {
        dispensedCoinQuantities[1]++; // Increment count of 50-unit coins
        amountToReturn -= 50;        // Reduce remaining change
    }

    while (10 <= amountToReturn) {
        dispensedCoinQuantities[0]++; // Increment count of 10-unit coins
        amountToReturn -= 10;        // Reduce remaining change
    }

    // Array holding the numerical values of the coin denominations
    var currencyDenominations = [10, 50, 100, 500];

    // String builder for the final output of coins remaining
    var reportString = "";

    // Iterate through the initial coin supply to determine which coins were NOT used
    initialCoinSupply.forEach(function(startCount, denominationPosition) {
        // If the initial count of a coin type is greater than what was dispensed
        if (startCount > dispensedCoinQuantities[denominationPosition]) {
            // Append the coin denomination and the difference (remaining coins) to the report
            reportString += currencyDenominations[denominationPosition] + " " + (startCount - dispensedCoinQuantities[denominationPosition]) + "\n";
        }
    });

    // Output the generated report for the current transaction
    console.log(reportString);
}