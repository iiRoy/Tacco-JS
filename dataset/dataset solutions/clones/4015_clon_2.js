/*
 * This JavaScript module processes grid-based movement costs.
 * It reads input from standard input, parses it, calculates accumulated costs,
 * and then answers a series of movement queries.
 *
 * This implementation aims to provide a solution for a competitive programming
 * problem involving movement on a grid with specific jump rules.
 */
console.log((
  // Define an immediately-invoked function expression (IIFE)
  // to encapsulate the entire processing logic and handle the input string.
  inputString => {
    // The first step involves parsing the raw input string.
    // It's expected to contain configuration details and grid values.
    const [
      [
        height,       // The number of rows in the grid.
        width,        // The number of columns in the grid.
        jumpDistance  // The fixed distance for "magic" jumps.
      ],
      ...dataLines    // Remaining lines contain grid data and query parameters.
    ] = inputString
      .trim()      // Remove any leading or trailing whitespace from the full input.
      .split`\n`   // Split the input into an array of lines.
      .map(
        lineContent => lineContent
          .split(' ') // Split each individual line into tokens based on space.
          .map(
            numericVal => numericVal | 0 // Convert each string token to an integer using bitwise OR 0.
          )
      );

    // Initialize a data structure to quickly retrieve the [row, column]
    // coordinates for any given number present in the grid.
    // Grid numbers typically range from 1 to height * width.
    const coordStore = Array(height * width + 1).fill(null);

    // Populate the coordinate lookup table by iterating through the grid data.
    // The grid values are stored in the initial `dataLines` array.
    for (
      let rowIdx = 0; // Loop through each row of the grid.
      rowIdx < height;
      ++rowIdx
    ) {
      for (
        let colIdx = 0; // Loop through each column within the current row.
        colIdx < width;
        ++colIdx
      ) {
        // The value at dataLines[rowIdx][colIdx] is the number whose coordinates are [rowIdx, colIdx].
        coordStore[dataLines[rowIdx][colIdx]] = [rowIdx, colIdx];
      }
    }

    // Create an array to store the cumulative costs for reaching certain positions
    // via a sequence of `jumpDistance` steps.
    // `costAccumulator[k]` will hold the total cost to reach number `k` from its
    // respective starting point in a `D`-step sequence.
    const costAccumulator = Array(height * width + 1).fill(0);

    // Calculate the cumulative movement costs.
    // This involves iterating through all possible starting points (1 to `jumpDistance`)
    // and then extending paths by `jumpDistance` steps.
    for (
      let startOffset = 1; // The starting value for a sequence of jumps.
      startOffset <= jumpDistance;
      startOffset++
    ) {
      for (
        let currentPos = startOffset; // The current position in the sequence.
        currentPos <= height * width - jumpDistance; // Ensure there's a valid next jump.
        currentPos += jumpDistance // Advance by the magic jump distance.
      ) {
        // Retrieve the [row, column] coordinates for the current and the next position.
        const [currRow, currCol] = coordStore[currentPos];
        const [nextRow, nextCol] = coordStore[currentPos + jumpDistance];

        // Calculate the Manhattan distance (L1 distance) between the two points.
        const manhattanDistance = Math.abs(currRow - nextRow) + Math.abs(currCol - nextCol);

        // Accumulate the cost: the distance to the next position plus the
        // previously calculated cost to reach the current position.
        costAccumulator[currentPos + jumpDistance] = manhattanDistance + costAccumulator[currentPos];
      }
    }

    // The number of queries is found on the line immediately following the grid data.
    const [numQueries] = dataLines[height];

    // Initialize an array to store the computed results for each query.
    let outputValues = [];

    // Process each individual query.
    for (
      let queryIndex = 0; // Loop through the total number of queries.
      queryIndex < numQueries;
      ++queryIndex
    ) {
      // Each query line contains a start point and an end point.
      // Query lines begin after the grid data and the `numQueries` line.
      const [
        startPoint, // The starting number for the current query.
        endPoint    // The ending number for the current query.
      ] = dataLines[height + 1 + queryIndex];

      // Calculate the total movement cost for the current query by finding the
      // difference in accumulated costs between the end and start points.
      outputValues.push(costAccumulator[endPoint] - costAccumulator[startPoint]);
    }

    // Join all the calculated query results with newline characters
    // and return the final string to be printed to console.
    return outputValues.join('\n');
  }
)(
  // Read the entire content of standard input (typically from /dev/stdin in Unix-like systems)
  // as a UTF-8 encoded string.
  require('fs').readFileSync('/dev/stdin', 'utf8')
));