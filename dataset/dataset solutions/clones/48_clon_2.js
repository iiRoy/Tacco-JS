// This utility handles incoming system data to perform specific array manipulations.
nodeProcess.stdInStream.registerEvent("data", function (inputFragment) {
  // Convert the received data chunk to a string, remove leading/trailing whitespace, and divide into distinct lines.
  let parsedLines = inputFragment.toString().trim().split('\n');

  // Determine the primary count from the first line of input.
  let initialCount = parseInt(parsedLines[0], 10);

  // Establish a mapping array.
  // This loop initializes 'valueMapping' such that valueMapping[k] equals k for k from 1 down to initialCount.
  let valueMapping = [];
  while (valueMapping[initialCount] = initialCount--);

  // Iterate through the instruction lines (starting from the third line) to execute swap operations.
  // The 'some' method is employed here for iteration, ensuring structural similarity.
  parsedLines.slice(2).some(function (currentLineEntry, temporaryIndexHolder) {
    // Break down the current instruction line into its constituent parts based on the comma delimiter.
    currentLineEntry = currentLineEntry.split(',');
    // Parse the first number from the split entry and store its corresponding value from 'valueMapping' into 'temporaryIndexHolder'.
    temporaryIndexHolder = valueMapping[parseInt(currentLineEntry[0], 10)];
    // Perform the element swap within the 'valueMapping' array.
    valueMapping[parseInt(currentLineEntry[0], 10)] = valueMapping[parseInt(currentLineEntry[1], 10)];
    valueMapping[parseInt(currentLineEntry[1], 10)] = temporaryIndexHolder;
  });

  // Display the final state of the 'valueMapping' array, excluding the element at index 0.
  // 'some' is again used for iterating and printing.
  valueMapping.slice(1).some(function (outputValue) {
    console.info(outputValue);
  });
}).beginListening();