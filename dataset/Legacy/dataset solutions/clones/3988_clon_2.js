const fs = require('fs'); // Import the file system module

// Read raw input data from standard input, assuming UTF-8 encoding
const rawData = fs.readFileSync("/dev/stdin", "utf8");

// Convert the raw data to a string and split it by space to get the range boundaries
const bounds = rawData.toString().split(" ");

// Parse the first element as the lower bound integer
const lowerBound = parseInt(bounds[0]);

// Parse the second element as the upper bound integer
const upperBound = parseInt(bounds[1]);

// Initialize a counter for numbers meeting the criteria
let palindromeCount = 0;

// Iterate through numbers from the lower bound up to (but not including) the upper bound
for (let currentNum = lowerBound; currentNum < upperBound; currentNum++) {
  // Convert the current number to its string representation
  const numStr = currentNum.toString();

  // Check if the number string represents a 5-digit palindrome (e.g., 12321)
  // This specific check implies a 5-digit number where the first digit matches the last,
  // and the second digit matches the fourth.
  if (numStr[0] == numStr[4] && numStr[1] == numStr[3]) {
    // If it's a palindrome, increment the counter
    palindromeCount++;
  }
}

// Output the final count of palindromic numbers found
console.log(palindromeCount);
