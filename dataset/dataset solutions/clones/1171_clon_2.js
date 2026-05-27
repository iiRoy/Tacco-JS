let receivedInputData = ''; // A buffer to store all incoming data from standard input.

// Activate the standard input stream to begin listening for data.
process.stdin.resume();

// Configure the standard input stream to interpret incoming bytes as UTF-8 encoded characters.
process.stdin.setEncoding('utf8');

// Attach an event handler for the 'data' event, which fires when input data is available.
// Each received segment of data (inputChunk) is appended to our main data buffer.
process.stdin.on('data', (inputChunk) => {
  receivedInputData += inputChunk;
});

// Attach an event handler for the 'end' event, which signals that no more data will be received from standard input.
process.stdin.on('end', () => {
  // This array is declared but not utilized in the subsequent distance calculation.
  const initialCoordinates = [0, 0];

  // Process the accumulated input: remove leading/trailing whitespace, then split the string
  // by spaces to extract the four coordinate components (x1, y1, x2, y2).
  let [firstXCoord, firstYCoord, secondXCoord, secondYCoord] = receivedInputData.trim().split(' ');

  // Compute the Euclidean distance between the two points using the distance formula:
  // sqrt((x2 - x1)^2 + (y2 - y1)^2).
  const euclideanDistanceValue = Math.sqrt(
    Math.pow(firstXCoord - secondXCoord, 2) +
    Math.pow(firstYCoord - secondYCoord, 2)
  );

  // Display the calculated distance to the console, formatted to exactly six decimal places.
  console.log(euclideanDistanceValue.toFixed(6));
});
