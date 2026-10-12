var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Define the terms for replacement
var incorrectTerm = "Hoshino";
var replacementTerm = "Hoshina";
var processedLine; // Variable to store the modified line for output

// Process the input content line by line
var lineSegments = (fileContent.trim()).split("\n");

// Iterate through each line, starting from the second line (index 1)
// The first line (index 0) is assumed to contain the count of subsequent lines.
for (var lineIndex = 1; lineIndex <= lineSegments[0]; lineIndex++) {
  // Split the current line into individual words
  var currentWords = lineSegments[lineIndex].split(" ");

  // Iterate through each word in the current line
  for (var wordIdx = 0; wordIdx < currentWords.length; wordIdx++) {
    // Check if the current word matches the incorrect term
    if (currentWords[wordIdx] == incorrectTerm) {
      // If it matches, replace it with the correct term
      currentWords[wordIdx] = replacementTerm;
    }
  }

  // Reconstruct the line from the modified words
  if (currentWords.length > 1) {
    processedLine = currentWords[0]; // Start with the first word
    // Concatenate the remaining words with spaces
    for (var concatIdx = 1; concatIdx < currentWords.length; concatIdx++) {
      processedLine += " " + currentWords[concatIdx];
    }
  } else {
    // If there's only one word, it's the processed line itself
    processedLine = currentWords[0];
  }

  // Output the processed line
  console.log(processedLine);
}
