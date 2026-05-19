// This script processes an input string to calculate a specific score based on '<' and '>' characters.
console.log((inputString => {
  // Remove any leading or trailing whitespace from the raw input.
  const processedString = inputString.trim();
  // Obtain the effective character count of the cleaned string.
  const stringLength = processedString.length;
  // Initialize a numerical array, one element larger than the string, with all values set to zero.
  const scoreArray = Array(stringLength + 1).fill(0);

  // Iterate through the string to compute scores based on character patterns.
  for (let charIndex = 0; charIndex < stringLength; charIndex++) {
    // If the character at the current forward index is '<', update the score for the subsequent position.
    if (processedString[charIndex] === '<') {
      scoreArray[charIndex + 1] = Math.max(scoreArray[charIndex + 1], scoreArray[charIndex] + 1);
    }
    // If the character at the current reverse index is '>', update the score for that specific position.
    if (processedString[stringLength - charIndex - 1] === '>') {
      scoreArray[stringLength - charIndex - 1] = Math.max(scoreArray[stringLength - charIndex - 1], scoreArray[stringLength - charIndex] + 1);
    }
  }

  // Sum all the calculated scores in the array and return the total as a string.
  return `${scoreArray.reduce((accumulatedSum, currentValue) => accumulatedSum + currentValue)}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8'))); // Read the entire content from standard input as a UTF-8 string.
