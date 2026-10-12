'use strict';

// This function processes a given input string to find the smallest
// lowercase English letter not present in it, or 'None' if all are present.
function ProcessInput(rawData) {
  // The input string is assigned to a new constant for clarity.
  const sourceString = rawData;

  // A Set is used to store unique characters from the input string.
  const uniqueCharacters = new Set();

  // Iterate through each character of the input string.
  for (let charIndex = 0; charIndex < sourceString.length; charIndex++) {
    // Add the current character to the set of unique characters.
    uniqueCharacters.add(sourceString[charIndex]);
  }

  // Convert the set of unique characters to an array, sort it alphabetically,
  // and then reverse it to process from 'z' down to 'a'.
  const orderedUniqueChars = Array.from(uniqueCharacters.values()).sort();
  // Initialize the variable that will hold the result.
  // It starts with 'a', assuming 'a' is the smallest missing character.
  let nextLexicographicalChar = 'a';

  // Iterate over the unique characters in reverse alphabetical order.
  // This approach helps in finding the smallest missing character efficiently.
  for (let currentChar of orderedUniqueChars.reverse()) {
    // Determine the next character in alphabetical order based on the current character.
    switch (currentChar) {
      case 'a':
        nextLexicographicalChar = 'b';
        break;
      case 'b':
        nextLexicographicalChar = 'c';
        break;
      case 'c':
        nextLexicographicalChar = 'd';
        break;
      case 'd':
        nextLexicographicalChar = 'e';
        break;
      case 'e':
        nextLexicographicalChar = 'f';
        break;
      case 'f':
        nextLexicographicalChar = 'g';
        break;
      case 'g':
        nextLexicographicalChar = 'h';
        break;
      case 'h':
        nextLexicographicalChar = 'i';
        break;
      case 'i':
        nextLexicographicalChar = 'j';
        break;
      case 'j':
        nextLexicographicalChar = 'k';
        break;
      case 'k':
        nextLexicographicalChar = 'l';
        break;
      case 'l':
        nextLexicographicalChar = 'm';
        break;
      case 'm':
        nextLexicographicalChar = 'n';
        break;
      case 'n':
        nextLexicographicalChar = 'o';
        break;
      case 'o':
        nextLexicographicalChar = 'p';
        break;
      case 'p':
        nextLexicographicalChar = 'q';
        break;
      case 'q':
        nextLexicographicalChar = 'r';
        break;
      case 'r':
        nextLexicographicalChar = 's';
        break;
      case 's':
        nextLexicographicalChar = 't';
        break;
      case 't':
        nextLexicographicalChar = 'u';
        break;
      case 'u':
        nextLexicographicalChar = 'v';
        break;
      case 'v':
        nextLexicographicalChar = 'w';
        break;
      case 'w':
        nextLexicographicalChar = 'x';
        break;
      case 'x':
        nextLexicographicalChar = 'y';
        break;
      case 'y':
        nextLexicographicalChar = 'z';
        break;
      case 'z':
        // If 'z' is present, it means all letters 'a' through 'z' are present
        // up to this point in the reverse iteration, so no character is missing.
        nextLexicographicalChar = 'None';
        break;
    }
  }
  // Output the determined character to the console.
  console.log(nextLexicographicalChar);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
