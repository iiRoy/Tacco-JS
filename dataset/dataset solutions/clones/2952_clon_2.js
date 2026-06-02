function ProcessInput(rawData) {
  // Process the raw input data
  let processedLines = rawData.split("\n");

  // Extract numerical parameters from the first line
  const firstLineParts = processedLines[0].split(" ");
  const firstNum = parseInt(firstLineParts[0], 10);
  let secondNum = parseInt(firstLineParts[1], 10);

  // Retrieve the target string from the second line
  const targetString = processedLines[1];

  // Adjust the index for zero-based array access
  secondNum = secondNum - 1;

  // Determine the character at the adjusted index
  let charToModify = targetString[secondNum];

  // Apply transformation based on the character's value
  if (charToModify === 'A') {
    charToModify = 'a';
  } else if (charToModify === 'B') {
    charToModify = 'b';
  } else {
    charToModify = 'c';
  }

  // Construct the final string by replacing the character at the specific index
  const finalString = targetString.substring(0, secondNum) + charToModify + targetString.substring(secondNum + 1);

  // Output the resulting string to the console
  console.log(finalString);
}

// Standard input handling: read from stdin and invoke the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
