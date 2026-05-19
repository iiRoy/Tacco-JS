var receivedData = ''; // Initialize a string to accumulate incoming data
var inputSource = process.stdin; // Reference to the standard input stream

// Resume the input stream to start receiving data
inputSource.resume();

// Set the encoding for the input stream to UTF-8
inputSource.setEncoding('utf-8');

// Attach a 'data' event listener to append each chunk to 'receivedData'
inputSource.on('data', function(dataChunk) {
  receivedData += dataChunk;
});

// Attach an 'end' event listener to process all received data once the input stream closes
inputSource.on('end', function() {
  // Split the accumulated data into lines
  var parsedLines = receivedData.split('\n');

  // Parse the first line as the count of elements
  var count = parseInt(parsedLines[0]);

  // Parse the second line as the first vector (vectorA)
  var vectorA = parsedLines[1].split(' ').map(Number);

  // Parse the third line as the second vector (vectorB)
  var vectorB = parsedLines[2].split(' ').map(Number);

  // Initialize variables for different distance calculations
  var manhattanDistance = 0; // For L1 norm
  var euclideanSquaredSum = 0; // For L2 norm (squared sum)
  var minkowskiPower3Sum = 0; // For L3 norm (sum of cubes)
  var chebyshevDistance = 0; // For L-infinity norm (maximum absolute difference)

  // Array to store absolute differences between corresponding elements of vectorA and vectorB
  var absoluteDifferences = [];

  // Loop through each element of the vectors
  for (var idx = 0; idx < count; idx++) {
    // Calculate the absolute difference for the current pair of elements
    var currentDiff = Math.abs(vectorA[idx] - vectorB[idx]);
    absoluteDifferences.push(currentDiff);

    // Accumulate for Manhattan distance (L1 norm)
    manhattanDistance += currentDiff;

    // Accumulate for Euclidean distance squared (L2 norm squared)
    euclideanSquaredSum += Math.pow(currentDiff, 2);

    // Accumulate for Minkowski p=3 distance (sum of cubes)
    minkowskiPower3Sum += Math.pow(currentDiff, 3);

    // Update Chebyshev distance (L-infinity norm)
    chebyshevDistance = Math.max(chebyshevDistance, currentDiff);
  }

  // Output the calculated distances
  // L1 norm (Manhattan distance)
  console.log(manhattanDistance);

  // L2 norm (Euclidean distance)
  console.log(Math.sqrt(euclideanSquaredSum));

  // Cube root of the sum of squares (as per original logic, not L3 norm)
  console.log(Math.pow(euclideanSquaredSum, 1 / 3));

  // L-infinity norm (Chebyshev distance)
  console.log(chebyshevDistance);
});
