function ProcessInput(inputData) {
  // This function processes the raw input string to determine a conflict outcome.

  // First, split the input by newlines, then each line by spaces,
  // and finally parse all resulting string segments into integers.
  let parsedLines = inputData
    .split('\n')
    .map( (lineSegment) => lineSegment.split(' ').map( (numericString) => parseInt(numericString, 10) ) );

  // Extract specific coordinate values from the first processed line.
  // The first two elements are ignored as per the original logic.
  let [ , , capitalXCoord, capitalYCoord] = parsedLines[0];

  // Assign the arrays of x and y coordinates from the second and third lines.
  let xCoordinates = parsedLines[1];
  let yCoordinates = parsedLines[2];

  // Append the extracted capital coordinates to their respective arrays.
  xCoordinates.push(capitalXCoord);
  yCoordinates.push(capitalYCoord);

  // Calculate the maximum value within the xCoordinates array.
  // The 'reduce' method iterates through the array to find the highest number.
  let maximumX = xCoordinates.reduce((currentMax, elementValue) => Math.max(currentMax, elementValue));

  // Calculate the minimum value within the yCoordinates array.
  // The 'reduce' method iterates through the array to find the lowest number.
  let minimumY = yCoordinates.reduce((currentMin, elementValue) => Math.min(currentMin, elementValue));

  // Compare the maximum x-coordinate with the minimum y-coordinate
  // to decide the outcome.
  if (maximumX < minimumY) {
    console.log('No War'); // Output for a peaceful resolution.
  } else {
    console.log('War'); // Output for a conflict scenario.
  }
}

// Read the entire content of the standard input file synchronously
// and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
