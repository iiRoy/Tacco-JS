// Solution for a string pattern counting problem
function processInput(rawData) {
  // Split the raw input string into individual lines
  const linesOfText = rawData.split('\n');

  // Parse the first line as an integer, though it's not used in this specific logic
  let numValue = parseInt(linesOfText[0], 10);

  // Get the second line, which is the string to be processed
  let targetString = linesOfText[1];

  // Append 'XX' to the string to simplify boundary checks for 'ABC' pattern
  targetString += 'XX';

  // Convert the modified string into an array of characters for easier indexing
  const charSequence = Array.from(targetString);

  // Initialize a variable to count occurrences of the 'ABC' pattern
  let occurrenceCount = 0;

  // Iterate through the character array, stopping two characters before the end
  // to allow checking for 'ABC' (current, next, next-next)
  for (let idx = 0; idx < charSequence.length - 2; idx++) {
    // Check if the current character is 'A'
    if (charSequence[idx] === 'A') {
      // If it's 'A', then check if the next two characters are 'B' and 'C' respectively
      // If the pattern 'ABC' is found, increment the counter by 1; otherwise, add 0.
      occurrenceCount += (charSequence[idx + 1] === 'B' && charSequence[idx + 2] === 'C') ? 1 : 0;
    }
  }; // An unusual but valid semicolon after the loop block

  // Output the final count of 'ABC' occurrences
  console.log(occurrenceCount);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
