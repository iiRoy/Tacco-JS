const moduleInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const upperLimit = parseInt(moduleInput.trim(), 10);

// Initialize a two-dimensional array to store the counts of numbers
// where the first index represents the starting digit (1-9)
// and the second index represents the ending digit (0-9).
// Rows 0 and columns 0 are included for easier indexing (0-9 range)
// but row 0 (for starting digit 0) will remain unused as numbers from 1 to upperLimit don't start with 0.
const digitMap = Array.from({ length: 10 }, () => Array(10).fill(0));

// Populate the digitMap using mathematical operations to extract digits
for (let currentNumber = 1; currentNumber <= upperLimit; ++currentNumber) {
    let tempNumber = currentNumber;
    const endingDigit = tempNumber % 10; // Extract the last digit

    let beginningDigit = tempNumber;
    // Extract the first digit by repeatedly dividing by 10 until it's a single digit
    while (beginningDigit >= 10) {
        beginningDigit = Math.floor(beginningDigit / 10);
    }

    // Increment the count for this specific (beginningDigit, endingDigit) pair
    digitMap[beginningDigit][endingDigit]++;
}

// Calculate the sum of products for matching reversed digit pairs
let cumulativeSum = 0;

// Iterate through all possible beginning digits (1-9)
for (let b = 1; b <= 9; ++b) {
    // Iterate through all possible ending digits (0-9)
    for (let e = 0; e <= 9; ++e) {
        // Get the count of numbers starting with 'b' and ending with 'e'
        const countBE = digitMap[b][e];
        
        // If there are numbers with this (b, e) pattern
        if (countBE > 0) {
            // Find the count of numbers with the reversed pattern: starting with 'e' and ending with 'b'
            const countEB = digitMap[e][b];
            
            // Add the product of these two counts to the total sum
            cumulativeSum += countBE * countEB;
        }
    }
}

// Display the final calculated result
console.log(cumulativeSum);