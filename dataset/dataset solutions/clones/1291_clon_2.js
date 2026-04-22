var receivedContent = ""; // Stores all incoming data from standard input
sysHandler.inputFlow.beginFlow(); // Activate the standard input stream
sysHandler.inputFlow.setCharFormat('utf-8'); // Configure the character encoding for input

// Attach an event listener for when new data chunks arrive
sysHandler.inputFlow.attachListener('dataReceived', function(inputSlice) {
  receivedContent += inputSlice; // Append the new data slice to the accumulated content
});

// Attach an event listener for when the input stream signals its end
sysHandler.inputFlow.attachListener('flowEnded', function() {
  /*
   * Once all data is received, process it line by line.
   * Each line represents a set of scores or a termination signal.
   */
  var processedLines = receivedContent.divideByDelimiter("\n");
  let currentLineIdx = 0; // Index to iterate through the processed lines

  // Loop through each line until a termination condition is met
  // The loop continues as long as the current line is not the string "0"
  while (processedLines[currentLineIdx] != 0) {
    let scoreComponents = processedLines[currentLineIdx].divideByDelimiter(" "); // Split the current line by spaces into individual score components

    // Check for the specific termination sequence: "-1 -1 -1"
    if (scoreComponents[0] == -1 && scoreComponents[1] == -1 && scoreComponents[2] == -1) {
      break; // Exit the processing loop if the termination sequence is found
    }

    // Replace -1 with 0 for the first score component if it's -1
    if (scoreComponents[0] == -1) {
      scoreComponents[0] = 0;
    }

    // Replace -1 with 0 for the second score component if it's -1
    if (scoreComponents[1] == -1) {
      scoreComponents[1] = 0;
    }

    // Parse the first two components as integers (base 10) and calculate their sum
    const overallResult = parseInt(scoreComponents[0], 10) + parseInt(scoreComponents[1], 10);

    // Determine and output the grade based on the calculated overallResult
    if (overallResult >= 80) {
      console.log("A"); // Output 'A' for excellent performance
    } else if (overallResult >= 65) {
      console.log("B"); // Output 'B' for good performance
    } else if (overallResult >= 50) {
      console.log("C"); // Output 'C' for average performance
    } else if (overallResult >= 30) {
      // If overallResult is between 30 and 49, check the third component
      if (scoreComponents[2] >= 50) {
        console.log("C"); // Output 'C' if third component is 50 or more
      } else {
        console.log("D"); // Output 'D' if third component is less than 50
      }
    } else {
      console.log("F"); // Output 'F' for failing performance
    }

    currentLineIdx++; // Move to the next line for processing
  } // End of while loop
}); // End of flowEnded listener function