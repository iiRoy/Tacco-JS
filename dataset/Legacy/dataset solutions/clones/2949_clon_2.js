// This function serves as the primary entry point for processing the given input data.
function ProcessInput(rawData) {
  // The input string is expected to contain multiple lines.
  // The second line (index 1 after splitting by newline) is the main string to be manipulated.
  let targetString = rawData.split("\n")[1];

  // The first line (index 0) contains space-separated values.
  // The second value (index 1 after splitting by space) is an integer 'K',
  // which represents a 1-based index for character modification.
  const positionIndex = rawData.split("\n")[0].split(" ")[1];

  // Convert the target string into an array of individual characters.
  // This allows for easy modification of a specific character by its index.
  let stringCharsArray = targetString.split("");

  // Determine the character at the specified 1-based index 'K'.
  // Convert 'K' to a 0-based index for array access (K-1).
  // Then, convert this character to its lowercase equivalent.
  const lowerCaseChar = targetString[positionIndex - 1].toLowerCase();

  // Modify the character array:
  // At the 0-based index (positionIndex - 1), remove 1 character,
  // and insert the newly lowercased character.
  stringCharsArray.splice(positionIndex - 1, 1, lowerCaseChar);

  // Join the modified character array back into a single string.
  // This resulting string is then printed to the standard output.
  console.log(stringCharsArray.join(""));
}

// The program reads its input from standard input, typically a file or piped data.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
// The read content is then passed to the ProcessInput function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
