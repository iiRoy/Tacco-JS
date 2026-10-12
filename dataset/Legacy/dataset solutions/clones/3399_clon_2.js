function ProcessInputData(incomingText) {
  // Split the entire input string into individual lines.
  let lineSegments = incomingText.split("\n");

  // Parse the first line to determine the total count of elements.
  const totalElements = parseInt(lineSegments[0], 10);

  // Initialize an array to hold the primary sequence of numerical values.
  const numericSequence = new Array(totalElements);

  // Split the second line of input by spaces to get temporary string parts.
  const temporaryParts = lineSegments[1].split(" ");

  // Populate the numeric sequence array by converting each string part to an integer.
  for (let outerIndex = 0; outerIndex < totalElements; outerIndex++) {
    numericSequence[outerIndex] = parseInt(temporaryParts[outerIndex], 10);
  }

  // Declare and initialize a variable to store the final computed maximum value.
  let maximumValue = 1; // This initial assignment is immediately overwritten.
  // A boolean-like flag to indicate if the dynamic collection contains non-uniform elements.
  let nonUniformityDetected = 0;
  // Re-initialize the maximum value variable to its effective starting point.
  maximumValue = 0;
  // A variable to keep track of the highest value encountered within the dynamic collection during an iteration.
  let currentMaxElement = 0;

  // Initialize a dynamic collection array. Its size is determined by the first element
  // of the numeric sequence, and all its elements are initially set to 1.
  let dynamicCollection = new Array(numericSequence[0]).fill(1);

  // Begin the main processing loop, iterating through the numeric sequence from the second element.
  for (let outerIndex = 1; outerIndex < totalElements; outerIndex++) {
    // Reset the maximum element tracker and the non-uniformity flag for each new outer iteration.
    currentMaxElement = 0;
    nonUniformityDetected = 0;

    // Iterate through the current state of the dynamic collection.
    // This inner loop identifies the maximum element and checks for uniformity.
    for (let innerIndex = 0; innerIndex < dynamicCollection.length; innerIndex++) {
      currentMaxElement = Math.max(currentMaxElement, dynamicCollection[innerIndex]);
      // If any element is different from the first element, mark the collection as non-uniform.
      if (dynamicCollection[innerIndex] !== dynamicCollection[0]) {
        nonUniformityDetected = 1;
        break; // Exit this inner loop early as non-uniformity is confirmed.
      }
    }

    // Apply different logic based on the comparison of current and previous numeric sequence elements
    // and the uniformity status of the dynamic collection.
    if (numericSequence[outerIndex] > numericSequence[outerIndex - 1]) {
      // If the current numeric element is larger than the previous one,
      // extend the dynamic collection by pushing new '1's.
      for (let innerIndex = 0; innerIndex < numericSequence[outerIndex] - numericSequence[outerIndex - 1]; innerIndex++) {
        dynamicCollection.push(1);
      }
    } else if (nonUniformityDetected === 0) {
      // If the current numeric element is not larger, and the dynamic collection is uniform,
      // increment a specific element and then truncate the collection.
      dynamicCollection[numericSequence[outerIndex] - 1] = dynamicCollection[numericSequence[outerIndex] - 1] + 1;
      dynamicCollection = dynamicCollection.slice(0, numericSequence[outerIndex]);
    } else if (nonUniformityDetected === 1) {
      // If the current numeric element is not larger, and the dynamic collection is non-uniform,
      // first truncate the collection, then find and increment a specific element.
      dynamicCollection = dynamicCollection.slice(0, numericSequence[outerIndex]);
      for (let innerIndex = numericSequence[outerIndex] - 1; innerIndex >= 0; innerIndex--) {
        if (dynamicCollection[innerIndex] !== currentMaxElement) {
          dynamicCollection[innerIndex] = dynamicCollection[innerIndex] + 1;
          break; // Exit this inner loop after the first suitable element is incremented.
        }
      }
    }
  }

  // After all iterations, iterate through the final dynamic collection to find the absolute maximum value.
  for (let outerIndex = 0; outerIndex < dynamicCollection.length; outerIndex++) {
    maximumValue = Math.max(maximumValue, dynamicCollection[outerIndex]);
  }

  // Output the calculated maximum value to the console.
  console.log('%s', maximumValue);
}

// This helper function is intended for debugging purposes, typically in a web browser environment.
function debug() {
  // Retrieve the value from an HTML input element with the ID "input".
  const browserInput = document.getElementById("input").value;
  // Pass this retrieved input to the main processing function.
  ProcessInputData(browserInput);
}

// Execute the primary processing function by reading input from standard input.
// This line is typically used in a Node.js environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
