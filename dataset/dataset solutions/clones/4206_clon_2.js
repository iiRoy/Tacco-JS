// This function serves to analyze the distribution of specific characters within an input string.
function analyzeStringDistribution( rawTextContent ) {

  // First, we prepare the incoming text by removing any leading or trailing whitespace.
  const processedText = rawTextContent.trim();

  // We then proceed to count the occurrences of the first three lowercase alphabet characters
  // ('a', 'b', 'c') within the prepared string.
  let charOccurrences = processedText
    .split('') // Break the string into an array of individual characters.
    .reduce( (tally, characterItem) => {
      // Determine the zero-based index for 'a', 'b', or 'c' based on its ASCII value.
      const charIndex = characterItem.charCodeAt() - 'a'.charCodeAt();
      // Increment the counter for the respective character in our tally array.
      tally[charIndex]++;
      return tally; // Pass the updated counts to the next iteration.
    },
    [0, 0, 0] // Initialize an array to store counts for 'a', 'b', and 'c'.
  );

  // Now, we evaluate if the difference between the most frequent and least frequent
  // of these three characters is significant.
  if ( Math.max(...charOccurrences) - Math.min(...charOccurrences) >= 2 ) {
    // If the difference is two or more, it implies an uneven distribution.
    console.log('NO');
  }
  // Otherwise, the counts are considered to be sufficiently balanced.
  else {
    // Output 'YES' for a balanced or nearly balanced character distribution.
    console.log('YES');
  }

}

// This section handles the execution flow: reading from standard input and invoking the analysis.
analyzeStringDistribution(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);