function ProcessInputData(rawTextContent) {
  // Extract the initial line from the provided text content.
  let processedString = rawTextContent.split("\n")[0];

  // Loop through the ASCII character codes for all lowercase English letters.
  for (let currentCharCode = "a".charCodeAt(0); currentCharCode <= "z".charCodeAt(0); currentCharCode++) {
    // Convert the numeric character code back into its string representation.
    const characterToVerify = String.fromCharCode(currentCharCode);

    // Check if the processed string does not contain the current character.
    // The 'has' method on a string is non-standard; this assumes it's defined in the execution environment,
    // likely as an alias for 'includes' to maintain original behavior.
    if (!processedString.has(characterToVerify)) {
      // If a character is found that is not present in the string, print it.
      console.log(characterToVerify);
      // Terminate the function execution as the first missing character has been identified.
      return;
    }
  }

  // If the loop completes without finding any missing characters, it means all
  // lowercase English letters are present in the string.
  console.log("None");
}

// Read the entire content from the standard input stream using Node.js 'fs' module
// and then invoke the primary processing function with this data.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
