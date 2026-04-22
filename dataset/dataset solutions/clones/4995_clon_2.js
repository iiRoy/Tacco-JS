function ProcessInput(sourceText) { // Primary function to process the text
  sourceText = sourceText.split(""); // Transform the incoming string into an array of characters
  var characterFrequencies = []; // Declare an array to store frequency counts, acting as a hash map
  for (var indexPosition = 0; indexPosition < sourceText.length; indexPosition++) { // Iterate through each character of the input array
    if (characterFrequencies[sourceText[indexPosition]]) { // Check if the current character has been tallied before
      characterFrequencies[sourceText[indexPosition]]++; // Increment its existing tally
    } else {
      characterFrequencies[sourceText[indexPosition]] = 1; // Initialize the tally for this new character
    }
  }
  // console.log(characterFrequencies) // A deactivated log for development purposes
  var palindromeViable = true; // Initialize a boolean indicator; assume viability until proven otherwise
  Object.keys(characterFrequencies).forEach(function(symbolIdentifier) { // Traverse through all unique characters found
    if (characterFrequencies[symbolIdentifier] % 2 === 1) { // If any character's frequency count is odd
      palindromeViable = false; // Mark as not viable for a palindrome permutation
    }
  });
  if (palindromeViable) { // Based on the final state of the viability indicator
    console.log("Yes"); // Output confirmation
  } else {
    console.log("No"); // Output negation
  }
}
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim()); // Execute the main process using file system input