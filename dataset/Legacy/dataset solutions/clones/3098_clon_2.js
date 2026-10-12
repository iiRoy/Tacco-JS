// This program processes a sequence of characters to find the longest substring composed only of specific nucleotides.
function processInput(rawData) {
  // Split the entire input string by newline characters to get individual lines.
  const linesOfText = rawData.split('\n');
  // The first line of input contains the string to be analyzed.
  let targetString = linesOfText[0];

  // Convert the target string into an array of its individual characters for easier iteration.
  const charSequence = targetString.split('');
  // Define the set of valid characters (nucleotides) we are looking for.
  const validNucleotides = ['A', 'C', 'G', 'T'];

  // Initialize variables to track the maximum length found and the current consecutive length.
  let longestMatch = 0;
  let currentMatchLength = 0;

  // Iterate through each character in the sequence.
  for (let idx = 0; idx < charSequence.length; idx++) {
    // Check if the current character is one of the valid nucleotides.
    if (validNucleotides.indexOf(charSequence[idx]) >= 0) {
      // If it is, increment the current consecutive match length.
      // Then, update the overall longest match if the current length is greater.
      longestMatch = Math.max(longestMatch, ++currentMatchLength);
    } else {
      // If the character is not a valid nucleotide, reset the current consecutive match length.
      currentMatchLength = 0;
    }
  }
  // Output the final calculated maximum length to the console.
  console.log(longestMatch);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
