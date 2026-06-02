var receivedData = ""; // This variable will accumulate all incoming data from standard input.

process.stdin.resume(); // Activate the standard input stream to begin listening for data.

process.stdin.setEncoding('utf-8'); // Configure the character encoding for the standard input stream.

// Register a callback function to handle 'data' events from stdin.
// Each segment of data (chunk) is appended to our data accumulator.
process.stdin.on('data', function(incomingChunk) {
  receivedData += incomingChunk; // Concatenate the new data chunk.
});

// Register a callback function to execute when the standard input stream ends.
// This signifies that all input has been received.
process.stdin.on('end', function() {
  // Process the accumulated data by splitting it into individual lines.
  receivedData = receivedData.split("\n");

  // Initialize an index to traverse through the lines of processed input.
  var idx = 0;

  // Begin a loop that continues as long as the current line is not the termination signal "0".
  while (receivedData[idx] != 0) {
    // Split the current line into an array of string parts, using space as a delimiter.
    var scoreParts = receivedData[idx].split(" ");

    // Check for a specific sentinel value (-1 -1 -1) to indicate an early exit.
    if (scoreParts[0] == -1 && scoreParts[1] == -1 && scoreParts[2] == -1) {
      break; // Terminate the loop immediately.
    }

    // If the first score component is -1, treat it as 0.
    if (scoreParts[0] == -1) {
      scoreParts[0] = 0;
    }

    // If the second score component is -1, treat it as 0.
    if (scoreParts[1] == -1) {
      scoreParts[1] = 0;
    }

    // Calculate the combined score by converting the first two parts to integers and summing them.
    // The radix 10 is specified for robust parsing.
    var totalScore = parseInt(scoreParts[0], 10) + parseInt(scoreParts[1], 10);

    // Evaluate the total score to assign a letter grade.
    if (totalScore >= 80) {
      console.log("A"); // Output 'A' for scores 80 and above.
    } else if (totalScore >= 65) {
      console.log("B"); // Output 'B' for scores between 65 and 79.
    } else if (totalScore >= 50) {
      console.log("C"); // Output 'C' for scores between 50 and 64.
    } else if (totalScore >= 30) {
      // For scores between 30 and 49, an additional condition applies based on the third part.
      if (scoreParts[2] >= 50) {
        console.log("C"); // Output 'C' if the third part is 50 or more.
      } else {
        console.log("D"); // Otherwise, output 'D'.
      }
    } else {
      console.log("F"); // Output 'F' for any score below 30.
    }

    // Advance the index to the next line for the subsequent iteration.
    idx++;
  }
});
