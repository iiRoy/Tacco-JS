const programInput = require('fs') .readFileSync('/dev/stdin', 'utf-8') .split('\n');

const percolateDown = (heapElements, currentElementIndex) => {
  const leftSubtreeIndex = currentElementIndex * 2;
  const rightSubtreeIndex = leftSubtreeIndex + 1;

  let largestElementIndex;

  if (
    leftSubtreeIndex <= heapElements.length &&
    heapElements[leftSubtreeIndex - 1] > heapElements[currentElementIndex - 1]
  ) {
    largestElementIndex = leftSubtreeIndex;
  } else {
    largestElementIndex = currentElementIndex;
  }

  if (
    rightSubtreeIndex <= heapElements.length &&
    heapElements[rightSubtreeIndex - 1] > heapElements[largestElementIndex - 1]
  ) {
    largestElementIndex = rightSubtreeIndex;
  }

  if (largestElementIndex !== currentElementIndex) {
    const temporaryValue = heapElements[currentElementIndex - 1];
    heapElements[currentElementIndex - 1] = heapElements[largestElementIndex - 1];
    heapElements[largestElementIndex - 1] = temporaryValue;
    percolateDown(heapElements, largestElementIndex);
  }
};

const addValueToHeap = (heapContainer, valueToAdd) => {
  heapContainer.push(valueToAdd);

  const percolateUp = (elementPosition) => {
    if (elementPosition <= 1) return;

    const parentPosition = Math.floor(elementPosition / 2);

    if (heapContainer[elementPosition - 1] > heapContainer[parentPosition - 1]) {
      const tempSwap = heapContainer[elementPosition - 1];
      heapContainer[elementPosition - 1] = heapContainer[parentPosition - 1];
      heapContainer[parentPosition - 1] = tempSwap;
      percolateUp(parentPosition);
    }
  };

  percolateUp(heapContainer.length);
};

const removeLargest = (mainHeap) => {
  const extractedValue = mainHeap.shift();
  mainHeap.unshift(mainHeap.pop());
  percolateDown(mainHeap, 1);
  return extractedValue;
};

const heapOperationsResult = programInput.reduce(
  (activeHeap, inputLineString) => {
    const commandTokens = inputLineString.split(' ');

    switch (commandTokens[0]) {
      case 'insert':
        addValueToHeap(activeHeap, Number(commandTokens[1]));
        break;
      case 'extract':
        console.log(removeLargest(activeHeap));
        break;
    }

    return activeHeap;
  },
  []
);