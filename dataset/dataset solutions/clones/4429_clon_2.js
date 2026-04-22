// This function is designed to process an incoming text string
function ProcessTextualInput(initialDataString) {
  /*
   * First, we break down the entire input string into an array of individual characters.
   * This allows for easy access to specific positions within the string.
   */
  const charSequence = initialDataString
    .split('');

  // Now, we extract the middle segment of the string.
  // It starts after the first character and ends before the last character.
  const centralPortion = initialDataString
    .substring(
      1,
      charSequence.length - 1
    );

  // We capture the very first character for later use.
  const initialCharacter = charSequence[0];

  // And similarly, we get the very last character of the sequence.
  const finalCharacter = charSequence[charSequence.length - 1];

  // Finally, we combine the initial character, the length of the central part,
  // and the final character into a single output string.
  // The length is implicitly converted to a string during concatenation.
  console.log(
    initialCharacter +
    centralPortion.length +
    finalCharacter
  );
}


// Here we invoke the primary processing function.
// It reads the entire content from standard input as a UTF-8 string.
ProcessTextualInput(
  require("fs")
    .readFileSync(
      "/dev/stdin",
      "utf8"
    )
);