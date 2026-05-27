let loanAmount = 100; // Initial loan amount in some unit
let iterationCount = Math.floor(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the number of weeks from standard input

// Loop through each week to calculate the accumulating debt
for (; iterationCount > 0; iterationCount--) {
  loanAmount = Math.ceil(loanAmount * 1.05); // Apply a 5% interest rate and round up
}

// Output the final calculated amount, scaled by 1000
console.log(loanAmount * 1000);
