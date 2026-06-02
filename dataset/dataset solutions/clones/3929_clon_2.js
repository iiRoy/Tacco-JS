function ProcessInput(inputString) {
  // Determine the total length of the provided string.
  const stringLength = inputString.length;

  // Obtain the ASCII (or Unicode) value for the character 'a'.
  const charCodeA = "a".charCodeAt(0);

  // Initialize an array to keep track of character availability (a-z).
  // The array has 26 elements, all initially set to 1 (indicating available).
  var availableChars = new Array(0x1A).fill(0b1);

  // Declare a variable for loop iteration, to be used across different loops.
  var outerLoopIndex;

  // Check if the length of the input string is less than 26.
  if (stringLength < 0x1A) {
    // If the string is shorter than 26 characters, mark characters present in the string as unavailable.
    for (outerLoopIndex = 0; outerLoopIndex < stringLength; outerLoopIndex++) {
      availableChars[inputString.charCodeAt(outerLoopIndex) - charCodeA] = 0x0;
    }

    // Find the first character (a-z) that was not present in the original string.
    for (outerLoopIndex = 0; outerLoopIndex < 0x1A; outerLoopIndex++) {
      if (availableChars[outerLoopIndex]) {
        // Append this first available character to the string.
        inputString += String.fromCharCode(charCodeA + outerLoopIndex);
        break; // Exit the loop as soon as one character is appended.
      }
    }
  } else {
    // If the string length is 26 or more, handle the specific case for "zyxwvutsrqponmlkjihgfedcba".
    if (inputString === "zyxwvutsrqponmlkjihgfedcba") {
      console.log(-0b1); // Output -1 and terminate if it's this specific string.
      return;
    }

    // Initialize a character for comparison, starting from the character at index 25.
    var currentComparisonChar = inputString[0x19];

    // Mark the character at index 25 as unavailable in our tracking array.
    availableChars[inputString.charCodeAt(0x19) - charCodeA] = 0x0;

    // Iterate backwards from index 24 down to 0.
    for (outerLoopIndex = 0x18; outerLoopIndex >= 0x0; outerLoopIndex--) {
      // If the current comparison character is lexicographically greater than the character at the current index.
      if (currentComparisonChar > inputString[outerLoopIndex]) {
        // Update the comparison character based on the character at the current index.
        currentComparisonChar = inputString.charCodeAt(outerLoopIndex) - charCodeA;
        // Truncate the input string, keeping only the part before the current index.
        inputString = inputString.slice(0x0, outerLoopIndex);
        break; // Exit the loop.
      } else {
        // If not greater, mark the character at the current index as unavailable.
        availableChars[inputString.charCodeAt(outerLoopIndex) - charCodeA] = 0x0;
      }
    }

    // Find the smallest available character that is greater than or equal to the updated comparison character.
    for (var innerLoopIndex = currentComparisonChar; innerLoopIndex < 0x1A; innerLoopIndex++) {
      if (availableChars[innerLoopIndex] === 0x0) { // Check if the character is marked as unavailable (0).
        // Append this character to the modified string.
        inputString += String.fromCharCode(charCodeA + innerLoopIndex);
        break; // Exit the loop.
      }
    }
  }

  // Output the final processed string to the console.
  console.log(inputString);
}

// Read input from standard input, decode it as UTF-8, remove leading/trailing whitespace,
// and then pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
