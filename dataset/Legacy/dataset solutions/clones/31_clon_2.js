var initialYears = require('fs').readFileSync('/dev/stdin', 'utf8');
// Convert the input string to a numerical value
initialYears = initialYears - 0;

// Initialize the starting monetary value
var finalAmount = 100000;

// Loop through the specified number of years
for (var yearCounter = 0; yearCounter < initialYears; yearCounter++) {
  // Apply an annual interest rate
  finalAmount = finalAmount * 1.05;
  // Round up to the nearest thousand
  finalAmount = Math.ceil(finalAmount / 1000) * 1000;
}

// Display the calculated final amount
console.log(finalAmount);
