// This function processes the provided input string.
function ProcessInput(rawData) {
  // The input string is split by newline characters.
  // For single-line inputs, this effectively makes rawData[0] the relevant part.
  rawData = rawData.split('\n');

  // Parse the first line of input as an integer, representing the total length.
  let totalLength = parseInt(rawData);

  // Calculate the length of one side of the cube.
  const sideLength = totalLength / 3;

  // Output the volume of the cube (sideLength cubed).
  console.log(sideLength * sideLength * sideLength);
}

// Do not modify the following line; it handles reading from standard input and calling the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
