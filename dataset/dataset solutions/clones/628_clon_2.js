function processData(dataArr) {
  // Read the initial count value from the input array.
  let countVal = +dataArr.shift();

  // Initialize an array to store numeric values.
  let numArr = [];
  // Populate the numeric array by shifting values from the input.
  for (let idx = 0; idx < countVal; ++idx) {
    numArr.push(+dataArr.shift());
  }

  // Initialize a variable for accumulating sums.
  let currentSum = 0;
  // Create an array to store prefix sums, starting with 0.
  let prefixSums = [0];

  // Calculate prefix sums for a doubled length of the original array.
  // This effectively creates a circular array for sum calculations.
  for (let k = 0; k < countVal * 2; ++k) {
    currentSum += numArr[k % countVal];
    prefixSums.push(currentSum);
  }

  // Initialize three pointers for segment boundaries.
  let ptrA = 0,
    ptrB = 0,
    ptrC = 0;

  // Helper function to calculate the sum of a specific segment.
  // segmentIndex 0: sum from ptrA to ptrB
  // segmentIndex 1: sum from ptrB to ptrC
  // segmentIndex 2: sum from ptrC to ptrA + countVal (wrapping around)
  const calculateSegment = (segmentIndex) => {
    if (segmentIndex === 0) {
      return prefixSums[ptrB] - prefixSums[ptrA];
    }
    if (segmentIndex === 1) {
      return prefixSums[ptrC] - prefixSums[ptrB];
    }
    return prefixSums[ptrA + countVal] - prefixSums[ptrC];
  };

  // Initialize the maximum result found so far.
  let maxResult = 0;

  // Main loop: iterate while the first pointer is within the original array bounds.
  while (ptrA < countVal) {
    // Inner loop to adjust ptrB and ptrC.
    while (true) {
      // Increment ptrB.
      ++ptrB;
      // Store the current value of ptrC.
      let tempPtrC = ptrC;

      // Adjust ptrC as long as the first segment is larger than the second,
      // and the third segment is greater than or equal to the first.
      while (
        calculateSegment(0) > calculateSegment(1) &&
        calculateSegment(2) >= calculateSegment(0)
      ) {
        ++ptrC;
      }

      // If the third segment becomes smaller than the first,
      // it means we've gone too far with ptrB.
      if (calculateSegment(2) < calculateSegment(0)) {
        // Revert ptrB and ptrC to their previous states.
        --ptrB;
        ptrC = tempPtrC;
        // Break out of the inner loop to adjust ptrA.
        break;
      }
    }
    // Update the maximum result with the current first segment's sum.
    maxResult = Math.max(calculateSegment(0), maxResult);
    // Move the first pointer forward.
    ++ptrA;
  }
  // Output the final maximum result.
  console.log(maxResult);
}
