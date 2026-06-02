function flipString(inputString) {
  // This function generates a reversed version of the provided string.
  let reversedResult = ""; // Initialize an empty string to build the reversed output.
  const strLen = inputString.length; // Get the total length of the input string once.

  // Iterate through the input string from the beginning.
  for (let idx = 0; idx < strLen; idx++) {
    // Append characters from the original string in reverse order.
    // The character at index `strLen - idx - 1` corresponds to the character
    // that should be at position `idx` in the reversed string.
    reversedResult += inputString[strLen - idx - 1];
  }
  return reversedResult; // Return the fully reversed string.
}

function isPalindrome(testString) {
  // This function determines if a given string is a palindrome.
  // It compares the original string with its reversed counterpart.
  return testString === flipString(testString);
}

function processInput(rawData) {
  // The main entry point for processing the input data.
  // First, remove any leading or trailing whitespace from the raw input.
  const processedString = rawData.trim();

  // Perform a complex check and log "Yes" or "No" based on the result.
  // The condition checks two things:
  // 1. If the entire processed string is a palindrome.
  // 2. If the first half of the processed string (rounded down) is also a palindrome.
  // Both conditions must be true for the final output to be "Yes".
  console.log(
    isPalindrome(processedString) &&
    isPalindrome(processedString.slice(0, processedString.length / 2 | 0))
      ? "Yes"
      : "No"
  );
}

// Read input from standard input, decode it as UTF-8, and then pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
