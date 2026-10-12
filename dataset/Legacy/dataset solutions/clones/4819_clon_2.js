function ProcessInput(rawData) {
  // This function processes the given input data.

  let charValue = String(rawData); // Convert the raw input to a string.

  /*
   * Check if the character is one of the standard English vowels.
   * The comparison is case-sensitive as per the original logic.
   */
  if (charValue === 'a' || charValue === 'i' || charValue === 'u' || charValue === 'e' || charValue === 'o') {
    console.log('vowel'); // Output 'vowel' if it matches.
  } else {
    console.log('consonant'); // Otherwise, output 'consonant'.
  }
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
