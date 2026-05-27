(function executeProgram() {
  // Obtain raw input data from standard input.
  // This involves reading the file, decoding it as UTF-8,
  // removing leading/trailing whitespace, and splitting it into an array of lines.
  let inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Extract the first line, split it by space, and convert parts to numbers.
  // The first number is 'itemCount', the second is 'groupCount'.
  let [itemCount, groupCount] = inputDataRows.shift().split(' ').map(Number);

  // Convert the remaining lines of input into an array of numbers, representing weights.
  let weightsArray = inputDataRows.map(Number);

  // Calculate the total sum of all weights in the 'weightsArray'.
  let totalWeight = weightsArray.reduce((previousValue, currentValue) => previousValue + currentValue, 0);

  // Handle a special edge case: if there's only one group,
  // the maximum sum is simply the total sum of all weights.
  if (groupCount === 1) {
    console.log(totalWeight);
    return; // Terminate execution early.
  }

  // Initialize two arrays:
  // 'groupSums' will store the accumulated sum for each group.
  // 'groupContents' will store the individual weights assigned to each group.
  let groupSums = [], groupContents = [];
  // Populate these arrays with initial values (0 for sums, empty arrays for contents).
  for (let loopIndex = 0; loopIndex < groupCount; loopIndex++) {
    groupSums[loopIndex] = 0;
    groupContents[loopIndex] = [];
  }

  // Calculate an initial average weight per group.
  let currentAverage = totalWeight / groupCount;

  // Initialize a counter for the current group being processed.
  let currentGroupIndex = 0;
  // Initialize a variable to keep track of the maximum group sum encountered.
  let maximumGroupSum = 0;

  // Iterate over each weight in the 'weightsArray'.
  weightsArray.forEach(function(currentItemWeight) {
    // This conditional logic determines whether to add the current item to the
    // current group or to finalize the current group and move to the next.
    // The condition `currentAverage - (2 * groupSums[currentGroupIndex] + currentItemWeight) / 2 > 0`
    // is a heuristic to decide if the current item "fits" well into the current group
    // without making its average too far off from the overall remaining average.
    if (currentAverage - (2 * groupSums[currentGroupIndex] + currentItemWeight) / 2 > 0) {
      // If the condition is true, continue adding to the current group.
      // No action needed in this block, as additions happen after the if/else.
    } else {
      // If the condition is false, it's time to finalize the current group.
      // Recalculate the average based on the remaining total weight and remaining groups.
      currentAverage = totalWeight / (groupCount - currentGroupIndex - 1);
      // Update 'maximumGroupSum' if the sum of the current group is greater.
      maximumGroupSum = maximumGroupSum < groupSums[currentGroupIndex] ? groupSums[currentGroupIndex] : maximumGroupSum;
      // Move to the next group.
      currentGroupIndex++;
    }

    // Recalculate the average again. This line appears both inside the 'else'
    // block and immediately after it in the original logic, so it's preserved here.
    currentAverage = totalWeight / (groupCount - currentGroupIndex - 1);
    // Subtract the current item's weight from the running total weight.
    totalWeight -= currentItemWeight;
    // Add the current item's weight to the sum of the current group.
    groupSums[currentGroupIndex] += currentItemWeight;
    // Add the current item's weight to the list of contents for the current group.
    groupContents[currentGroupIndex].push(currentItemWeight);
  });

  // After processing all weights, ensure the sum of the very last group
  // is also considered for the 'maximumGroupSum'.
  maximumGroupSum = maximumGroupSum < groupSums[currentGroupIndex] ? groupSums[currentGroupIndex] : maximumGroupSum;

  // Output the final calculated maximum group sum.
  console.log(maximumGroupSum);
})();
