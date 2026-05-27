'use strict'; // Enforce strict mode for cleaner code execution.

/**
 * Processes the provided input data to determine the minimum cost item
 * that satisfies a given time constraint.
 *
 * @param {string[]} dataLines - An array of strings, where each string represents a line
 *                                from the standard input. The first line contains global parameters,
 *                                and subsequent lines describe individual items.
 */
const processInput = (dataLines) => {
  // Extract and parse the global parameters from the first line of input.
  // The first value is the total number of items, and the second is the time limit.
  const initialParameters = dataLines[0].split(' ');
  const numItems = parseInt(initialParameters[0], 10); // Total count of items to consider.
  const timeLimit = parseInt(initialParameters[1], 10); // The maximum allowed time for an item.

  // Initialize a variable to store the minimum cost found so far.
  // A large initial value (10000) is used, which also serves as a sentinel
  // to indicate if no suitable item was found (resulting in "TLE").
  let minCost = 10000;

  // Iterate through each item's data, starting from the second line of input.
  // The loop runs 'numItems' times, processing one item per iteration.
  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    // Parse the cost and time for the current item from its respective line.
    // Each item's data is on a line, offset by 1 from the loop index because
    // the first line (index 0) contains global parameters.
    const itemDetails = dataLines[itemIndex + 1].split(' ');
    const currentItemCost = parseInt(itemDetails[0], 10); // The cost of the current item.
    const currentItemTime = parseInt(itemDetails[1], 10); // The time required by the current item.

    // Check if the current item is a better candidate than the best one found previously.
    // An item is "better" if it has a lower cost AND its time requirement
    // does not exceed the overall time limit.
    if (minCost > currentItemCost && timeLimit >= currentItemTime) {
      minCost = currentItemCost; // Update 'minCost' if a more optimal item is discovered.
    }
  }

  // Output the final result. If 'minCost' is still 10000, it means no item
  // met the criteria, so "TLE" (Time Limit Exceeded) is printed.
  // Otherwise, the actual minimum cost found is printed.
  console.log(minCost === 10000 ? 'TLE' : minCost);
};

// Read the entire standard input, decode it as UTF-8, and split it into an array of lines.
// This array is then passed to the 'processInput' function for execution.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
