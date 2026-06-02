function processInput(rawData) {
  // Split the raw input string by spaces to get individual arguments.
  const tokenizedValues = rawData.split(' ');

  // Parse the first three tokens as integers.
  let valX = parseInt(tokenizedValues[0], 10);
  let valY = parseInt(tokenizedValues[1], 10);
  let valZ = parseInt(tokenizedValues[2], 10);

  // Perform the first swap: exchange values of valX and valY.
  [valX, valY] = [valY, valX];

  // Perform the second swap: exchange values of valX and valZ.
  // Note: valX now holds the original valY's value.
  [valX, valZ] = [valZ, valX];

  // Output the final values in a space-separated format.
  console.log(`${valX} ${valY} ${valZ}`);
}

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
