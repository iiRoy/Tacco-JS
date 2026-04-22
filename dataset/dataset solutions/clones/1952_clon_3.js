/**
 * Analyzes the provided document content to find occurrences of a specific numeric sequence pattern.
 * It generates a series of multiples of a base factor (2019), then checks how many of these
 * unique multiples appear as substrings within the input text.
 *
 * @param {string} sourceDocumentContent The text content to be analyzed.
 * @returns {number} The count of distinct numeric patterns found in the document.
 */
function analyzeDocumentContent(sourceDocumentContent) {
  // Ensure the input content is treated as a string for consistency.
  const documentText = String(sourceDocumentContent);

  // Validate if the document content is meaningful.
  if (!documentText || documentText.trim().length === 0) {
    console.warn("Provided document content is empty or contains only whitespace. Returning 0 distinct pattern matches.");
    return 0; // No patterns can be found in an empty document.
  }

  // Define the base factor for generating the numeric sequence.
  const BASE_GENERATION_FACTOR = 2019;
  // Define the upper limit for the sequence generation.
  const SEQUENCE_UPPER_BOUND = 99;

  // Initialize an array to store the generated numeric sequence.
  const generatedNumericSequence = [];

  // Populate the sequence with multiples of the base factor.
  // The sequence will contain BASE_GENERATION_FACTOR * 1, ..., BASE_GENERATION_FACTOR * 99.
  for (let currentMultiplier = 1; currentMultiplier <= SEQUENCE_UPPER_BOUND; currentMultiplier++) {
    generatedNumericSequence.push(BASE_GENERATION_FACTOR * currentMultiplier);
  }

  // Initialize a counter for the number of distinct patterns found.
  let totalDistinctPatternOccurrences = 0;

  // Iterate through each generated number in the sequence.
  for (let sequenceIndex = 0; sequenceIndex < generatedNumericSequence.length; sequenceIndex++) {
    const currentNumericPattern = generatedNumericSequence[sequenceIndex];

    // Convert the numeric pattern to a string for substring matching.
    const patternAsString = String(currentNumericPattern);

    // Count the occurrences of the patternAsString in the documentText.
    // Using split() is an alternative to RegExp.match() for counting non-overlapping occurrences.
    // If the pattern is "ab" and text is "abab", split("ab") results in ["", "", ""], length 3.
    // So, count is length - 1.
    const numberOfTimesPatternAppears = documentText.split(patternAsString).length - 1;

    // If the pattern appeared at least once, increment our distinct count.
    if (numberOfTimesPatternAppears > 0) {
      totalDistinctPatternOccurrences++;
    }
  }

  // Output the final count to the console.
  console.log(totalDistinctPatternOccurrences);

  // Return the count for potential further use or testing.
  return totalDistinctPatternOccurrences;
}

// Read input from standard input and process it.
const systemInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
analyzeDocumentContent(systemInputContent);