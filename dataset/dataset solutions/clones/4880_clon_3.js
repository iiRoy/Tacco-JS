const processStringAlternations = (rawInputData) => {
  // Extract the primary string from the raw input.
  // We assume the first line contains the sequence of characters to analyze.
  const relevantLine = rawInputData.split('\n')[0];
  const targetSequence = relevantLine ? relevantLine.trim() : ''; // Ensure trimming and handle potentially empty lines.

  // Implement a guard clause for edge cases:
  // If the string is empty or contains only a single character,
  // no alternations are possible, so we immediately output 0.
  if (targetSequence.length < 2) {
    console.log(0);
    return;
  }

  // Utilize the `reduce` array method to efficiently count character switches.
  // The accumulator object tracks both the current count of alternations
  // and the character encountered in the previous iteration.
  const finalSwitchCount = targetSequence.split('').reduce((accumulator, currentCharacter, currentIndex) => {
    // For the very first character in the sequence (index 0),
    // there's no preceding character to compare against.
    // We simply initialize the 'previousChar' in the accumulator.
    if (currentIndex === 0) {
      accumulator.previousChar = currentCharacter;
      return accumulator;
    }

    // Compare the current character with the character stored from the last iteration.
    // If they are different, it signifies an alternation.
    if (currentCharacter !== accumulator.previousChar) {
      accumulator.alternationTally++; // Increment the counter for differing adjacent characters.
    }

    // Update the 'previousChar' in the accumulator for the next iteration's comparison.
    accumulator.previousChar = currentCharacter;

    // Return the updated accumulator for the next step in the reduction.
    return accumulator;
  }, { alternationTally: 0, previousChar: '' }).alternationTally; // Initialize count to zero and previousChar to an empty string.

  // Output the total number of character alternations detected.
  console.log(finalSwitchCount);
};

// --- Do not modify the following section (handles standard input/output) ---
// This block ensures that all standard input is read at once
// and then passed to the main processing function for execution.
const fileSystemModule = require("fs");
processStringAlternations(fileSystemModule.readFileSync("/dev/stdin", "utf8"));