function ProcessInput(rawData) {
  // Split the raw input string into individual lines
  let lineData = rawData.split("\n");

  // Parse the first line to get N and K values
  let firstLineParts = lineData[0].split(" ");
  // Parse the second line to get the array elements
  let arrayElements = lineData[1].split(" ");

  // Assign N and K from the parsed parts
  let totalElements = firstLineParts[0]; // N
  let segmentSize = firstLineParts[1];   // K

  // Initialize variables for calculation
  let resultCount = 0;
  let onePosition = 0;
  let arrayLength = arrayElements.length;

  // Initialize segment lengths and an adjustment factor
  let leftSegment = 1;
  let rightSegment = 1;
  let adjustmentFactor = 0;

  // Find the position of the first occurrence of "1" in the array
  for (let loopIndex = 0; loopIndex < arrayLength; loopIndex++) {
    if (arrayElements[loopIndex] === "1") {
      onePosition = loopIndex;
      break; // Exit loop once "1" is found
    }
  }

  // Calculate the lengths of the segments to the left and right of "1"
  leftSegment = onePosition;
  rightSegment = arrayLength - 1 - onePosition;

  // Check if the total span of elements is less than or equal to K
  if (leftSegment + rightSegment <= segmentSize) {
    adjustmentFactor = -1; // Set adjustment if condition met
  }

  // Calculate operations needed for the left segment
  while (leftSegment > 0) {
    resultCount = resultCount + 1;
    leftSegment = leftSegment - (segmentSize - 1);
  }

  // Calculate operations needed for the right segment
  while (rightSegment > 0) {
    resultCount = resultCount + 1;
    rightSegment = rightSegment - (segmentSize - 1);
  }

  // Apply the adjustment factor if resultCount is not zero
  if (resultCount !== 0) {
    resultCount = resultCount + adjustmentFactor;
  }

  // Output the final calculated result
  console.log(resultCount);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
