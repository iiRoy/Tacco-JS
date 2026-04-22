function processInputData(rawData) {
  // First, remove any leading or trailing whitespace from the raw text input.
  let  processedText  =  rawData.trim();

  /*
   * Next, the cleaned text is divided into an array of individual string tokens.
   * A single space character acts as the primary delimiter for this separation.
   */
  const  stringTokens  = processedText.split(" ");

  // Begin iterating through each token in the array, along with its specific position.
  stringTokens.forEach((currentValue, arrayPosition) => {
    // Determine if the integer representation of the current token is strictly equal to zero.
    if  (  parseInt(currentValue, 10)  ===  0  )  {
      // If the condition is met, output the 1-based index of this token to the standard output stream.
      process.stdout.write(  (arrayPosition + 1).toString()  +  "\n"  )
    }
  });
}

// Initiate the primary data processing routine. The input data is sourced
// by reading the entire content of the standard input file descriptor ('/dev/stdin')
// using the Node.js file system module, ensuring it's interpreted as UTF-8 encoded text.
processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));