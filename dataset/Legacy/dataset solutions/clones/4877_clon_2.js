function ProcessString(sourceText) {
  // This variable stores the character encountered in the previous iteration.
  let previousSymbol = "";
  // This counter keeps track of how many times the character has changed.
  let changeCount = 0;

  // Iterate through the input string, character by character.
  for (let idx = 0; idx < sourceText.length; idx++) {
    // Extract the current character from the source text.
    const currentSymbol = sourceText.slice(idx, idx + 1);

    // Check if this is the very first character being processed.
    if (previousSymbol === "") {
      // If it's the first character, simply store it for future comparisons.
      previousSymbol = currentSymbol;
    } else {
      // If it's not the first character, compare it with the previously stored one.
      if (previousSymbol !== currentSymbol) {
        // If the current character is different, update the previous character
        // and increment the change counter.
        previousSymbol = currentSymbol;
        changeCount++;
      }
    }
  }
  // Output the final count of character changes to the console.
  console.log(changeCount);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the main processing function.
ProcessString(require("fs").readFileSync("/dev/stdin", "utf8"));
