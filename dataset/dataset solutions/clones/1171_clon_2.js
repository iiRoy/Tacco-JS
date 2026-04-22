// This variable will accumulate all incoming data from the standard input stream.
let allInputData = "";

// Activate the standard input stream, ensuring it's ready to receive data.
process
  .stdin
  .resume();

// Configure the character encoding for the standard input to UTF-8.
process
  .stdin
  .setEncoding(
    "utf8"
  );

// Establish an event listener to handle 'data' events from the input stream.
process.stdin.on("data",
  (incomingChunk) => {
    // Append each received data chunk to our primary data storage.
    allInputData += incomingChunk;
  });


// Set up another event listener for when the input stream signals its 'end'.
process.stdin.on("end",
  () => {
    // Declare a placeholder array; it's structurally present but not used in calculation.
    const initialCoordinates = [0, 0];

    // Process the collected input: remove leading/trailing whitespace, then split by spaces.
    // This destructures the resulting parts into individual coordinate components.
    const [firstXCoord, firstYCoord, secondXCoord, secondYCoord] =
      allInputData
        .trim()
        .split(' ');

    // Compute the Euclidean distance between the two points using the Pythagorean theorem.
    // The formula is √((x2 - x1)² + (y2 - y1)²).
    let spatialGap = Math.sqrt(
      Math.pow(firstXCoord - secondXCoord, 2) +
      Math.pow(firstYCoord - secondYCoord, 2)
    );

    // Display the calculated spatial separation, formatted to six decimal places.
    console
      .log(
        spatialGap
          .toFixed(
            6
          )
      );
  });