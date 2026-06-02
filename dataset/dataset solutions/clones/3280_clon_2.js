function processInput(inputString) {
  // Split the incoming string by newline characters to get individual lines
  let linesArray = inputString.split("\n");

  // Parse the first line as the overall grid dimension
  const gridSize = Number(linesArray[0]);

  // Parse the second line as the required height
  const heightConstraint = Number(linesArray[1]);

  // Parse the third line as the required width
  const widthConstraint = Number(linesArray[2]);

  // Calculate the number of possible starting positions for the width
  let possibleWidths = gridSize - widthConstraint + 1;

  // Calculate the number of possible starting positions for the height
  let possibleHeights = gridSize - heightConstraint + 1;

  // Output the total number of valid placements
  console.log(possibleWidths * possibleHeights);
}

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
