function ProcessInput(rawData) {
  let charSequence = rawData.split(''); // Convert the incoming string into an array of individual characters.
  let questionMarkIndex = 0; // Declare and initialize a variable to hold the position of a specific character.

  while (true) { // Begin an indefinite loop that will continue until explicitly broken.
    questionMarkIndex = charSequence.indexOf('?'); // Locate the first occurrence of the '?' character within the array.
    charSequence[questionMarkIndex] = 'D'; // Replace the found '?' character at its index with the character 'D'.

    if (questionMarkIndex === -1) { // Check if the '?' character was not found (indexOf returns -1).
      break; // If no '?' is found, terminate the loop.
    }
  }

  let finalString = ''; // Initialize an empty string to accumulate the processed characters.
  charSequence.map(currentChar => finalString += currentChar); // Iterate through the character array and append each character to the final string.

  console.log(finalString); // Output the resulting string to the console.
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")); // Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
