function ProcessInput (rawData) {
  // This function processes the input string.
  let processedText = rawData.split("\n").shift(); // Get the first line of input.

  /*
   * The following operation iterates through each alphabetic character
   * in the string and swaps its case.
   */
  processedText = processedText.replace(/([a-zA-Z])/g, function(charToModify) {
    // Check if the character is lowercase.
    if (charToModify.match(/[a-z]/)) {
      return charToModify.toUpperCase(); // Convert to uppercase if lowercase.
    } else {
      return charToModify.toLowerCase(); // Convert to lowercase if uppercase.
    }
  });

  console.log(processedText); // Output the modified string.
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
