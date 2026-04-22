// This function processes a given data source to calculate a specific score.
function processData(dataSource) {
  // Extract the first numerical parameter from the initial line of input.
  // This value typically represents the total number of items to consider.
  let itemCount = Number(dataSource[0].split(" ")[0]);
  // Extract the second numerical parameter, representing available capacity or budget.
  let capacity = Number(dataSource[0].split(" ")[1]);

  // Parse the second line of input: split into individual string tokens,
  // convert each token to a numerical value, and then sort these numbers
  // in a descending order, from largest to smallest.
  const sortedValues = dataSource[1].split(" ").map(val => Number(val)).sort((first, second) => second - first);

  // Initialize a variable to accumulate the final calculated score or total.
  let totalScore = 0;

  // This label allows breaking out of both the outer and inner loops
  // simultaneously, providing a clean exit point based on capacity conditions.
  computationLoop:
  for (let outerIndex = 0; outerIndex < itemCount; outerIndex++) {
    // Add twice the value of the current item (from the sorted list)
    // to the running total score. This represents a base contribution.
    totalScore += sortedValues[outerIndex] * 2;
    // Decrease the available capacity by one unit, as one item has been processed.
    capacity--;
    // If the capacity is completely exhausted (reaches zero),
    // terminate the entire computation process.
    if (capacity === 0) break computationLoop;

    // Begin an inner iteration, considering pairs of items.
    // The inner loop starts from the item immediately following the current outer item.
    for (let innerIndex = outerIndex + 1; innerIndex < itemCount; innerIndex++) {
      // Calculate the score contribution for the current pair. This involves
      // summing the values of the two items and multiplying by a factor that
      // depends on the remaining capacity, capped at 2.
      totalScore += (sortedValues[outerIndex] + sortedValues[innerIndex]) * Math.min(2, capacity);
      // Reduce the capacity by two units, as processing a pair consumes more.
      capacity -= 2;
      // If the capacity is depleted or becomes negative, signifying insufficient
      // resources for further operations, exit all loops.
      if (capacity <= 0) break computationLoop;
    }
  }
  // Print the final computed total score to the standard output.
  console.log(totalScore);
}

// This block serves as the entry point for executing the script.
// It reads all input from the standard input stream ('/dev/stdin'),
// converts it to a UTF-8 string, splits it into an array of lines,
// and then passes this array as the data source to the main processing function.
processData(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .split("\n")
);