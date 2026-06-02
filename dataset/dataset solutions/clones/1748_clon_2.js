const processInputData = (rawInputString) => {
  // Define a string that maps numerical values (0-26) to their corresponding characters.
  // The '0' at index 0 is crucial for the specific base conversion logic.
  const charMap = '0abcdefghijklmnopqrstuvwxyz';

  // Convert the input string, after trimming any leading/trailing whitespace,
  // into a BigInt to handle potentially very large numbers.
  let currentNumber = BigInt(rawInputString.trim());

  // Initialize an array to store the characters of the result.
  // Characters will be added in reverse order and then joined.
  const outputCharacters = [];

  // Loop as long as the current number is greater than zero.
  // This performs a base-26-like conversion.
  while (currentNumber > BigInt(0)) {
    // Calculate the remainder when the current number is divided by 26.
    // This remainder determines the character for the current position.
    const currentRemainder = Number(currentNumber % BigInt(26));

    // Add the character corresponding to the remainder to the beginning of the array.
    // Using unshift builds the string in the correct order.
    outputCharacters.unshift(charMap[currentRemainder]);

    // Update the current number for the next iteration:
    // Subtract the remainder to make it perfectly divisible by 26,
    // then divide by 26 to shift to the next "digit" position.
    currentNumber = (currentNumber - BigInt(currentRemainder)) / BigInt(26);
  }

  // The following line was commented out in the original code and is preserved as such.
  // if (currentNumber > BigInt(0)) outputCharacters.unshift(charMap[Number(currentNumber)]);

  // Join all the collected characters into a single string and print it to the console.
  return console.log(outputCharacters.join(''));
};

// Determine the execution path based on an environment variable.
// If 'RUN_TESTS' is set in the environment, execute a test routine (assumed to be defined elsewhere).
// Otherwise, read input from standard input, decode it as UTF-8, and pass it to the main processing function.
process.env.RUN_TESTS
  ? executeTestRoutine()
  : processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
