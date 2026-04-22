const processData = (rawData) => {

  // Parse the raw input string into an array of lines
  const lineData = rawData.split('\n');
  
  // Extract the total count of elements from the first line
  const dataLength = parseInt(lineData[0], 10);
  
  // Convert the second line into an array of integers
  const numericValues = lineData[1].split(' ').map(valueStr => parseInt(valueStr, 10));

  // Variable to maintain the running total for prefix sums
  let runningTotal = 0;
  
  // Compute the cumulative sums for the array elements
  // This array stores prefix sums where cumulativeSums[k] is the sum of numericValues[0]...numericValues[k]
  const cumulativeSums = numericValues.map((currentVal) => {
    runningTotal += currentVal;
    return runningTotal;
  });

  // Arrays to store the four partitioned segment sums
  const segmentOne = [];
  const segmentTwo = [];
  const segmentThree = [];
  const segmentFour = [];

  // Logic for determining optimal splits for the initial segments (P and Q)
  for (let outerIndex = 1, leftPointer = 0; outerIndex < dataLength - 2; ++outerIndex) {
    // The current sum up to the outerIndex, serving as a boundary for the first two segments
    const currentLeftBoundarySum = cumulativeSums[outerIndex];
    
    // Find the best split point 'leftPointer' for the first two parts (P and Q)
    // This uses a greedy approach, moving 'leftPointer' to minimize the difference between P and Q
    while (outerIndex >= 2) {
      // Calculate sums for current split (leftPointer)
      const firstSubPart = cumulativeSums[leftPointer];
      const secondSubPart = currentLeftBoundarySum - firstSubPart;

      // Calculate sums for the next potential split (leftPointer + 1)
      const firstSubPartNext = cumulativeSums[leftPointer + 1];
      const secondSubPartNext = currentLeftBoundarySum - firstSubPartNext;

      // If moving the left pointer improves or maintains the balance, do so
      if (Math.abs(secondSubPartNext - firstSubPartNext) <= Math.abs(secondSubPart - firstSubPart)) {
        ++leftPointer;
      } else {
        // Otherwise, the current 'leftPointer' is optimal for this 'outerIndex'
        break;
      }
    }

    // Store the calculated segment sums
    segmentOne.push(cumulativeSums[leftPointer]);
    segmentTwo.push(cumulativeSums[outerIndex] - cumulativeSums[leftPointer]);
  }

  // Logic for determining optimal splits for the trailing segments (R and S)
  // This loop iterates in reverse to match the P and Q segment generation
  for (let reverseIndex = dataLength - 2, rightPointer = 1; reverseIndex > 1; --reverseIndex, ++rightPointer) {
    // The sum up to the element just before 'reverseIndex', acting as a lower bound for R and S
    const precedingSumBoundary = cumulativeSums[reverseIndex - 1];
    
    // The total sum of all elements in the entire array
    const overallTotalSum = cumulativeSums[dataLength - 1];

    // Find the best split point 'rightPointer' for the last two parts (R and S)
    // Similar greedy approach to balance segments R and S
    while (reverseIndex < dataLength - 2) {
      // Calculate sums for current split (rightPointer)
      const thirdSubPart = overallTotalSum - cumulativeSums[reverseIndex + rightPointer - 1];
      const fourthSubPart = cumulativeSums[reverseIndex + rightPointer - 1] - precedingSumBoundary;

      // Calculate sums for the previous potential split (rightPointer - 1)
      const thirdSubPartPrev = overallTotalSum - cumulativeSums[reverseIndex + rightPointer - 2];
      const fourthSubPartPrev = cumulativeSums[reverseIndex + rightPointer - 2] - precedingSumBoundary;

      // If moving the right pointer back improves or maintains balance, do so
      if (Math.abs(thirdSubPartPrev - fourthSubPartPrev) <= Math.abs(thirdSubPart - fourthSubPart)) {
        --rightPointer;
      } else {
        // Otherwise, the current 'rightPointer' is optimal for this 'reverseIndex'
        break;
      }
    }
    
    // Store the calculated segment sums. unshift is used because the loop iterates backward,
    // ensuring the segments are stored in the correct order relative to P and Q.
    segmentThree.unshift(cumulativeSums[reverseIndex + rightPointer - 1] - precedingSumBoundary);
    segmentFour.unshift(overallTotalSum - cumulativeSums[reverseIndex + rightPointer - 1]);
  }

  // Initialize the variable to store the minimum difference found
  let minDiffResult = -1; 

  // Iterate through all possible combinations of the four segments
  for (let resultIndex = 0; resultIndex < segmentOne.length; ++resultIndex) {
    // Determine the maximum and minimum values among the four current segments
    const currentMax = Math.max(segmentOne[resultIndex], segmentTwo[resultIndex], segmentThree[resultIndex], segmentFour[resultIndex]);
    const currentMin = Math.min(segmentOne[resultIndex], segmentTwo[resultIndex], segmentThree[resultIndex], segmentFour[resultIndex]);
    
    // Calculate the range (difference between max and min) for the current configuration
    const currentDifference = currentMax - currentMin;
    
    // Update the minimum difference if the current one is smaller, or if it's the first result
    if (minDiffResult < 0 || currentDifference < minDiffResult) {
      minDiffResult = currentDifference;
    }
  }
  
  // Output the final minimum range found
  console.log(minDiffResult);

};

// Read input from standard input and pass it to the main processing function
processData(require("fs").readFileSync("/dev/stdin", "utf8"));