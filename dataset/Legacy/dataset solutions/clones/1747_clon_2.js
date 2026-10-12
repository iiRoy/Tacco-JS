const processInput = (rawData) => {
  // Initialize a BigInt variable from the trimmed input string.
  let currentValue = BigInt(rawData.trim());

  // Define the character mapping for base-26 conversion.
  // 'z' is at index 0, 'a' at 1, ..., 'y' at 25.
  const charMap = 'zabcdefghijklmnopqrstuvwxyz';

  // This array will store the resulting characters in reverse order.
  let resultChars = [];

  // Loop until the current value becomes zero.
  while (currentValue !== 0n) {
    // Calculate the next value for the iteration.
    // If currentValue is exactly 26, the next value is 0 (special handling for 'z').
    // Otherwise, it's integer division by 26.
    const nextValue = currentValue === 26n ? 0n : currentValue / 26n;

    // Get the remainder when divided by 26. This determines the current character.
    const remainder = currentValue % 26n;

    // Add the character corresponding to the remainder to the front of the array.
    // Using String() to convert BigInt remainder to a string for array indexing.
    resultChars.unshift(charMap[String(remainder)]);

    // Update the current value for the next iteration.
    currentValue = nextValue;
  }

  // Join the characters in the array to form the final string and print it to console.
  return console.log(resultChars.join(''));
};

// Conditional execution based on environment variable MYTEST.
// If MYTEST is set, it checks if it's 'test' (presumably for a test function),
// otherwise it reads from 'dev/stdin'.
// If MYTEST is not set, it reads from '/dev/stdin'.
process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
