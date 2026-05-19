process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data from standard input
process.stdin.on('data', function(inputData) {
  // Split the input data into individual lines
  var dataSegments, currentSegment;
  var segmentIndex, totalSegments;
  var charIndex, segmentLength;
  var currentDegree, powerValue, maximumDegree;

  dataSegments = inputData.split("\n");
  totalSegments = dataSegments.length;

  // Iterate through each received data segment
  for (segmentIndex = 0; segmentIndex < totalSegments; segmentIndex++) {
    currentSegment = dataSegments[segmentIndex];

    // Check for the termination condition
    if (currentSegment === "#") {
      break; // Exit the loop if '#' is encountered
    }

    // Replace directional strings with numerical representations
    currentSegment = currentSegment.replace(/north/g, 0);
    currentSegment = currentSegment.replace(/west/g, 1);

    // Initialize the degree accumulator
    currentDegree = 0;

    // Determine the length of the current segment and initial power value
    segmentLength = currentSegment.length;
    powerValue = currentSegment.length - 1;
    // Calculate the maximum possible degree for this segment
    maximumDegree = 90 * Math.pow(2, powerValue);

    // Process each character in the segment
    for (charIndex = 0; charIndex < segmentLength; charIndex++) {
      // Convert character to number for comparison (0 or 1)
      if (currentSegment[charIndex] * 1) {
        // If the character represents '1' (west), add to degree
        if (currentDegree < maximumDegree) {
          currentDegree += 90 * Math.pow(2, powerValue - charIndex);
        }
      } else {
        // If the character represents '0' (north), subtract from degree
        if (currentDegree > 0) {
          currentDegree -= 90 * Math.pow(2, powerValue - charIndex);
        }
      }
    }

    // Simplify the fraction by dividing by 2 as long as possible
    while (powerValue > 0 && currentDegree % 2 === 0) {
      currentDegree = currentDegree / 2;
      powerValue--;
    }

    // Output the result, either as a fraction or a whole number
    if (powerValue > 0) {
      console.log(currentDegree + "/" + Math.pow(2, powerValue));
    } else {
      console.log(currentDegree);
    }
  }
});
