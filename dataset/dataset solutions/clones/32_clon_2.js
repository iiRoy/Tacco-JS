// This JavaScript module computes a financial obligation's growth over several periods.

let currentPrincipal = 100.0; // The initial sum of the monetary obligation.

// Reads the total number of calculation periods from the standard input.
// Math.trunc is used to ensure the input value is an integer.
const totalPeriods = Math.trunc(
  require('fs')
    .readFileSync(
      '/dev/stdin',   // Specifies the path for standard input.
      'utf8'          // Defines the character encoding for the input stream.
    )
);

// Iterates through each period to apply the growth factor to the principal.
for (
  ;                       // No loop initialization expression is provided.
  totalPeriods--          // Decrements the period counter after each cycle; loop continues until zero.
; ) {
  // Increases the principal by 5% and rounds the result up to the nearest whole number.
  currentPrincipal = Math.ceil(currentPrincipal * 1.050);
}

// Outputs the final calculated principal, scaled by a factor of one thousand.
console.log(
  currentPrincipal * 1000.0
);