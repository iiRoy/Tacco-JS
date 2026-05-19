function ProcessInput(rawData) {
  // Split the raw input string into lines
  rawData = rawData.split("\n");

  // Parse the first line for item count and subset size
  let firstLineParts = rawData[0].split(" ");
  let itemCount = parseInt(firstLineParts[0]);
  let subsetSize = parseInt(firstLineParts[1]);

  // Initialize an array to hold the numeric data points
  let dataPoints = new Array(itemCount).fill(0);
  // Temporarily store the second line's string values
  const tempValues = rawData[1].split(" ");

  // Counters for positive and negative numbers
  let positiveCount = 0;
  let negativeCount = 0;

  // Populate dataPoints array and count positives/negatives
  for (let idx = 0; idx < itemCount; idx++) {
    dataPoints[idx] = parseInt(tempValues[idx]);
    if (dataPoints[idx] > 0) {
      positiveCount++;
    } else if (dataPoints[idx] < 0) {
      negativeCount++;
    }
  }

  // Initialize the final result with a very large number
  let finalResult = Math.pow(10, 9) + 7;

  // Handle the case where zero is present in the data points
  if (dataPoints.indexOf(0) !== -1) {
    itemCount--; // Decrease total count
    subsetSize--; // Decrease subset size as zero is removed
    dataPoints.splice(dataPoints.indexOf(0), 1); // Remove the zero
  }

  // Check for edge cases after zero removal
  if (dataPoints.length === 0) {
    finalResult = 0; // If no elements left, result is zero
  } else if (itemCount !== 2) {
    // Main logic for more than two elements or single element
    for (let idx = 0; idx < itemCount - subsetSize + 1; idx++) {
      // Case: Window contains both negative and positive numbers
      if (dataPoints[idx] < 0 && dataPoints[idx + subsetSize - 1] > 0) {
        finalResult = Math.min(
          finalResult,
          Math.abs(dataPoints[idx]) * 2 + dataPoints[idx + subsetSize - 1],
          Math.abs(dataPoints[idx]) + dataPoints[idx + subsetSize - 1] * 2
        );
      }
      // Case: Window contains only negative numbers (or starts with the last negative)
      else if (idx === negativeCount - subsetSize) {
        finalResult = Math.min(finalResult, Math.abs(dataPoints[idx]));
      }
      // Case: Window contains only positive numbers (or starts with the first positive)
      else if (idx === negativeCount) {
        finalResult = Math.min(finalResult, dataPoints[idx + subsetSize - 1]);
      }
    }
  } else {
    // Special handling for exactly two elements
    finalResult = Math.min(Math.abs(dataPoints[0]), dataPoints[1]);
  }

  // Output the computed minimum value
  console.log('%s', finalResult);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
