'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes a single character to determine if it's a vowel or a consonant.
 * @param {string} rawData - The raw input string, expected to contain a single character.
 */
const processInput = (rawData) => {
  // Remove leading/trailing whitespace from the input string.
  const characterToCheck = rawData.trim();

  // Define the set of lowercase vowels.
  const vowelSet = ['a', 'e', 'i', 'o', 'u'];

  // Check if the character is present in the vowel set.
  if (vowelSet.includes(characterToCheck)) {
    // If it's a vowel, print 'vowel' to the console.
    console.log('vowel');
  } else {
    // Otherwise, it's considered a consonant, print 'consonant'.
    console.log('consonant');
  }
};

// Read the entire content from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
