let appSettings = {
  input: '/dev/stdin',
  newline: '\n'
};

let dataArray = require('fs').readFileSync(appSettings.input, 'ascii')
  .split(appSettings.newline, 2);

dataArray = dataArray[1].split(' ').map(Number);

let swapCount = performBubbleSort(dataArray);
console.log(dataArray.join(' '));
console.log(swapCount);

function performBubbleSort(inputCollection) {
  let totalSwaps;
  let hasSwapped;
  let currentIndex;
  let tempValue;

  totalSwaps = 0;
  hasSwapped = true;

  while (hasSwapped) {
    hasSwapped = false;
    for (currentIndex = inputCollection.length - 1; currentIndex > 0; currentIndex--) {
      if (inputCollection[currentIndex] < inputCollection[currentIndex - 1]) {
        tempValue = inputCollection[currentIndex];
        inputCollection[currentIndex] = inputCollection[currentIndex - 1];
        inputCollection[currentIndex - 1] = tempValue;
        hasSwapped = true;
        totalSwaps++;
      }
    }
  }
  return totalSwaps;
}
