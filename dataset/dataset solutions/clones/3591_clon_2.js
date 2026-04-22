const processData = (rawData) => {
  // Break down the incoming string data into individual lines.
  let linesOfText = rawData.split("\n");

  // Extract the total number of items and the required segment length from the first line.
  // The first value specifies the overall quantity of numbers.
  const totalItemCount = Number.parseInt(linesOfText[0].split(" ")[0], 10);
  // The second value indicates the length of the contiguous segment we are interested in.
  let targetSegmentLength = Number.parseInt(linesOfText[0].split(" ")[1], 10);

  // Prepare an array to hold the numeric values, initializing all entries to zero.
  let numericSeries = new Array(totalItemCount).fill(0);

  // Split the second line of input to get string representations of the numbers.
  const rawNumberStrings = linesOfText[1].split(" ");

  // Initialize counters for positive and negative numbers within the series.
  let countOfPositives = 0;
  let countOfNegatives = 0;

  // Loop through the raw number strings, convert them to integers, and populate the numeric series.
  // Simultaneously, tally the positive and negative numbers.
  for (let currentIdx = 0; currentIdx < totalItemCount; currentIdx++) {
    numericSeries[currentIdx] = Number.parseInt(rawNumberStrings[currentIdx], 10);
    if (numericSeries[currentIdx] > 0) {
      countOfPositives++; // Increment if the number is greater than zero.
    } else if (numericSeries[currentIdx] < 0) {
      countOfNegatives++; // Increment if the number is less than zero.
    }
  }

  // Establish a very large initial value for the shortest path to ensure any valid path will be smaller.
  let shortestPathValue = Math.pow(10, 9) + 7;

  // Check for the presence of zero in the numeric series. If found, adjust parameters.
  // A zero element can be effectively ignored, reducing the problem size.
  const zeroPosition = numericSeries.indexOf(0);
  if (zeroPosition !== -1) {
    totalItemCount--; // Decrease the total count of items.
    targetSegmentLength--; // Decrease the required segment length.
    numericSeries.splice(zeroPosition, 1); // Remove the zero from the series.
  }

  // Address special conditions based on the modified series.
  if (numericSeries.length === 0) {
    // If no numbers remain after removing zeros, the minimum path is zero.
    shortestPathValue = 0;
  } else if (totalItemCount !== 2) {
    // This branch handles scenarios where the effective number of items is not exactly two.
    // Iterate through all possible starting positions for a segment of the desired length.
    for (let currentIdx = 0; currentIdx < totalItemCount - targetSegmentLength + 1; currentIdx++) {
      const segmentStart = numericSeries[currentIdx];
      const segmentEnd = numericSeries[currentIdx + targetSegmentLength - 1];

      // Scenario 1: The segment spans across zero (contains both negative and positive numbers).
      if (segmentStart < 0 && segmentEnd > 0) {
        // Calculate two potential path lengths:
        // A) Travel to the negative boundary, return to origin, then go to the positive boundary.
        // B) Travel to the positive boundary, return to origin, then go to the negative boundary.
        // Select the smaller of these two options.
        shortestPathValue = Math.min(
          shortestPathValue,
          Math.abs(segmentStart) * 2 + segmentEnd,
          Math.abs(segmentStart) + segmentEnd * 2
        );
      }
      // Scenario 2: The segment consists entirely of negative numbers.
      // This condition checks if the segment ends at the last original negative number.
      else if (currentIdx === countOfNegatives - targetSegmentLength) {
        // The path is simply the absolute distance to the leftmost (most negative) number.
        shortestPathValue = Math.min(shortestPathValue, Math.abs(segmentStart));
      }
      // Scenario 3: The segment consists entirely of positive numbers.
      // This condition checks if the segment starts at the first original positive number.
      else if (currentIdx === countOfNegatives) {
        // The path is simply the distance to the rightmost (most positive) number.
        shortestPathValue = Math.min(shortestPathValue, segmentEnd);
      }
    }
  } else {
    // Specific case: If precisely two elements remain after all adjustments.
    shortestPathValue = Math.min(Math.abs(numericSeries[0]), numericSeries[1]);
  }

  // Print the calculated minimum path value to the console.
  console.log(String(shortestPathValue));
};

// Invoke the data processing function, reading input from standard input.
// The input is read using Node.js's file system module, specified as UTF-8 encoding.
processData(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));