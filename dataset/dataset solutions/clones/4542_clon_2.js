'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Processes the provided raw input to determine if all characters are unique.
 * @param {string} rawData The input string to be analyzed.
 */
function processInput(rawData) {
  // Convert the incoming string into an array of individual characters.
  let charArray = rawData.split('');

  // Determine the total count of characters in the array.
  const totalChars = charArray.length;

  // Filter the character array to find only the unique characters.
  // This is achieved by checking if the first occurrence of a character
  // matches its current index, effectively removing duplicates.
  const uniqueChars = charArray.filter((currentChar, currentIndex, fullArray) => {
    return fullArray.indexOf(currentChar) === currentIndex;
  });

  // Compare the count of unique characters with the total character count.
  // If they are equal, it means all characters in the original input were unique.
  if (uniqueChars.length === totalChars) {
    console.log('yes'); // Output 'yes' if all characters are unique.
  } else {
    console.log('no'); // Otherwise, output 'no'.
  }
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
