"use strict";

/**
 * Analyzes a given input string to determine a maximum score based on word occurrences.
 * Words appearing in the 'blue' section increment their respective counts,
 * while words from the 'red' section decrement them. The final output is the
 * highest positive count achieved, or zero if all counts are negative.
 *
 * @param {string} incomingTextData - The raw string input, expected to contain
 *                                    numbers and words separated by newlines or spaces.
 */
function processInputData(incomingTextData) {
  // Divide the input string into an array of individual tokens (words or numbers).
  let parsedTokens = incomingTextData.split(/\n|\s/);

  // Extract the count of blue-associated items from the beginning of the tokens.
  const countOfBlueItems = ~~parsedTokens[0];
  // Extract the count of red-associated items. This value is read but not directly used
  // in subsequent slicing, maintaining the original input parsing structure.
  const countOfRedItems = ~~parsedTokens[countOfBlueItems + 1];

  // Isolate the list of 'blue' words based on the extracted count.
  const blueWordCollection = parsedTokens.slice(1, countOfBlueItems + 1);
  // Isolate the list of 'red' words, starting after the blue items and their count.
  const redWordCollection = parsedTokens.slice(countOfBlueItems + 2);

  // Initialize an object to store the calculated scores for each unique word.
  let wordScoreRegistry = {};

  // Iterate through the 'blue' words to increment their scores.
  for (let blueEntryIndex in blueWordCollection) {
    const currentWord = blueWordCollection[blueEntryIndex];
    // Increment the word's score. If the word is encountered for the first time,
    // its score starts at 1.
    wordScoreRegistry[currentWord] = (wordScoreRegistry[currentWord] || 0) + 1;
  }

  // Iterate through the 'red' words to decrement their scores.
  for (let redEntryIndex in redWordCollection) {
    const currentWord = redWordCollection[redEntryIndex];
    // Decrement the word's score. If the word is encountered for the first time
    // via a 'red' entry, its score starts at -1.
    wordScoreRegistry[currentWord] = (wordScoreRegistry[currentWord] || 0) - 1;
  }

  // Determine the highest score recorded among all words.
  let peakScoreValue = 0;
  for (let wordKeyIdentifier in wordScoreRegistry) {
    // Update the peak score if the current word's score is greater.
    peakScoreValue = Math.max(peakScoreValue, wordScoreRegistry[wordKeyIdentifier]);
  }

  // Ensure the final reported score is not negative; if it is, default to zero.
  peakScoreValue = peakScoreValue >= 0 ? peakScoreValue : 0;

  // Output the final calculated peak score to the console.
  console.log(peakScoreValue);
}

// Read the entire content of standard input as a UTF-8 string and pass it
// to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
