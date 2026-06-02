var receivedData = ''; // Stores all incoming data from stdin
var inputStream = process.stdin; // Reference to the standard input stream

// Ensure the input stream is active and ready to receive data
inputStream.resume();

// Set the character encoding for the incoming data
inputStream.setEncoding('utf-8');

// Event listener for when data chunks are received
inputStream.on('data', function(dataSegment) {
  // Append each received data chunk to the main data string
  receivedData += dataSegment;
});

// Event listener for when the input stream has ended (no more data)
inputStream.on('end', function() {
  // Split the accumulated data into an array of lines
  var linesArray = receivedData.split('\n');

  // Parse the first line as the number of elements (n)
  var countElements = parseInt(linesArray[0]);

  // Parse the second line into an array of numbers for vector A
  var vectorA = linesArray[1].split(' ').map(Number);

  // Parse the third line into an array of numbers for vector B
  var vectorB = linesArray[2].split(' ').map(Number);

  // Initialize variables for different distance calculations
  var manhattanDistance = 0; // L1 norm (Manhattan distance)
  var euclideanSquaredSum = 0; // Sum of squared differences for L2 norm
  var minkowskiCubedSum = 0; // Sum of cubed differences for L3 norm
  var chebyshevDistance = 0; // L-infinity norm (Chebyshev distance)

  var currentDifference; // Temporary variable to store absolute difference

  // Iterate through the elements of the vectors
  for (var idx = 0; idx < countElements; idx++) {
    // Calculate the absolute difference between corresponding elements
    currentDifference = Math.abs(vectorA[idx] - vectorB[idx]);

    // Accumulate for Manhattan distance
    manhattanDistance += currentDifference;

    // Accumulate for Euclidean distance (squared)
    euclideanSquaredSum += Math.pow(currentDifference, 2);

    // Accumulate for Minkowski distance (cubed)
    minkowskiCubedSum += Math.pow(currentDifference, 3);

    // Update Chebyshev distance if current difference is greater
    chebyshevDistance = Math.max(chebyshevDistance, currentDifference);
  }

  // Output the calculated distances
  console.log(manhattanDistance);
  console.log(Math.sqrt(euclideanSquaredSum)); // L2 norm (Euclidean distance)
  console.log(Math.pow(minkowskiCubedSum, 1 / 3)); // L3 norm (Minkowski distance with p=3)
  console.log(chebyshevDistance);
});
