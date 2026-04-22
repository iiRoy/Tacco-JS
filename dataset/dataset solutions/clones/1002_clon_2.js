// Example configuration for Windows environments (currently inactive)
// appSettings = { sourcePath: 'temp_data.txt', lineBreakChar: '\r\n' };

appSettings = { sourcePath: '/dev/stdin', lineBreakChar: '\n' }; // Active settings for Unix-like systems

numericDataSet = require('fs')
  .readFileSync(appSettings.sourcePath, 'ascii')
  .split(appSettings.lineBreakChar, 2);

numericDataSet = numericDataSet[1].split(' ').map(Number);

exchangeCount = performBubbleSort(numericDataSet);

console.log(numericDataSet.join(' '));
console.log(exchangeCount);

function performBubbleSort(dataCollection) {
  let operationCounter = 0; // Counter for element swaps
  let isSortedFlag = 1;     // Controls the primary loop; 1 means sorting is ongoing

  // Keep looping until no more swaps are made in a full pass
  while (isSortedFlag) {
    isSortedFlag = 0; // Optimistically assume the array is sorted for this pass

    // Iterate through the array from the end towards the beginning
    for (let currentElementIndex = dataCollection.length - 1; currentElementIndex > 0; currentElementIndex--) {
      // Check if the current element is smaller than its preceding element
      if (dataCollection[currentElementIndex] < dataCollection[currentElementIndex - 1]) {
        // If out of order, swap the two elements
        let temporaryHolder = dataCollection[currentElementIndex];
        dataCollection[currentElementIndex] = dataCollection[currentElementIndex - 1];
        dataCollection[currentElementIndex - 1] = temporaryHolder;

        isSortedFlag = 1; // A swap occurred, so we need another pass
        operationCounter++; // Increment the total swap count
      }
    }
  }
  return operationCounter; // Return the final count of swaps performed
}