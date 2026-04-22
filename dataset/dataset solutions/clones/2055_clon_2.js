// This module processes input data to find an optimal solution.
function ProcessInput(rawData) {
  const gridHeight = rawData[0].split(" ")[0] - 0; // Parse height of the grid
  const gridWidth = rawData[0].split(" ")[1] - 0;  // Parse width of the grid
  const maxChoco = rawData[0].split(" ")[2] - 0;   // Parse max chocolates per section
  
  // Initialize grid data
  const gridData = [];
  for (let rowIdx = 1; rowIdx <= gridHeight; rowIdx++) {
    gridData[rowIdx - 1] = rawData[rowIdx];
  }
  
  // Initialize global minimum cuts with a large value (initial guess H*W)
  overallMinCuts = gridHeight * gridWidth;
  
  // Generate all possible horizontal partition options
  const partitionOptions = GenerateCombinations(gridHeight - 1);
  
  // Iterate through each partition option to find the best one
  partitionOptions.forEach(currentOption => {
    VerifyPartition(gridData, currentOption, maxChoco, gridHeight);
  });
  
  // Output the final minimum cuts
  console.log(overallMinCuts);
}

// Global variable to store the minimum number of cuts found
let overallMinCuts = 0;

// Function to verify a given horizontal partition and update the minimum cuts
function VerifyPartition(currentGrid, currentOption, maxChocoAllowed, totalHeight) {
  let currentCuts = currentOption.cutCount; // Start with horizontal cuts
  const columnCount = currentGrid[0].length; // Get the number of columns
  let unusedVar = 0; // A variable that was in the original but not used, kept for structure
  
  let segmentSums = []; // Array to store sum of chocolates in each segment for the current column
  let columnIsValid = false; // Flag to indicate if current column was processed correctly
  let verticalCutAdded = false; // Flag to indicate if a vertical cut was added
  
  // Loop through each column of the grid
  columnLoop: for (let colIdx = 0; colIdx < columnCount; colIdx++) {
    let segmentIndex = 0; // Index for the current segment
    
    // Loop through each row in the current column
    for (let rowIdx = 0; rowIdx < totalHeight; rowIdx++) {
      // If chocolate is present, add to the current segment's sum
      if (currentGrid[rowIdx][colIdx] === "1") {
        segmentSums[segmentIndex] = (segmentSums[segmentIndex] || 0) + 1;
      }
      
      // If any segment exceeds the maximum allowed chocolates
      if (segmentSums[segmentIndex] > maxChocoAllowed) {
        if (!columnIsValid) return; // If previous column was not valid, this partition is invalid
        
        columnIsValid = false; // Reset validity for this column
        verticalCutAdded = true; // A vertical cut is needed
        colIdx--; // Re-process the current column after adding a cut
        segmentSums = []; // Reset segment sums for the new column
        continue columnLoop; // Continue to the next iteration of the column loop
      }
      
      // If a horizontal split is defined for this row, move to the next segment
      if (currentOption.verticalSplits[rowIdx] === "1") {
        segmentIndex++;
      }
    }
    
    columnIsValid = true; // Current column was processed without exceeding limits
    if (verticalCutAdded) currentCuts++; // If a vertical cut was added, increment total cuts
    
    // If this is the last column, update the overall minimum cuts
    if (colIdx === columnCount - 1) {
      overallMinCuts = Math.min(overallMinCuts, currentCuts);
    }
  }
  return currentCuts; // Return the number of cuts for this specific partition
}

// Generates a list of all possible horizontal split combinations
function GenerateCombinations(lengthOfSplits) {
  const optionList = []; // Array to store combination objects
  
  // Iterate from 0 to 2^(lengthOfSplits) - 1 to get all bit patterns
  for (let comboVal = 0; comboVal < Math.pow(2, lengthOfSplits); comboVal++) {
    // Convert integer to binary string and pad with leading zeros
    const binaryString = ("0000000000" + comboVal.toString(2)).slice(-lengthOfSplits);
    
    // Add combination object with cut count and binary split pattern
    optionList.push({ cutCount: CountSetBits(comboVal), verticalSplits: binaryString });
  }
  
  // Sort the list by cut count for potential optimization (though not strictly necessary for correctness)
  return optionList.sort((a, b) => a.cutCount - b.cutCount);
}

// Counts the number of set bits (1s) in a 32-bit integer using a fast algorithm
function CountSetBits(bitValue) {
  // This is a standard bit manipulation trick (SWAR algorithm)
  bitValue = bitValue - ((bitValue >> 1) & 0x55555555);
  bitValue = (bitValue & 0x33333333) + ((bitValue >> 2) & 0x33333333);
  return ((bitValue + (bitValue >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
}

// Entry point: Read input from standard input, process it, and run the main logic.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));