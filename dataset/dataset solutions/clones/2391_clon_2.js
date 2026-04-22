/*
 * This module processes input data to perform a Caesar cipher-like transformation.
 * It reads a shift value and a string from the input, then applies the shift
 * to each character of the string, wrapping around the alphabet.
 */
function processInputData(rawData) {
  // Extract the numerical shift amount from the first element of the raw data.
  // Ensure it's parsed as an integer for correct arithmetic operations.
  const rotationValue = Number.parseInt(rawData[0], 10);

  // Take the second element (the string), split it into individual characters,
  // and then map each character to its shifted equivalent based on the rotation value.
  const convertedCharacters = rawData[1]
    .split('')
    .map((singleChar) => {
      // Define the ASCII value for 'A' to use as a base for 0-25 indexing.
      const alphabetStartAscii = 'A'.charCodeAt(0);
      // Get the ASCII value of the current character.
      const currentAscii = singleChar.charCodeAt(0);

      // Calculate the shifted index:
      // 1. Subtract 'A's ASCII to get a 0-25 range.
      // 2. Add the rotation value.
      // 3. Apply modulo 26 to ensure wrapping around the alphabet (A-Z).
      // 4. Add 'A's ASCII back to convert the index to the new character's ASCII.
      const shiftedIndex = (currentAscii - alphabetStartAscii + rotationValue) % 26;
      return String.fromCharCode(shiftedIndex + alphabetStartAscii);
    });

  // Output the joined characters as a single transformed string to the console.
  console.log(convertedCharacters.join(''));
}

// Entry point for the script:
// Read data from standard input, process it, and execute the main function.
processInputData(
  require('node:fs')
    .readFileSync(
      '/dev/stdin',
      { encoding: 'utf8' } // Specify encoding explicitly using an options object
    )
    .trim() // Remove any leading/trailing whitespace from the input
    .split('\n') // Split the input string into an array of lines
);