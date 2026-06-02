(function mainExecution() {
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const totalCount = Number(inputLines.shift());
  const dataElements = inputLines.shift().split(' ');
  constructHeap(dataElements);
  console.log(dataElements.reduce((accumulator, element) => accumulator += ' ' + element, ''));
})();

function constructHeap(collection) {
  const currentHeapSize = collection.length;

  const siftDown = (elementsArray, rootPosition, heapLimit) => {
    let currentPosition = rootPosition;
    while (true) {
      const leftChildPosition = 2 * currentPosition + 1;
      const rightChildPosition = 2 * currentPosition + 2;
      let largestElementPosition = currentPosition;

      if (leftChildPosition < heapLimit && Number(elementsArray[leftChildPosition]) > Number(elementsArray[largestElementPosition])) {
        largestElementPosition = leftChildPosition;
      }

      if (rightChildPosition < heapLimit && Number(elementsArray[rightChildPosition]) > Number(elementsArray[largestElementPosition])) {
        largestElementPosition = rightChildPosition;
      }

      if (largestElementPosition === currentPosition) {
        break;
      }

      [elementsArray[currentPosition], elementsArray[largestElementPosition]] = [elementsArray[largestElementPosition], elementsArray[currentPosition]];
      currentPosition = largestElementPosition;
    }
  };

  for (let idx = Math.floor(currentHeapSize / 2 - 1); idx >= 0; idx--) {
    siftDown(collection, idx, currentHeapSize);
  }
}
