function processInputCoordinates(inputLines) {
  // Parse the first line of input to extract coordinate strings
  const coordinateStrings = inputLines[0].split(/\s+/);

  // Convert string coordinates to floating-point numbers
  const firstX = parseFloat(coordinateStrings[0]);
  const firstY = parseFloat(coordinateStrings[1]);
  const secondX = parseFloat(coordinateStrings[2]);
  const secondY = parseFloat(coordinateStrings[3]);

  // Calculate the Euclidean distance between the two points
  // Note: The original code uses Math.abs for both (x2-x1) and (y2-y1)
  // which is equivalent to squaring them for distance calculation,
  // as (val)^2 = (abs(val))^2.
  const calculatedDistance = Math.sqrt(Math.abs(secondX - firstX) + Math.abs(secondY - firstY));

  // Output the calculated distance, formatted to 6 decimal places
  console.log(calculatedDistance.toFixed(6));
}

// This function is present in the original code but not called by the main logic.
// It's cloned as per Type II rules.
function rearrangeString(inputString, splitPoint) {
  // Splits the string at 'splitPoint' and concatenates the parts in reverse order
  return inputString.substr(splitPoint, inputString.length - splitPoint) + inputString.substr(0, splitPoint);
}

// Array to store incoming data chunks from standard input
const dataParts = [];

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function(dataSegment) {
  dataParts.push(dataSegment);
});

// Event listener for 'end' of stdin stream
process.stdin.on('end', function() {
  // Join all data chunks into a single string and split by newline to get an array of lines
  const allInputLines = dataParts.join('').split('\n');
  // Call the main processing function with the collected lines
  processInputCoordinates(allInputLines);
});
