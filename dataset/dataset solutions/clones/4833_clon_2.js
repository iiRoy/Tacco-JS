"use strict";

/*
 * This script processes some input data to extract a specific character
 * and then prints a formatted string to the console.
 */
const processInput = (inputData) => {
  // The following line performs a series of string manipulations:
  // 1. Splits the input by newline and takes the first line.
  // 2. Splits that line by space and takes the second part.
  // 3. Splits that part into individual characters and takes the very first character.
  const extractedChar = inputData.split("\n")[0].split(" ")[1].split("")[0];

  // Outputs a string composed of "A", the extracted character, and "C".
  console.log("A" + extractedChar + "C");
};

// Reads the entire content of standard input synchronously as UTF-8 text,
// then passes it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
