let rawInputBuffer = ''; // Buffer to accumulate all incoming standard input data
const dataStream = process.stdin; // Access the standard input stream

dataStream.resume(); // Start reading data from stdin
dataStream.setEncoding('utf8'); // Set the encoding for the incoming data

// Event listener for when data chunks are received
dataStream.on('data', function (segment) {
  rawInputBuffer += segment; // Append the received chunk to the buffer
});

// Event listener for when the input stream has ended
dataStream.on('end', function () {
  // Process the entire collected input data
  const processedLines = rawInputBuffer.split('\n');

  // Parse the first line to get the count of elements
  const elementCount = parseInt(processedLines[0], 10);

  // Parse the second line into the first numeric vector
  let firstVector = processedLines[1].split(' ').map(Number);

  // Parse the third line into the second numeric vector
  let secondVector = processedLines[2].split(' ').map(Number);

  // Initialize variables for different distance calculations
  let manhattanDist = 0.0; // Corresponds to Dxy (L1 norm)
  let euclideanSq = 0.0;   // Corresponds to Dxy2 (Squared L2 norm)
  let p3NormCubed = 0.0;   // Corresponds to Dxy3 (Cubed L3 norm)
  let chebyshevDist = 0.0; // Corresponds to Dmax (L-infinity norm)

  // Array to store absolute differences between corresponding elements
  const absoluteDifferences = [];

  // Loop through each pair of elements to calculate differences and update norms
  for (let idx = 0; idx < elementCount; idx++) {
    // Calculate the absolute difference for the current pair
    const currentAbsDiff = Math.abs(firstVector[idx] - secondVector[idx]);
    absoluteDifferences.push(currentAbsDiff);

    // Accumulate for Manhattan Distance (L1 norm)
    manhattanDist += currentAbsDiff;

    // Accumulate for squared Euclidean Distance (L2 norm squared)
    euclideanSq += Math.pow(currentAbsDiff, 2);

    // Accumulate for cubed L3 norm
    p3NormCubed += Math.pow(currentAbsDiff, 3);

    // Update Chebyshev Distance (L-infinity norm)
    chebyshevDist = Math.max(chebyshevDist, currentAbsDiff);
  }

  // Output the calculated distances
  console.log(manhattanDist); // L1 Norm (Manhattan Distance)
  console.log(Math.sqrt(euclideanSq)); // L2 Norm (Euclidean Distance)
  console.log(Math.pow(p3NormCubed, 1.0 / 3.0)); // L3 Norm
  console.log(chebyshevDist); // L-infinity Norm (Chebyshev Distance)
});