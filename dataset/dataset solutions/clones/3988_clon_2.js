const fileSys = require('fs'); // Obtain the built-in file system module

const rawData = fileSys.readFileSync("/dev/stdin", "utf8"); // Read content from standard input, expecting UTF-8 encoding

const limitStrings = rawData.toString().split(" "); // Convert input buffer to string, then split by spaces to isolate numeric boundaries

const lowerBound = parseInt(limitStrings[0]); // Parse the first string segment as the starting integer
const upperBound = parseInt(limitStrings[1]); // Parse the second string segment as the ending integer (exclusive)

let palindromeCount = 0; // Initialize a variable to accumulate the count of valid numbers

for ( let currentNum = lowerBound; currentNum < upperBound; currentNum++ )
{
  const numAsString = currentNum.toString(); // Transform the current integer into its string equivalent

  /*
   * Evaluate if the string representation of the number satisfies the palindromic condition
   * for a 5-digit number (first digit matches fifth, second digit matches fourth).
   * Note: This assumes all numbers in the range will be 5-digits, as per typical problem context.
   */
  if ( numAsString[0] === numAsString[4] && numAsString[1] === numAsString[3] )
  {
    palindromeCount++; // Increment the counter if the condition is met
  }
}

console.log(palindromeCount); // Output the final tally of identified palindromes