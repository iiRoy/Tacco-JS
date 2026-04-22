'use strict';

/**
 * Processes a given text to determine the smallest lowercase English alphabet character
 * that is not present in the input. If all 'a' through 'z' are found, it indicates 'None'.
 * @param {string} textualContent The string data to be analyzed.
 */
function analyzeCharacterSequence(textualContent) {
  // Validate the input data. An empty or non-string input implies no characters are available,
  // thus 'a' is the first character not found. This mirrors the original empty input behavior.
  if (typeof textualContent !== 'string' || textualContent.length === 0) {
    console.log('a');
    return;
  }

  // Create a collection to hold all unique lowercase letters found in the input.
  // This step iterates through the input string and filters for relevant characters.
  const discoveredLowercaseLetters = new Set();
  for (const charSymbol of textualContent) {
    // Only characters within the 'a' to 'z' range are considered relevant for this analysis.
    if (charSymbol >= 'a' && charSymbol <= 'z') {
      discoveredLowercaseLetters.add(charSymbol);
    }
  }

  // Define the complete sequence of lowercase English alphabet characters for comparison.
  const fullAlphabetSequence = 'abcdefghijklmnopqrstuvwxyz';

  // Initialize the variable that will store the result. Default to 'None' in case all
  // alphabet characters are present in the input.
  let earliestMissingLetter = 'None';
  // A flag to optimize the search loop by breaking early once the first missing letter is found.
  let hasFoundMissing = false;

  // Iterate through the standard alphabet, checking each character's presence.
  for (let currentPos = 0; currentPos < fullAlphabetSequence.length; currentPos++) {
    const candidateLetter = fullAlphabetSequence[currentPos];

    // If the current alphabet character is not found in our set of discovered letters,
    // it means we have found the smallest missing character.
    if (!discoveredLowercaseLetters.has(candidateLetter)) {
      earliestMissingLetter = candidateLetter;
      hasFoundMissing = true; // Set flag to true.
      break; // Terminate the loop as the objective is to find the *first* missing one.
    }
  }

  // Output the final result to the console.
  console.log(earliestMissingLetter);
}

// Standard competitive programming input reading mechanism.
// Reads the content from standard input and passes it to the analysis function.
analyzeCharacterSequence(require("fs").readFileSync("/dev/stdin", "utf8"));