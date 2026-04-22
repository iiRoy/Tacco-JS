const processData = (rawData) => {
  // Normalize the input string: trim whitespace and split into individual lines.
  const lineSegments = rawData.trim() .split('\n');

  // Parse the first line to get the total number of items and connections.
  const [totalItems, numConnections] = lineSegments[0] .split(' ') .map(Number);

  // Extract the remaining lines which represent the connections.
  // The first element of lineSegments (totalItems, numConnections) is discarded.
  const [, ...edgeList] = lineSegments;

  // Initialize an array to hold scores for each item.
  // The first element is a dummy 0, followed by scores parsed from the second input line.
  const itemScores = [0, ...lineSegments[1].split(' ').map(Number)];
  // Create a boolean array to track if an item is dominant.
  // The first element is a dummy false, followed by 'true' for all N items initially.
  const isDominant = [false, ...new Array(totalItems).fill(true)];

  // Iterate through each connection (edge) in the list.
  for (let k = 0; k < edgeList.length; k++) {
    // Parse the two items involved in the current connection.
    const [pointX, pointY] = edgeList[k].split(' ').map(Number);

    // Compare scores of the two connected items.
    // If item X's score is greater than or equal to item Y's score, then Y is not dominant.
    if (itemScores[pointX] >= itemScores[pointY]) {
      isDominant[pointY] = false;
    }
    // If item X's score is less than or equal to item Y's score, then X is not dominant.
    else if (itemScores[pointX] <= itemScores[pointY]) {
      isDominant[pointX] = false;
    }
  }

  // Initialize a counter for dominant items.
  let dominantCount = 0;
  // Loop through the 'isDominant' array, starting from the first actual item (index 1).
  for (let j = 1; j < isDominant.length; j++) {
    // If an item is marked as dominant, increment the counter.
    if (isDominant[j]) {
      dominantCount++;
    }
  }

  // Output the final count of dominant items.
  return console.log(dominantCount);
};

// Determine the execution context: test environment or standard input.
process.env.EXECUTION_MODE
  // If EXECUTION_MODE is set, check if it's 'test'.
  ? (process.env.EXECUTION_MODE === 'test'
      // If 'test', call a hypothetical test function (not provided in original, but maintaining structure).
      ? executeTestScenario()
      // Otherwise, read from 'dev/stdin' for custom testing.
      : processData(require('fs').readFileSync('dev/stdin', 'utf8')))
  // If EXECUTION_MODE is not set, read from standard input '/dev/stdin'.
  : processData(require('fs').readFileSync('/dev/stdin', 'utf8'));