'use strict';
(function(rawInputData) {
  // Helper function to parse raw string input into an array of integers.
  const parseNumericInput = (textToParse) => {
    return textToParse.trim().split(/\s+/).map(val => parseInt(val, 10));
  };

  let processedNumbers = parseNumericInput(rawInputData);

  // The first number in the input represents the total count of items.
  const totalItemsCount = processedNumbers.shift();
  
  // Initialize an array to count occurrences of item categories (1, 2, 3).
  // Assuming 'zero' in the original was a typo for 0.
  const itemCategoryCounts = [0, 0, 0, 0]; 
  
  // Iterate through the remaining numbers to populate the category counts.
  for (const categoryValue of processedNumbers) {
    // Add a guard clause to ensure categoryValue is within expected bounds.
    if (categoryValue >= 0 && categoryValue < itemCategoryCounts.length) {
      itemCategoryCounts[categoryValue]++;
    }
  }

  // Pre-calculate the size for the first dimension of the memoization table.
  const memoTableDim1Size = totalItemsCount + 2;
  const memoizationTable = new Array(memoTableDim1Size);

  // Initialize the 3D memoization table.
  // The loops iterate from -1 to N+1 to match the original indexing scheme.
  for (let dim1Index = -1; dim1Index < memoTableDim1Size; dim1Index++) {
    // Calculate the size for the second dimension based on the first.
    const memoTableDim2Size = totalItemsCount + 2 - dim1Index;
    memoizationTable[dim1Index] = new Array(memoTableDim2Size);

    for (let dim2Index = -1; dim2Index < memoTableDim2Size; dim2Index++) {
      // Calculate the size for the third dimension based on the first two.
      const memoTableDim3Size = totalItemsCount + 2 - dim1Index - dim2Index;
      const innermostArray = new Array(memoTableDim3Size).fill(0);
      memoizationTable[dim1Index][dim2Index] = innermostArray;
      
      // Preserve the original behavior of setting a property named "-1" on the innermost array.
      // In JavaScript, arr[-1] creates a property, not an indexed element.
      innermostArray["-1"] = 0; 
    }
  }
  
  // Perform the dynamic programming calculation.
  // This loop calculates values for the first dimension, with the other dimensions fixed at 0.
  for (let dim1Index = 1; dim1Index <= totalItemsCount; dim1Index++) {
    // Introduce a temporary constant for the division result to improve readability.
    const currentDivisionResult = totalItemsCount / dim1Index;
    memoizationTable[dim1Index][0][0] = memoizationTable[dim1Index - 1][0][0] + currentDivisionResult;
    
    // The original code contained an empty loop here: `for(let j=1;j<=i;j++){}`.
    // This loop performed no operations and had no observable side effects,
    // thus it has been removed as non-essential code.
  }

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
