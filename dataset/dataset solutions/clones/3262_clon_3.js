'use strict';

class AppSolver {
  processData() {
    const configParams = dataReader.readNumericArray();
    
    const totalItemsCount = configParams[0];
    const itemsToSelect = configParams[1];

    const itemDataMatrix = dataReader.readNumericMatrix(totalItemsCount);
    
    const calculatedScoresByKind = [];

    itemDataMatrix.sort((itemA, itemB) => itemB[1] - itemA[1]);

    const initialSelection = itemDataMatrix.slice(0, itemsToSelect);

    const kindCountsMap = new Map();
    
    let currentTotalValue = 0;
    for (const selectedItem of initialSelection) {
        const itemKind = selectedItem[0];
        const itemValue = selectedItem[1];
        
        kindCountsMap.set(itemKind, (kindCountsMap.get(itemKind) || 0) + 1);
        currentTotalValue += itemValue;
    }
    
    let currentUniqueKinds = kindCountsMap.size;
    
    calculatedScoresByKind[currentUniqueKinds] = currentTotalValue;

    const redundantItemQueue = new MaxPriorityQueue();
    
    for (const selectedItem of initialSelection) {
        const itemKind = selectedItem[0];
        const itemValue = selectedItem[1];
        
        if (kindCountsMap.get(itemKind) > 1) {
            redundantItemQueue.insertElement(itemValue, selectedItem);
        }
    }

    let explorationIndex = initialSelection.length;
    
    while (!redundantItemQueue.isEmpty() && explorationIndex < itemDataMatrix.length) {
      const itemToRemove = redundantItemQueue.extractMax();
      
      const kindOfItemToRemove = itemToRemove[0];
      const valueOfItemToRemove = itemToRemove[1];

      if (kindCountsMap.get(kindOfItemToRemove) >= 2) {
        kindCountsMap.set(kindOfItemToRemove, kindCountsMap.get(kindOfItemToRemove) - 1);
        
        let foundReplacement = false;
        
        while (explorationIndex < itemDataMatrix.length && !foundReplacement) {
          const candidateItem = itemDataMatrix[explorationIndex];
          const candidateKind = candidateItem[0];
          const candidateValue = candidateItem[1];

          explorationIndex++;

          if (!kindCountsMap.has(candidateKind) || kindCountsMap.get(candidateKind) === 0) {
            kindCountsMap.set(candidateKind, 1);
            
            currentUniqueKinds++;
            foundReplacement = true;

            calculatedScoresByKind[currentUniqueKinds] = calculatedScoresByKind[currentUniqueKinds - 1] + candidateValue - valueOfItemToRemove;
          } else {
            kindCountsMap.set(candidateKind, kindCountsMap.get(candidateKind) + 1);
            if (kindCountsMap.get(candidateKind) > 1) {
                redundantItemQueue.insertElement(candidateValue, candidateItem);
            }
          }
        }
      }
    }

    const finalEvaluationResults = [];
    for (let idx = 0; idx < calculatedScoresByKind.length; idx++) {
        const baseScore = calculatedScoresByKind[idx];
        if (baseScore != null) {
            finalEvaluationResults.push(baseScore + idx * idx);
        } else {
            finalEvaluationResults.push(0);
        }
    }
    
    console.log(utils.findMaximum(finalEvaluationResults));
  }
}

class InputProcessor {
  constructor() {
    this.currentLineIndex = 0;
    this.rawInputLines = [];
    this.loadAllData();
  }

  loadAllData() {
    this.rawInputLines = (global.require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawInputLines;
  }

  readLines(numLines) {
    if (numLines) {
      if (numLines <= 0) {
          return [];
      }
      const linesSlice = this.rawInputLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
      this.currentLineIndex += numLines;
      return linesSlice;
    }
    if (this.currentLineIndex >= this.rawInputLines.length) {
        return null;
    }
    return this.rawInputLines[this.currentLineIndex++];
  }

  readStringArray() {
    const line = this.readLines();
    return line ? line.split(' ') : [];
  }

  readNumericArray() {
    return this.readStringArray().map((element) => Number.parseInt(element, 10));
  }

  readStringMatrix(rowsCount) {
    return this.readLines(rowsCount).map((line) => line.split(' '));
  }

  readNumericMatrix(rowsCount) {
    return this.readLines(rowsCount).map((line) => line.split(' ').map((element) => Number.parseInt(element, 10)));
  }
}

class UtilityTools {
  isFunction(value) {
    return typeof value === 'function';
  }

  calculateSum(numericArray) {
    if (!numericArray || numericArray.length === 0) return 0;
    return numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  findMinimum(dataArray, comparisonFunction) {
    if (!dataArray || dataArray.length === 0) return undefined;
    let effectiveComparator = comparisonFunction;
    if (!this.isFunction(effectiveComparator)) {
      effectiveComparator = (a, b) => a - b;
    }
    return dataArray.reduce((minElement, currentElement) => effectiveComparator(minElement, currentElement) < 0 ? minElement : currentElement);
  }

  findMaximum(dataArray, comparisonFunction) {
    if (!dataArray || dataArray.length === 0) return undefined;
    let effectiveComparator = comparisonFunction;
    if (!this.isFunction(effectiveComparator)) {
      effectiveComparator = (a, b) => a - b;
    }
    return dataArray.reduce((maxElement, currentElement) => effectiveComparator(maxElement, currentElement) > 0 ? maxElement : currentElement);
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
    
    const rangeLength = Math.max(0, Math.ceil((currentStop - currentStart) / currentStep));
    const resultRange = Array(rangeLength);

    for (let index = 0; index < rangeLength; index++) {
      resultRange[index] = currentStart;
      currentStart += currentStep;
    }
    return resultRange;
  }

  takeFirst(sourceArray, count) {
    if (!sourceArray || sourceArray.length === 0) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    return sourceArray.slice(0, Math.max(0, count));
  }

  getInitialElements(sourceArray, numToExclude) {
    if (!sourceArray || sourceArray.length === 0) return [];
    const excludeCount = numToExclude == null ? 1 : numToExclude;
    return sourceArray.slice(0, Math.max(0, sourceArray.length - excludeCount));
  }

  getTailElements(sourceArray, numToExclude) {
    if (!sourceArray || sourceArray.length === 0) return [];
    const excludeCount = numToExclude == null ? 1 : numToExclude;
    return sourceArray.slice(excludeCount);
  }

  takeLast(sourceArray, count) {
    if (!sourceArray || sourceArray.length === 0) return count == null ? undefined : [];
    if (count == null) return sourceArray[sourceArray.length - 1];
    return sourceArray.slice(Math.max(0, sourceArray.length - count));
  }

  performBinarySearch(sortedArray, searchKey, accessorProperty) {
    const getValue = (item) => {
      return (typeof item === 'object' && accessorProperty != null) ? item[accessorProperty] : item;
    };

    const targetValue = getValue(searchKey);
    let lowIndex = 0;
    let highIndex = sortedArray.length;

    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getValue(sortedArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
const utils = new UtilityTools();

class MaxPriorityQueue {
  constructor() {
    this.heapElements = [];
    this.elementCount = 0;
  }

  insertElement(itemPriority, itemValue) {
    const heap = this.heapElements;
    heap.push({ priority: itemPriority, value: itemValue });
    
    let currentIndex = this.elementCount;
    let parentIndex = Math.floor((currentIndex - 1) / 2);
    
    while (parentIndex >= 0 && heap[parentIndex].priority < heap[currentIndex].priority) {
      [heap[currentIndex], heap[parentIndex]] = [heap[parentIndex], heap[currentIndex]];
      currentIndex = parentIndex;
      parentIndex = Math.floor((currentIndex - 1) / 2);
    }
    this.elementCount++;
  }

  extractMax() {
    if (this.elementCount === 0) {
      return null;
    }
    
    const maxElementValue = this.peekMax;
    const heap = this.heapElements;
    
    this.elementCount--;
    const lastElement = heap.pop();
    
    if (this.elementCount === 0) {
        return maxElementValue;
    }

    heap[0] = lastElement;
    let currentIndex = 0;
    
    while (true) {
      let leftChildIndex = (currentIndex * 2) + 1;
      let rightChildIndex = (currentIndex * 2) + 2;
      let largestIndex = currentIndex;

      if (leftChildIndex < this.elementCount && heap[leftChildIndex].priority > heap[largestIndex].priority) {
        largestIndex = leftChildIndex;
      }
      if (rightChildIndex < this.elementCount && heap[rightChildIndex].priority > heap[largestIndex].priority) {
        largestIndex = rightChildIndex;
      }

      if (largestIndex !== currentIndex) {
        [heap[currentIndex], heap[largestIndex]] = [heap[largestIndex], heap[currentIndex]];
        currentIndex = largestIndex;
      } else {
        break;
      }
    }

    return maxElementValue;
  }

  get peekMax() {
    if (this.elementCount === 0) {
        return null;
    }
    return this.heapElements[0].value;
  }

  get size() {
    return this.elementCount;
  }

  isEmpty() {
      return this.elementCount === 0;
  }
}

const dataReader = new InputProcessor();
(new AppSolver()).processData();