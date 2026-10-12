function processInput(sourceText) {
  // The input string is first divided into an array of lines.
  sourceText = sourceText.split("\n");

  // From the initial line, extract three numerical parameters.
  // The first parameter, 'rateFactor', is obtained by parsing the first space-separated token.
  var rateFactor = parseInt(sourceText[0].split(" ")[0]);
  // The second parameter, 'decrementValue', is obtained by parsing the second space-separated token.
  var decrementValue = parseInt(sourceText[0].split(" ")[1]);
  // The third parameter, 'currentResult', serves as the initial value for the iterative calculation.
  var currentResult = parseInt(sourceText[0].split(" ")[2]);

  // Execute a loop for a fixed number of iterations, specifically ten times.
  for (var loopCounter = 0; loopCounter < 10; loopCounter++) {
    // Update 'currentResult' using the formula: (rateFactor * currentResult) - decrementValue.
    currentResult = rateFactor * currentResult - decrementValue;
    // Display the newly computed 'currentResult' to the standard output.
    console.log(currentResult);
  }
}

// Read the entire content of the standard input file as a UTF-8 string,
// then pass this string to the 'processInput' function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
