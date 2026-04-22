// This script calculates future value with a specific rounding rule.

// Define constants for the financial calculation process.
const baseInvestment = 100000; // The initial principal amount.
const annualInterestFactor = 1.05; // The multiplier representing 5% annual growth.
const thousandsUnit = 1000; // The increment for rounding up the balance.

// Obtain raw textual data from the standard input stream.
let retrievedDataString = require('fs').readFileSync('/dev/stdin', 'utf8');

// Convert the retrieved string data into an integer representing the number of periods.
let numberOfPeriods = Number(retrievedDataString);

// Initialize the current monetary value with the base investment.
let currentMonetaryValue = baseInvestment;

// Loop through each period to apply the interest and rounding rules.
for (let periodIndex = 0; periodIndex < numberOfPeriods; periodIndex++) {

    // Apply the interest factor to the current monetary value.
    currentMonetaryValue = currentMonetaryValue * annualInterestFactor;

    // Round the current monetary value up to the nearest multiple of the thousands unit.
    currentMonetaryValue = Math.ceil(currentMonetaryValue / thousandsUnit) * thousandsUnit;
}

// Output the final computed monetary value to the console.
console.log(currentMonetaryValue);