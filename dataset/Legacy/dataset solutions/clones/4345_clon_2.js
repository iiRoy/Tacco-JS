function ProcessInput(rawData) {
  // Split the raw input string into individual lines of data.
  const linesOfData = rawData.split(/\n/);

  // Parse the first line as the count of items.
  const countItems = parseInteger(linesOfData[0]);

  // Parse the second line as the threshold value.
  const thresholdValue = parseInteger(linesOfData[1]);

  // Split the third line by spaces to get an array of item distances.
  const itemDistances = linesOfData[2].split(' ');

  // Calculate the final result by reducing the item distances.
  const finalResult = itemDistances.reduce(function(currentTotal, currentItem, currentIndex) {
    // Determine the distance to K for the current item.
    const distanceToThreshold = Math.abs(thresholdValue - parseInteger(currentItem));

    // If the distance to the threshold is less than the item's value itself,
    // add that distance to the running total.
    if (distanceToThreshold < currentItem) {
      return currentTotal + distanceToThreshold;
    } else {
      // Otherwise, add the item's value to the running total.
      // Ensure both parts are parsed as integers before addition.
      return parseInteger(currentTotal) + parseInteger(currentItem);
    }
  }, 0); // Start the accumulation with an initial value of zero.

  // Output the computed final result to the console.
  console.log(finalResult);
}

/**
 * Helper function to safely parse a string into an integer.
 * @param {string} inputString The string to parse.
 * @returns {number} The parsed integer.
 */
function parseInteger(inputString) {
  return parseInt(inputString, 10);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
