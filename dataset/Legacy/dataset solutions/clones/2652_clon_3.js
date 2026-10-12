const InputParserFactory = (function() {
  class InputParser {
    constructor(sourceString) {
      this.sourceLines = sourceString.trim().split("\n");
      this.currentLineIdx = 0;
    }

    _parseNextAtom(returnAsString) {
      let currentLine = this.sourceLines[this.currentLineIdx];
      if (typeof currentLine === "string") {
        this.sourceLines[this.currentLineIdx] = currentLine.split(" ").reverse();
      }
      const atom = this.sourceLines[this.currentLineIdx].pop();
      if (!this.sourceLines[this.currentLineIdx].length) {
        this.currentLineIdx++;
      }
      return returnAsString ? atom : Number(atom);
    }

    readNumberAtom(returnAsString = false) {
      return this._parseNextAtom(returnAsString);
    }

    readNumberLine(returnAsString = false) {
      const lineContent = this.sourceLines[this.currentLineIdx++].split(" ");
      return returnAsString ? lineContent : lineContent.map(Number);
    }

    readNumberMatrix(rowCount, returnAsString = false) {
      const matrixRows = this.sourceLines.slice(this.currentLineIdx, this.currentLineIdx + rowCount);
      this.currentLineIdx += rowCount;
      return returnAsString ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(Number));
    }

    readNumberRows(rowCount, returnAsString = false) {
      const rows = this.sourceLines.slice(this.currentLineIdx, this.currentLineIdx + rowCount);
      this.currentLineIdx += rowCount;
      return returnAsString ? rows : rows.map(Number);
    }
  }

  return function(s) {
    return new InputParser(s);
  };
})();

const parserInstance = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimCount = dimensions.length;
  let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(x=>{return ${initialValue};})`;
  while (--dimCount) {
    arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(x=>${arrayCreationString})`;
  }
  return Function('dimensions', 'initialValue', 'return ' + arrayCreationString)(dimensions, initialValue);
}

const MinPriorityQueueFactory = (function() {
  class MinHeap {
    constructor() {
      this.elements = [];
    }

    _getParentIndex(idx) {
      return (idx - 1) >> 1;
    }

    insert(newItem) {
      const elementsRef = this.elements;
      let currentIdx = elementsRef.length;
      elementsRef.push(newItem); // Add to the end

      while (currentIdx > 0) {
        const parentIdx = this._getParentIndex(currentIdx);
        if (elementsRef[parentIdx][0] <= newItem[0]) {
          break;
        }
        elementsRef[currentIdx] = elementsRef[parentIdx];
        currentIdx = parentIdx;
      }
      elementsRef[currentIdx] = newItem;
    }

    extractMin() {
      const elementsRef = this.elements;
      const minItem = elementsRef[0];
      const heapSize = elementsRef.length;

      if (heapSize === 0) {
        return undefined;
      }
      if (heapSize === 1) {
        return elementsRef.pop();
      }

      const lastItem = elementsRef.pop();
      elementsRef[0] = lastItem;

      let currentIdx = 0;
      const newHeapSize = elementsRef.length;
      const halfNewHeapSize = newHeapSize >> 1;

      while (currentIdx < halfNewHeapSize) {
        let leftChildIdx = (currentIdx << 1) + 1;
        let rightChildIdx = leftChildIdx + 1;
        let smallestChildIdx = leftChildIdx;

        if (rightChildIdx < newHeapSize && elementsRef[rightChildIdx][0] < elementsRef[leftChildIdx][0]) {
          smallestChildIdx = rightChildIdx;
        }

        if (lastItem[0] <= elementsRef[smallestChildIdx][0]) {
          break;
        }

        elementsRef[currentIdx] = elementsRef[smallestChildIdx];
        currentIdx = smallestChildIdx;
      }
      elementsRef[currentIdx] = lastItem;

      return minItem;
    }
  }

  return function() {
    return new MinHeap();
  };
})();

console.log(main());

function main() {
  const problemSize = parserInstance.readNumberAtom();
  const initialValues = parserInstance.readNumberLine();
  const currentValues = parserInstance.readNumberLine();

  const operationQueue = MinPriorityQueueFactory();

  for (let idx = 0; idx < problemSize; idx++) {
    if (initialValues[idx] === currentValues[idx]) {
      continue;
    }
    if (initialValues[idx] > currentValues[idx]) {
      return -1;
    }
    operationQueue.insert([-currentValues[idx], idx]);
  }

  let totalOperationsCount = 0;
  const N = problemSize;

  const getNeighborValue = (arr, index, offset, size) => {
    return arr[(index + size + offset) % size];
  };

  while (operationQueue.elements.length > 0) {
    const extractedItem = operationQueue.extractMin();
    const targetIndex = extractedItem[1];
    const targetValue = -extractedItem[0];

    const leftNeighborValue = getNeighborValue(currentValues, targetIndex, -1, N);
    const rightNeighborValue = getNeighborValue(currentValues, targetIndex, 1, N);
    const neighborSum = leftNeighborValue + rightNeighborValue;

    if (neighborSum === 0) {
      return -1;
    }

    const divisionCount = Math.floor(currentValues[targetIndex] / neighborSum);

    if (divisionCount === 0) {
      return -1;
    }

    totalOperationsCount += divisionCount;
    currentValues[targetIndex] %= neighborSum;

    if (initialValues[targetIndex] === currentValues[targetIndex]) {
      continue;
    }
    if (initialValues[targetIndex] > currentValues[targetIndex]) {
      return -1;
    }
    operationQueue.insert([-currentValues[targetIndex], targetIndex]);
  }

  return totalOperationsCount;
}
