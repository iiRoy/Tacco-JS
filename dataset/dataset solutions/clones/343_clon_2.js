function executeProgram() {
  // This nested function computes the lowest possible cost for a specified total weight.
  function calculateCost(targetWeightAmount) {
    // Declare all necessary local variables for the algorithm.
    let outerIterationCounter, innerIterationCounter, currentItemWeight, totalAchievedWeight, itemUnitCounts, currentCombinationEntry,
        lowestAchievedPrice, temporaryCombinationsArray,
        // Initialize the collection of weight combinations with a starting point (0 weight, empty counts array).
        currentCombinationsArray = [[0, []]];

    // The main loop iterates through different categories of items (e.g., 200g, 300g, 500g units).
    for (outerIterationCounter = 0; outerIterationCounter < 3; outerIterationCounter++) {
      // Assign the weight for the item category being processed in this iteration.
      currentItemWeight = [200, 300, 500][outerIterationCounter];
      // Prepare a new array to store combinations generated in the current pass.
      temporaryCombinationsArray = [];
      // Process each existing combination from the previous step.
      while (currentCombinationEntry = currentCombinationsArray.shift()) {
        // Extract the accumulated weight and the array of item counts from the current combination.
        totalAchievedWeight = currentCombinationEntry[0];
        itemUnitCounts = currentCombinationEntry[1];
        // Inner loop: try adding multiple units of the current item type.
        for (innerIterationCounter = 0; (innerIterationCounter * currentItemWeight + totalAchievedWeight) <= targetWeightAmount; innerIterationCounter++) {
          // Store the new total weight and updated item counts.
          temporaryCombinationsArray.push([innerIterationCounter * currentItemWeight + totalAchievedWeight, itemUnitCounts.concat(innerIterationCounter)]);
        }
        // This line adds a combination where the inner loop counter might have incremented one too many times,
        // potentially resulting in a total weight exceeding the target. This preserves the original code's structure.
        temporaryCombinationsArray.push([innerIterationCounter * currentItemWeight + totalAchievedWeight, itemUnitCounts.concat(innerIterationCounter)]);
      }
      // Update the main combinations array with the newly generated ones for the next iteration.
      currentCombinationsArray = temporaryCombinationsArray;
      // Original debugging line, kept commented out.
      // console.log(currentCombinationsArray);
    }

    // This reassignment is structurally identical to the original code, despite being redundant.
    currentCombinationsArray = temporaryCombinationsArray;
    // Another original debugging line, also kept commented out.
    // console.log(currentCombinationsArray);

    // Initialize the variable to hold the minimum price found, setting it to an extremely high value.
    lowestAchievedPrice = Infinity;

    // Iterate through all the final combinations to find the exact target weight and its corresponding lowest price.
    while (currentCombinationEntry = currentCombinationsArray.shift()) {
      // Extract the total weight for the current combination.
      totalAchievedWeight = currentCombinationEntry[0];
      // If the total weight does not match the desired target, skip this combination and move to the next.
      if (totalAchievedWeight !== targetWeightAmount) continue;

      // Retrieve the individual counts for each item type from the current combination.
      itemUnitCounts = currentCombinationEntry[1];
      // Calculate the total price for this specific combination, applying discounts based on quantities.
      // Price component for the first item type (e.g., 200g units), including bulk discounts.
      currentCombinationEntry = ((itemUnitCounts[0] % 5) * 380) + (~~(itemUnitCounts[0] / 5) * 5 * (380 * 0.8))
        // Price component for the second item type (e.g., 300g units) with its own discount logic.
        + ((itemUnitCounts[1] % 4) * 550) + (~~(itemUnitCounts[1] / 4) * 4 * (550 * 0.85))
        // Price component for the third item type (e.g., 500g units) with its specific discount application.
        + ((itemUnitCounts[2] % 3) * 850) + (~~(itemUnitCounts[2] / 3) * 3 * (850 * 0.88));

      // Update the minimum price if the current combination yields a lower total cost.
      lowestAchievedPrice = currentCombinationEntry < lowestAchievedPrice ? currentCombinationEntry : lowestAchievedPrice;
    }
    // Return the minimum calculated price for the given target weight.
    return lowestAchievedPrice;
  }

  // A boolean flag to control the termination of input line processing.
  let processingFinished = false;
  // Iterate over each line collected from the standard input.
  rawInputBuffer.forEach(function(currentInputLine) {
    // If the current line is empty or if the termination flag is set, skip processing.
    if (currentInputLine.trim() === '' || processingFinished) {
      return;
    }
    // Check if the current line contains the termination signal (the number 0).
    if (currentInputLine == 0) {
      processingFinished = true; // Set the flag to stop further processing.
      return;
    }
    // Convert the input line to an integer, calculate its cost, and print the result to console.
    console.log(calculateCost(parseInt(currentInputLine, 10)));
  });
}

// Global variable to accumulate all data received from standard input.
let rawInputBuffer = '';

// Activate the standard input stream to listen for data.
process.stdin.resume();
// Specify the character encoding for the incoming data stream.
process.stdin.setEncoding('utf8');
// Register an event handler for when data chunks are available from stdin.
process.stdin.on('data', function(incomingDataChunk) {
  rawInputBuffer += incomingDataChunk; // Append the new chunk to the buffer.
});
// Register an event handler for when the standard input stream has ended.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of individual lines.
  rawInputBuffer = rawInputBuffer.split('\n');
  // Once all input has been received and processed, execute the main program logic.
  executeProgram();
});