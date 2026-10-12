(function processInputAndHeapify() {
  const inputData = require('node:fs').readFileSync(0, 'utf8').trim().split('\n');
  const elementCount = Number(inputData.shift());
  const numberSequence = inputData.shift().split(' ').map(val => parseInt(val, 10));

  constructHeap(numberSequence, elementCount);

  console.log(numberSequence.join(' ').trim());
})();

function constructHeap(dataStore, count) {
  for (let currIdx = Math.floor(count / 2) - 1; currIdx >= 0; currIdx--) {
    percolateDown(dataStore, count, currIdx);
  }
}

function percolateDown(dataStore, count, currIdx) {
  let currentPosition = currIdx;
  while (true) {
    let childLeft = 2 * currentPosition + 1;
    let childRight = 2 * currentPosition + 2;
    let maxIndex = currentPosition;

    if (childLeft < count && dataStore[childLeft] > dataStore[maxIndex]) {
      maxIndex = childLeft;
    }
    if (childRight < count && dataStore[childRight] > dataStore[maxIndex]) {
      maxIndex = childRight;
    }

    if (maxIndex !== currentPosition) {
      [dataStore[currentPosition], dataStore[maxIndex]] = [dataStore[maxIndex], dataStore[currentPosition]];
      currentPosition = maxIndex;
    } else {
      break;
    }
  }
}
