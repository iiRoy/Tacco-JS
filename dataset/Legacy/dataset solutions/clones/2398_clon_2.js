function ProcessInput(rawData) {
  // This function takes raw input string and processes it to find specific patterns.
  const linesArray = rawData.trim().split('\n');

  // Extract numerical parameters from the first line of input.
  const firstLineParts = linesArray[0].split(' ');
  const numElements = Math.floor(parseInt(firstLineParts[0], 10)); // N: total number of elements
  const divisorValue = Math.floor(parseInt(firstLineParts[1], 10)); // K: the divisor for modulo operations
  
  // Convert the second line of input into an array of integers.
  const numberSequence = linesArray[0x1].split(' ').map(stringItem => parseInt(stringItem, 0xA));
  let resultCount = 0; // Initialize a counter for subsequences meeting the criteria.
  
  // Iterate through the array to find all possible contiguous subsequences.
  for (let outerIndex = 0; outerIndex < numElements; ++outerIndex) {
    let currentSum = numberSequence[outerIndex]; // Start sum with the current element.
    
    // Check the condition for the single-element subsequence.
    if (numberSequence[outerIndex] % divisorValue === 0x1) {
      resultCount++;
    }
    
    // Extend the subsequence by adding subsequent elements.
    for (let innerOffset = 0x1; innerOffset < numElements - outerIndex; innerOffset++) {
      currentSum += numberSequence[outerIndex + innerOffset]; // Accumulate sum for the current subsequence.
      
      // Check the condition for the extended subsequence.
      if (currentSum % divisorValue === innerOffset + 0x1) {
        resultCount++;
      }
    }
  }
  
  // Output the final tally of subsequences that satisfied the conditions.
  console.log(resultCount);
}

// Read the entire content from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
