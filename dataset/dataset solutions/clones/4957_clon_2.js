const numSequence = (startVal, endVal) => {
  // Generates an array of numbers from startVal to endVal, inclusive.
  return Array(endVal - startVal + 1).fill(0).map((currVal, idx) => idx + startVal);
};

// Pre-compute the lowercase English alphabet for character lookups.
const charSet = numSequence(0, 25).map(currVal => String.fromCodePoint(97 + currVal));

// This recursive function applies a character shift transformation to an input string.
const transformString = (inputStr, shiftAmount, prefixStr) => {
  // Initialize the accumulating prefix string if it's not provided on the first call.
  prefixStr = prefixStr || "";

  // Base case 1: If no shift remains or the input string is exhausted, return the accumulated prefix
  // concatenated with any remaining part of the original string.
  if (shiftAmount === 0 || !inputStr) {
    return prefixStr + inputStr;
  }

  // Base case 2: If the current character is 'a', it cannot be shifted further down the alphabet.
  // Append 'a' to the prefix and continue processing the rest of the string with the same shift amount.
  if (inputStr[0] === "a") {
    return transformString(inputStr.slice(1), shiftAmount, prefixStr + inputStr[0]);
  }

  // Find the zero-based index of the current character in our alphabet array.
  let charIndex = charSet.findIndex(currVal => currVal === inputStr[0]);

  // Check if the remaining shift amount is large enough to wrap the character around to 'a'.
  // (26 - charIndex) represents the number of shifts needed to reach 'a' from the current character.
  if (26 - charIndex <= shiftAmount) {
    // If it wraps, append 'a' to the prefix, reduce the shift amount by the wrap-around value,
    // and recursively call the function for the rest of the string.
    return transformString(inputStr.slice(1), shiftAmount - (26 - charIndex), prefixStr + "a");
  } else {
    // If the shift is not large enough to wrap around:
    // If this is the last character in the string, apply the shift directly and append it to the prefix.
    // Otherwise, append the current character (un-shifted) to the prefix and continue processing
    // the rest of the string with the same shift amount.
    return inputStr.length === 1
      ? prefixStr + charSet[charIndex + shiftAmount] + inputStr.slice(1)
      : transformString(inputStr.slice(1), shiftAmount, prefixStr + inputStr[0]);
  }
};

// The primary function that processes the input data.
function ExecuteProgram(rawData) {
  let inputStringValue, shiftValue, parsedInput;

  // Split the raw input into lines to extract the string and the shift value.
  parsedInput = rawData.split("\n");
  inputStringValue = parsedInput[0];
  shiftValue = parseInt(parsedInput[1], 10); // Parse the shift amount as an integer.

  // Log the result of the string transformation to the console.
  console.log(transformString(inputStringValue, shiftValue));
}

// This section handles reading from standard input and invoking the main logic.
// It should not be modified to ensure compatibility with the execution environment.
ExecuteProgram(require("fs").readFileSync("/dev/stdin", "utf8"));
