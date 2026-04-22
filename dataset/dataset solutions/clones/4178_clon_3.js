function processIntegerOperations(rawInputString) {
  // Validate and parse the input data into individual lines.
  const inputLines = rawInputString.trim().split('\n');

  // Early exit for insufficient input.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input data provided. Expected at least two lines.");
    return;
  }

  // Parse the array size from the first line's first number.
  const arraySize = parseInt(inputLines[0].split(' ')[0], 10);
  // Guard clause for invalid array size.
  if (isNaN(arraySize) || arraySize <= 0) {
    console.error("Error: Invalid or non-positive array size specified.");
    return;
  }

  // Parse the initial array elements from the second line.
  const numberStrings = inputLines[1].split(' ');
  // Convert string elements to integers.
  let workingArray = numberStrings.map(str => parseInt(str, 10));

  // Validate if the actual number of parsed elements matches the declared size.
  if (workingArray.length !== arraySize) {
    console.error(`Error: Declared array size (${arraySize}) does not match actual element count (${workingArray.length}).`);
    return;
  }

  // Initialize trackers for the maximum and minimum values found in the array.
  // Using -Infinity and Infinity ensures any valid number will update them.
  let maxValueFound = -Infinity;
  let minValueFound = Infinity;

  // First pass: Determine the true maximum and minimum values within the initial array.
  for (let i = 0; i < arraySize; i++) {
    maxValueFound = Math.max(maxValueFound, workingArray[i]);
    minValueFound = Math.min(minValueFound, workingArray[i]);
  }

  // Find the 0-based index of the *first occurrence* of the max and min values.
  // This is crucial for consistency with the original `indexOf` behavior.
  const indexOfMaxValue = workingArray.indexOf(maxValueFound);
  const indexOfMinValue = workingArray.indexOf(minValueFound);

  // This array will store the 1-based indices of each transformation operation.
  const transformationLog = [];

  // Determine the "dominant" value (either max or the absolute value of min).
  // This choice dictates the first phase of array modifications and the subsequent sorting direction.
  const absoluteMinValueMagnitude = Math.abs(minValueFound);
  let dominantValueForFirstPass;
  let dominantValueIndexForFirstPass;
  let isPositiveDominantScenario; // Flag to indicate if max was dominant

  if (maxValueFound >= absoluteMinValueMagnitude) {
    dominantValueForFirstPass = maxValueFound;
    dominantValueIndexForFirstPass = indexOfMaxValue;
    isPositiveDominantScenario = true;
  } else { // This condition implies Math.abs(minValueFound) > maxValueFound
    dominantValueForFirstPass = minValueFound;
    dominantValueIndexForFirstPass = indexOfMinValue;
    isPositiveDominantScenario = false;
  }

  // Phase 1: Apply the dominant value addition to all elements except the dominant one itself.
  // This step aims to make all numbers tend towards the sign of the dominant value.
  for (let currentElementIdx = 0; currentElementIdx < arraySize; currentElementIdx++) {
    // Only modify elements that are not the source of the dominant value.
    if (currentElementIdx !== dominantValueIndexForFirstPass) {
      // Record the operation: [source_1_based_idx, target_1_based_idx]
      transformationLog.push([dominantValueIndexForFirstPass + 1, currentElementIdx + 1]);
      // Update the target element by adding the dominant value.
      workingArray[currentElementIdx] += dominantValueForFirstPass;
    }
  }

  // Phase 2: Further adjust the array to achieve a sorted (non-decreasing or non-increasing) state.
  // The direction of sorting depends on the dominant value determined earlier.
  if (isPositiveDominantScenario) {
    // If the positive value (maxValueFound) was dominant, sort in non-decreasing order.
    // Iterate forwards from the second element, ensuring each element is at least its predecessor.
    for (let currentElementIdx = 1; currentElementIdx < arraySize; currentElementIdx++) {
      if (workingArray[currentElementIdx] < workingArray[currentElementIdx - 1]) {
        // Operation: Add the value of the previous element to the current one.
        // Source element is (currentElementIdx - 1), target is currentElementIdx.
        // 1-based indices: [ (currentElementIdx-1)+1, currentElementIdx+1 ] => [ currentElementIdx, currentElementIdx+1 ]
        transformationLog.push([currentElementIdx, currentElementIdx + 1]);
        workingArray[currentElementIdx] += workingArray[currentElementIdx - 1];
      }
    }
  } else { // This branch handles the negative dominant scenario.
    // If the negative value (minValueFound) was dominant, sort in non-increasing order.
    // Iterate backwards from the second-to-last element, ensuring each element is at most its successor.
    for (let currentElementIdx = arraySize - 2; currentElementIdx >= 0; currentElementIdx--) {
      if (workingArray[currentElementIdx] > workingArray[currentElementIdx + 1]) {
        // Operation: Add the value of the next element to the current one.
        // Source element is (currentElementIdx + 1), target is currentElementIdx.
        // 1-based indices: [ (currentElementIdx+1)+1, currentElementIdx+1 ] => [ currentElementIdx+2, currentElementIdx+1 ]
        transformationLog.push([currentElementIdx + 2, currentElementIdx + 1]);
        workingArray[currentElementIdx] += workingArray[currentElementIdx + 1];
      }
    }
  }

  // Construct the final output string.
  // The first line contains the total count of operations performed.
  // Subsequent lines list each operation's 1-based source and target indices.
  const outputLinesArray = [transformationLog.length.toString()];
  const formattedOperations = transformationLog.map(opPair => `${opPair[0]} ${opPair[1]}`);
  outputLinesArray.push(...formattedOperations);

  // Print the complete output.
  console.log(outputLinesArray.join('\n'));
}

// Standard competitive programming input method for Node.js environments.
// Reads the entire content from standard input and passes it to the processing function.
processIntegerOperations(require("fs").readFileSync("/dev/stdin", "utf8"));