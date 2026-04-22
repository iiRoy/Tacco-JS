function processInputData(rawDataString) {
  // Validate input: Ensure the raw data string is not empty or just whitespace
  if (!rawDataString || rawDataString.trim() === '') {
    // In a real application, this might throw an error or log a warning.
    // For this exercise, we'll return 0, assuming no operations can be performed.
    console.log(0);
    return;
  }

  // Divide the input string into an array of lines
  const inputLinesArray = rawDataString.trim().split('\n');

  // Guard clause: Ensure there are enough lines for parameters and data
  if (inputLinesArray.length < 2) {
    console.log(0); // Not enough input to proceed
    return;
  }

  // Parse the first line to extract operational parameters
  const paramsStringComponents = inputLinesArray[0].split(' ');
  // The first component (N) is often present but unused in this specific problem context.
  // We'll skip parsing it for brevity and focus on the used parameter.
  const targetGroupLimit = Number.parseInt(paramsStringComponents[1], 10); // This corresponds to K

  // Parse the second line to get the primary sequence of numbers
  let numericSequence = inputLinesArray[1].split(' ').map(elementStr => Number.parseInt(elementStr, 10));

  // Validate parsed parameters and sequence elements
  if (isNaN(targetGroupLimit) || targetGroupLimit < 0) {
    console.log(0); // K must be a valid non-negative number
    return;
  }
  if (numericSequence.some(val => isNaN(val))) {
    console.log(0); // Sequence must contain only valid integers
    return;
  }

  // Sort the numeric sequence in ascending order to facilitate grouping identical elements
  numericSequence.sort((valA, valB) => valA - valB);

  // Helper function to determine the sizes of consecutive groups of identical elements
  const calculateConsecutiveGroupSizes = (dataArray) => {
    if (dataArray.length === 0) {
      return [];
    }

    const collectedGroupSizes = [];
    let currentElementBeingCounted = dataArray[0];
    let currentElementOccurrenceCount = 0;

    // Iterate through the array to count consecutive occurrences
    for (let sequenceIndex = 0; sequenceIndex < dataArray.length; sequenceIndex++) {
      if (dataArray[sequenceIndex] === currentElementBeingCounted) {
        currentElementOccurrenceCount++;
      } else {
        // If the element changes, push the count of the previous group
        collectedGroupSizes.push(currentElementOccurrenceCount);
        // Reset for the new group
        currentElementBeingCounted = dataArray[sequenceIndex];
        currentElementOccurrenceCount = 1;
      }
    }
    // After the loop, ensure the count for the very last group is added
    collectedGroupSizes.push(currentElementOccurrenceCount);
    return collectedGroupSizes;
  };

  // Obtain the sizes of all distinct groups present in the sorted sequence
  let groupSizeOccurrences = calculateConsecutiveGroupSizes(numericSequence);

  // Sort these group sizes themselves in ascending order
  groupSizeOccurrences.sort((sizeA, sizeB) => sizeA - sizeB);

  // Determine the total number of distinct groups identified
  const totalDistinctGroups = groupSizeOccurrences.length;

  // Early exit condition: If the number of distinct groups is already less than or equal to K,
  // no elements need to be removed to satisfy the K-group condition, so the cost is 0.
  if (totalDistinctGroups <= targetGroupLimit) {
    console.log(0);
    return;
  }

  let finalAccumulatedSum = 0;
  // Calculate how many of the smallest groups need to be "removed"
  // This means summing up the sizes of the smallest (totalDistinctGroups - targetGroupLimit) groups.
  const numberOfGroupsToEliminate = totalDistinctGroups - targetGroupLimit;

  // Sum the sizes of the smallest groups that need to be eliminated
  for (let removalIndex = 0; removalIndex < numberOfGroupsToEliminate; removalIndex++) {
    finalAccumulatedSum += groupSizeOccurrences[removalIndex];
  }

  // Output the final calculated sum
  console.log(finalAccumulatedSum);
}

// Self-executing anonymous function to handle input reading and main execution flow
(function() {
  const fileSystemInterface = require('fs');
  const standardInputFilePath = '/dev/stdin';

  try {
    // Read all content from standard input synchronously and decode as UTF-8
    const rawInputContent = fileSystemInterface.readFileSync(standardInputFilePath, 'utf8');
    // Invoke the primary data processing function with the raw input
    processInputData(rawInputContent);
  } catch (inputReadError) {
    // Handle potential errors during file reading (e.g., file not found, permissions)
    // For this problem, a simple output of 0 might suffice or throw a more specific error.
    console.log(0);
    // console.error(`An error occurred while reading input: ${inputReadError.message}`);
  }
})();