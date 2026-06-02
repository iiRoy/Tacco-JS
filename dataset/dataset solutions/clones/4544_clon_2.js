function ProcessInput(rawData) {
  // Clean up the incoming data by removing leading/trailing whitespace.
  rawData = rawData.trim();

  // Initialize a collection of all lowercase English alphabet characters.
  var availableChars = "abcdefghijklmnopqrstuvwxyz".split("");

  // Iterate through each character of the processed input string.
  for (var idx = 0; idx < rawData.length; idx++) {
    // Extract the current character at the current index.
    var currentChar = rawData.slice(idx, idx + 1);

    // Check if the current character exists in our collection of available characters.
    if (availableChars.indexOf(currentChar) !== -1) {
      // If found, remove this character from the collection to mark it as used.
      availableChars.splice(availableChars.indexOf(currentChar), 1);
    } else {
      // If the character is not found (meaning it's either not a lowercase letter
      // or it has already been used), print "no" and terminate the function.
      console.log("no");
      return;
    }
  }

  // If the loop completes without encountering any issues, it means all characters
  // in the input were unique lowercase letters from the alphabet.
  console.log("yes");
}

// Execute the main processing function with content read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
