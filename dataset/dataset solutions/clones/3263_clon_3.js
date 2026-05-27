'use strict'

class SolutionProcessor {
  execute() {
    const inputNumbers = inputReader.getIntegerArray();
    const limitK = inputNumbers[1];
    const itemData = inputReader.getIntegerMatrix(inputNumbers[0]);
    const calculatedScores = [];

    itemData.sort((a, b) => b[1] - a[1]);
    const selectedItems = utilityFunctions.getFirstElements(itemData, limitK);
    const itemKindCounts = {};

    selectedItems.forEach(item => {
      const itemType = item[0];
      itemKindCounts[itemType] = (itemKindCounts[itemType] || 0) + 1;
    });

    let distinctKindCount = Object.keys(itemKindCounts).length;
    let currentTotalValue = utilityFunctions.calculateSum(selectedItems.map(item => item[1]));
    calculatedScores[distinctKindCount] = currentTotalValue;

    const minHeap = new PriorityQueue();
    selectedItems.forEach(item => {
      if (itemKindCounts[item[0]] > 1) {
        minHeap.insert(-item[1], item);
      }
    });

    let currentItemIndex = limitK;
    while (minHeap.size > 0 && currentItemIndex < itemData.length) {
      const itemToReplace = minHeap.extractMin();
      const typeOfItemToReplace = itemToReplace[0];

      if (itemKindCounts[typeOfItemToReplace] >= 2) {
        let foundReplacement = false;
        while (currentItemIndex < itemData.length) {
          const candidateItem = itemData[currentItemIndex];
          const candidateType = candidateItem[0];

          if (!itemKindCounts[candidateType]) {
            minHeap.insert(-candidateItem[1], candidateItem);
            
            distinctKindCount++;
            itemKindCounts[typeOfItemToReplace]--;
            itemKindCounts[candidateType] = 1;

            currentTotalValue += candidateItem[1] - itemToReplace[1];
            calculatedScores[distinctKindCount] = currentTotalValue;
            
            foundReplacement = true;
            currentItemIndex++;
            break;
          }
          currentItemIndex++;
        }
      }
    }

    const finalScores = calculatedScores.map((scoreValue, index) => scoreValue ? (scoreValue + index * index) : 0);
    console.log(utilityFunctions.findMax(finalScores));
  }
}

class InputReader {
  constructor() {
    this.readCursor = 0;
    this.inputLines = this.initializeInput();
  }

  initializeInput() {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    return fileContent.split('\n');
  }

  getLines(count) {
    if (count) {
      const linesToReturn = this.inputLines.slice(this.readCursor, this.readCursor + count);
      this.readCursor += count;
      return linesToReturn;
    }
    const singleLine = this.inputLines[this.readCursor];
    this.readCursor++;
    return singleLine;
  }

  getStringArray() {
    return this.getLines().split(' ');
  }

  getIntegerArray() {
    return this.getStringArray().map(str => parseInt(str, 10));
  }

  getStringMatrix(rowCount) {
    return this.getLines(rowCount).map(line => line.split(' '));
  }

  getIntegerMatrix(rowCount) {
    return this.getLines(rowCount).map(line => line.split(' ').map(str => parseInt(str, 10)));
  }
}

class UtilityFunctions {
  calculateSum(array) {
    return array.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  findMin(array, comparisonFunc) {
    const comparator = comparisonFunc || ((a, b) => a - b);
    return array.reduce((minVal, currentVal) => comparator(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  findMax(array, comparisonFunc) {
    const comparator = comparisonFunc || ((a, b) => a - b);
    return array.reduce((maxVal, currentVal) => comparator(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  generateRange(startValue, stopValue, stepValue) {
    let currentStart = startValue;
    let currentStop = stopValue;
    let currentStep = stepValue;

    if (currentStop == null) {
      currentStop = currentStart || 0;
      currentStart = 0;
    }
    if (!currentStep) {
      currentStep = currentStop < currentStart ? -1 : 1;
    }

    const rangeLength = Math.max(Math.ceil((currentStop - currentStart) / currentStep), 0);
    const resultRange = new Array(rangeLength);

    for (let i = 0; i < rangeLength; i++) {
      resultRange[i] = currentStart + i * currentStep;
    }
    return resultRange;
  }

  getFirstElements(sourceArray, count) {
    if (!sourceArray || sourceArray.length < 1) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - count);
  }

  getInitialElements(sourceArray, numToExclude) {
    return sourceArray.slice(0, Math.max(0, sourceArray.length - (numToExclude == null ? 1 : numToExclude)));
  }

  getTailElements(sourceArray, numToSkip) {
    return sourceArray.slice(numToSkip == null ? 1 : numToSkip);
  }

  getLastElements(sourceArray, count) {
    if (count == null) return sourceArray[sourceArray.length - 1];
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - count));
  }

  performBinarySearch(sourceArray, searchKey, keyExtractor) {
    const extractValue = (obj) => (typeof obj === 'object') ? obj[keyExtractor] : obj;
    const targetValue = extractValue(searchKey);
    let lowIndex = 0, highIndex = sourceArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (extractValue(sourceArray[midIndex]) < targetValue) lowIndex = midIndex + 1; else highIndex = midIndex;
    }
    return lowIndex;
  }
}
const utilityFunctions = new UtilityFunctions();

class PriorityQueue {
  constructor() {
    this.heapElements = [];
    this.elementCount = 0;
  }

  _swap(indexA, indexB) {
    const temp = this.heapElements[indexA];
    this.heapElements[indexA] = this.heapElements[indexB];
    this.heapElements[indexB] = temp;
  }

  insert(priorityValue, actualValue) {
    const newElement = { priority: priorityValue, value: actualValue };
    this.heapElements.push(newElement);
    let currentIndex = this.elementCount;
    let parentIndex = Math.floor((currentIndex - 1) / 2);

    while (currentIndex > 0 && this.heapElements[parentIndex].priority < this.heapElements[currentIndex].priority) {
      this._swap(currentIndex, parentIndex);
      currentIndex = parentIndex;
      parentIndex = Math.floor((currentIndex - 1) / 2);
    }
    this.elementCount++;
  }

  extractMin() {
    if (this.elementCount <= 0) {
      return null;
    }
    const extractedValue = this.peek;
    const lastElementIndex = this.elementCount - 1;
    
    this.heapElements[0] = this.heapElements[lastElementIndex];
    this.heapElements.pop();
    this.elementCount--;

    let currentIndex = 0;
    let leftChildIndex = (currentIndex * 2) + 1;
    let rightChildIndex = (currentIndex * 2) + 2;

    while (leftChildIndex < this.elementCount) {
      let largestChildIndex = leftChildIndex;
      if (rightChildIndex < this.elementCount && this.heapElements[rightChildIndex].priority > this.heapElements[leftChildIndex].priority) {
        largestChildIndex = rightChildIndex;
      }

      if (this.heapElements[currentIndex].priority < this.heapElements[largestChildIndex].priority) {
        this._swap(currentIndex, largestChildIndex);
        currentIndex = largestChildIndex;
        leftChildIndex = (currentIndex * 2) + 1;
        rightChildIndex = (currentIndex * 2) + 2;
      } else {
        break;
      }
    }
    return extractedValue;
  }

  get peek() {
    if (this.elementCount === 0) return null;
    return this.heapElements[0].value;
  }

  get size() {
    return this.elementCount;
  }
}

const inputReader = new InputReader();
(new SolutionProcessor()).execute();
