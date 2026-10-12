// Acquire raw input from the standard input stream.
var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
var inputLines = sourceData.trim().split("\n");

// Extract the first line; its value is not used in subsequent calculations.
var firstLineContent = inputLines.shift();

// Extract the second line, which contains the logical expression to be evaluated.
var expressionString = inputLines.shift();

// Normalize the expression string by removing all space characters.
expressionString = expressionString.replace(/ /g, "");

// Iteratively reduce the expression string until only a single character remains.
while (expressionString.length !== 1) {
   // Find the first two characters and replace them based on a predefined rule set.
   expressionString = expressionString.replace(/../, function(currentPair) {
      // Rule 1: If the pair is "TT", replace with "T".
      if (currentPair === "TT") {
         return "T";
      }
      // Rule 2: If the pair is "TF", replace with "F".
      if (currentPair === "TF") {
         return "F";
      }
      // Rule 3: If the pair is "FT", replace with "T".
      if (currentPair === "FT") {
         return "T";
      }
      // Rule 4: If the pair is "FF", replace with "T".
      if (currentPair === "FF") {
         return "T";
      }
   });
}

// Output the final single-character result of the expression evaluation.
console.log(expressionString);
