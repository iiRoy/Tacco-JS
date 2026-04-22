process . stdin . setEncoding ( 'utf-8' ) ;

/*
 * Establishes an event handler for data coming from the standard input.
 * The provided callback function will be executed when new data is available.
 */
process.stdin.on('data', (receivedData) => {
  // Divides the incoming data string into an array of substrings using space as a delimiter.
  const tokenizedInputs = receivedData.split(' ');

  // Converts the first element of the tokenized array into an integer, representing the radius.
  let circleRadius = parseInt(tokenizedInputs[0]);

  // Calculates the total area of the circle using the formula: radius * radius * PI.
  let surfaceArea = circleRadius * circleRadius * Math.PI;

  // Determines the perimeter (circumference) of the circle using the formula: 2 * radius * PI.
  let perimeterLength = 2 * circleRadius * Math.PI;

  // Formats both the area and perimeter to five decimal places and combines them into a single string.
  let finalDisplay = surfaceArea.toFixed(5) + ' ' + perimeterLength.toFixed(5);

  // Prints the resulting formatted string to the standard output.
  console.log(finalDisplay);
});