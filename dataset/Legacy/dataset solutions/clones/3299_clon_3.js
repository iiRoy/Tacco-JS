function processInputData(parsedLines) {
  const rowCount = parseInt(parsedLines[0]);
  const dpTable = new Array(rowCount);

  const NUM_CHOICES = 3; // Constant for the number of choices (colors)

  for (let currentRowIdx = 0; currentRowIdx < rowCount; currentRowIdx++) {
    const currentCostsStr = parsedLines[currentRowIdx + 1].split(' ');
    dpTable[currentRowIdx] = new Array(NUM_CHOICES); // Initialize the current row array

    if (currentRowIdx === 0) {
      // Base case: Directly parse and store costs for the first row
      for (let choiceIndex = 0; choiceIndex < NUM_CHOICES; choiceIndex++) {
        dpTable[0][choiceIndex] = parseInt(currentCostsStr[choiceIndex]);
      }
    } else {
      // Dynamic programming step for subsequent rows
      for (let currentChoiceIdx = 0; currentChoiceIdx < NUM_CHOICES; currentChoiceIdx++) {
        const currentCostValue = parseInt(currentCostsStr[currentChoiceIdx]); // Helper variable for current cost

        const potentialSums = []; // Array to collect sums from valid previous choices
        for (let offsetVal = 1; offsetVal < NUM_CHOICES; offsetVal++) {
          const prevChoiceIdx = (currentChoiceIdx + offsetVal) % NUM_CHOICES; // Calculate index of a different choice from previous row
          const sumFromPreviousRow = dpTable[currentRowIdx - 1][prevChoiceIdx];
          potentialSums.push(sumFromPreviousRow + currentCostValue);
        }
        
        // Find the maximum among the collected potential sums
        const currentMaxForChoice = Math.max(...potentialSums);
        dpTable[currentRowIdx][currentChoiceIdx] = currentMaxForChoice;
      }
    }
  }

  console.log(Math.max(...dpTable[rowCount - 1]));
}


let rawDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawDataBuffer += chunk;
});
process.stdin.on('end', function() {
  const parsedLines = rawDataBuffer.split('\n');
  processInputData(parsedLines);
});
