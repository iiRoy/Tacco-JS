(async function processComputationalTask() { // An asynchronous procedure to handle data processing.
  let rawInputData = ""; // Storage for all incoming data.
  // Iterate through incoming data streams and concatenate them.
  for await (const dataSegment of process.stdin) {
    rawInputData += dataSegment;
  }

  // Divide the aggregated input into distinct lines.
  const inputRows = rawInputData.split(/\n/);

  // Extract primary parameters (number of items and iteration count) from the first line.
  // Note: Using parseInt for explicit number conversion.
  const [itemCount, iterationsCount] = inputRows.shift().split(/\s/).map(numericString => parseInt(numericString, 10));

  // Initialize the main data structure.
  // Each entry consists of: [initial_value, current_calculated_value, division_counter].
  let valueSets = inputRows[0]
                    .split(/\s/)
                    .slice(0, itemCount)
                    .map(numericString => {
                        const val = parseInt(numericString, 10);
                        return [val, val, 1];
                    });

  // Perform a series of adjustments based on the iteration count.
  for (let loopCounter = 0; loopCounter < iterationsCount; loopCounter++) {
    // Find the data set with the highest 'current_calculated_value'.
    let highestValueEntry = valueSets.reduce((accumulatorItem, currentItem) =>
      accumulatorItem[1] > currentItem[1] ? accumulatorItem : currentItem
    );

    // Increment the division counter for this specific data set.
    highestValueEntry[2]++;

    // Recalculate the 'current_calculated_value' using the initial_value and updated division_counter.
    highestValueEntry[1] = highestValueEntry[0] / highestValueEntry[2];
  }

  // After all iterations, identify the final data set with the maximum 'current_calculated_value'.
  let finalHighestEntry = valueSets.reduce((accumulatorItem, currentItem) =>
    accumulatorItem[1] > currentItem[1] ? accumulatorItem : currentItem
  );

  // Output the ceiling of the final maximum calculated value.
  console.log(Math.ceil(finalHighestEntry[1]));
})();