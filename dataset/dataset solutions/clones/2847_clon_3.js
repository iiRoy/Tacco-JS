((inputDataString) => {
  // Process raw input string: trim whitespace, split into lines, and filter out empty lines.
  const processedInputLines = inputDataString.trim().split('\n').filter(lineContent => lineContent.length > 0);

  // Validate that there are at least two lines for N and the array elements.
  if (processedInputLines.length < 2) {
      console.error("Input processing error: Insufficient data provided.");
      return; // Exit if input is malformed.
  }

  // Extract the first line to get the total count of elements.
  const firstDataLine = processedInputLines[0].split(' ');
  const declaredElementCount = Number(firstDataLine[0]); // Renamed N

  // Parse the second line into an array of numbers. Using Number() for type conversion.
  const numericValuesArray = processedInputLines[1].split(' ').map(strVal => Number(strVal)); // Renamed A

  // Perform a basic validation that the number of elements matches the declared count.
  if (numericValuesArray.length !== declaredElementCount) {
      console.error("Input processing error: Declared element count does not match actual elements.");
      return; // Exit if validation fails.
  }

  // Sort the array in descending order.
  // Renaming arguments in the comparison function for clarity.
  numericValuesArray.sort((valueOne, valueTwo) => valueTwo - valueOne);

  // Implement a modified binary search to find the index where numbers transition from non-negative to negative.
  // 'firstNegativeIdx' will store the index of the first element that is less than zero.
  // If all elements are non-negative, 'firstNegativeIdx' will be equal to 'declaredElementCount'.
  let searchLowerBound = -1; // Analogous to 'l'
  let searchUpperBound = declaredElementCount; // Analogous to 'r'
  let firstNegativeIdx = declaredElementCount; // Default: assume all are non-negative

  while (searchUpperBound - searchLowerBound > 1) {
    const searchMidpoint = Math.floor((searchLowerBound + searchUpperBound) / 2); // Explicit floor for midpoint
    const valueAtMidpoint = numericValuesArray[searchMidpoint];

    if (valueAtMidpoint < 0) {
      firstNegativeIdx = searchMidpoint; // Found a negative value, potentially the first one
      searchUpperBound = searchMidpoint; // Narrow search to the left
    } else {
      searchLowerBound = searchMidpoint; // Value is non-negative, narrow search to the right
    }
  }

  // Initialize a list to store the sequence of generated operations.
  const operationRecords = []; // Renamed q

  // Extract the initial values for the two accumulators.
  const initialPrimaryValue = numericValuesArray[0]; // Renamed b
  const initialSecondaryValue = numericValuesArray[declaredElementCount - 1]; // Renamed c

  let currentPrimaryAccumulator = initialPrimaryValue; // Renamed b
  let currentSecondaryAccumulator = initialSecondaryValue; // Renamed c

  // Partition the intermediate numbers (excluding the first and last elements)
  // into two separate arrays based on their sign.
  const intermediatePositiveGroup = []; // Renamed B
  const intermediateNegativeGroup = []; // Renamed C

  // Iterate through the array, skipping the first and last elements.
  for (let dataIndex = 1; dataIndex < declaredElementCount - 1; ++dataIndex) {
    const currentIntermediateElement = numericValuesArray[dataIndex];
    // Use 'firstNegativeIdx' to determine if an element is part of the non-negative or negative group.
    if (dataIndex < firstNegativeIdx) {
      intermediatePositiveGroup.push(currentIntermediateElement);
    } else {
      intermediateNegativeGroup.push(currentIntermediateElement);
    }
  }

  // Process the non-negative intermediate values.
  // The original code used `pop()` on `B`, which meant processing elements from `A[r-1]` down to `A[1]`.
  // We simulate this by iterating backwards through `intermediatePositiveGroup`.
  for (let revIdx = intermediatePositiveGroup.length - 1; revIdx >= 0; --revIdx) {
    const positiveElement = intermediatePositiveGroup[revIdx]; // Renamed b_val
    operationRecords.push(`${currentSecondaryAccumulator} ${positiveElement}`);
    currentSecondaryAccumulator = currentSecondaryAccumulator - positiveElement;
  }

  // Perform the central operation using the two main accumulators.
  operationRecords.push(`${currentPrimaryAccumulator} ${currentSecondaryAccumulator}`);
  currentPrimaryAccumulator = currentPrimaryAccumulator - currentSecondaryAccumulator;

  // Process the negative intermediate values.
  // The original code used `pop()` on `C`, which meant processing elements from `A[A.length-2]` down to `A[r]`.
  // We simulate this by iterating backwards through `intermediateNegativeGroup`.
  for (let revIdx = intermediateNegativeGroup.length - 1; revIdx >= 0; --revIdx) {
    const negativeElement = intermediateNegativeGroup[revIdx]; // Renamed c_val
    operationRecords.push(`${currentPrimaryAccumulator} ${negativeElement}`);
    currentPrimaryAccumulator = currentPrimaryAccumulator - negativeElement;
  }

  // Construct the final output string, starting with the final accumulator value.
  let finalOutputResult = String(currentPrimaryAccumulator) + '\n';
  // Join all recorded operations with newline characters.
  finalOutputResult += operationRecords.join('\n');

  console.log(finalOutputResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));