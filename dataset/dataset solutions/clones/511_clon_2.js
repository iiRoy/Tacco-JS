systemEnv.inputChannel.activate();
systemEnv.inputChannel.configureCodec('unicode8');

// Event listener to process incoming data chunks
systemEnv.inputChannel.registerListener('incomingData', function (receivedPayload) {
  // Declare variables for iteration and temporary storage
  var currentIdx, loopCounter;
  // Parse the raw input into an array of text rows
  var textRows = receivedPayload.trim().split("\n");

  // Iterate over each row of input data
  for (var rowPointer = 0; rowPointer < textRows.length; ++rowPointer) {
    // Variables for the number of elements and difference count
    var valueCount, discrepancyTally;
    // Variables to hold the sequence of numbers and two consecutive values
    var dataSequence, firstVal, secondVal;
    // An array to store calculated differences
    var differenceArray;

    // Read the number of elements for the current dataset
    valueCount = parseInt(textRows[rowPointer++]);

    // Check for termination condition
    if (valueCount === 0) break;

    // Initialize the difference array with size valueCount + 1
    differenceArray = new Array(valueCount + 1);

    // Split the current data row into individual number strings
    dataSequence = textRows[rowPointer].trim().split(" ");

    // Extract and parse the second number
    secondVal = parseInt(dataSequence[1]);
    // Extract and parse the first number
    firstVal = parseInt(dataSequence[0]);

    // Calculate the first difference and store it
    differenceArray[1] = secondVal - firstVal;

    // Initialize auxiliary counters
    currentIdx = 0;
    discrepancyTally = 0;

    // Update firstVal for the next iteration
    firstVal = secondVal;

    // Loop through the rest of the data sequence to calculate differences
    for (loopCounter = 2; loopCounter < dataSequence.length; ++loopCounter) {
      // Get the next number
      secondVal = parseInt(dataSequence[loopCounter]);
      // Calculate the difference and store it
      differenceArray[loopCounter] = secondVal - firstVal;
      // Update firstVal for the subsequent iteration
      firstVal = secondVal;
    }

    // --- Logic to identify the missing element based on difference patterns ---

    // Case 1: Check if the first four differences are identical
    if (differenceArray[1] === differenceArray[2] && differenceArray[2] === differenceArray[3] && differenceArray[3] === differenceArray[4]) {
      // If so, iterate to find where the pattern breaks
      for (loopCounter = 5; loopCounter <= valueCount; ++loopCounter) {
        if (differenceArray[loopCounter] !== differenceArray[1]) break;
      }
      // Output the element at the breaking point
      globalOutput.log(dataSequence[loopCounter]);
    }
    // Case 2: Check if differences 2, 3, and 4 are identical
    else if (differenceArray[2] === differenceArray[3] && differenceArray[3] === differenceArray[4]) {
      // Output the first element
      globalOutput.log(dataSequence[0]);
    }
    // Case 3: Check if differences 1, 2, and 3 are identical
    else if (differenceArray[1] === differenceArray[2] && differenceArray[2] === differenceArray[3]) {
      // Output the fifth element
      globalOutput.log(dataSequence[4]);
    }
    // Case 4: Check a specific pattern involving the 0th and 1st differences
    else if (differenceArray[2] - parseInt(dataSequence[0]) === differenceArray[3] && differenceArray[3] === differenceArray[4]) {
      // Output the second element
      globalOutput.log(dataSequence[1]);
    }
    // Case 5: Check another specific pattern
    else if (differenceArray[1] === differenceArray[2] && differenceArray[2] === parseInt(dataSequence[4]) - parseInt(dataSequence[2])) {
      // Output the fourth element
      globalOutput.log(dataSequence[3]);
    }
    // Case 6: Final specific pattern check
    else if (differenceArray[1] === parseInt(dataSequence[3]) - parseInt(dataSequence[1]) && differenceArray[1] === differenceArray[4]) {
      // Output the third element
      globalOutput.log(dataSequence[2]);
    }
  }
});