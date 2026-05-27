'use strict';

class SolutionProcessor {
  processData() {
    const inputNumbers = inputHandler.readIntArray();
    const limitK = inputNumbers[1];
    const itemData = inputHandler.readMatrixOfIntegers(inputNumbers[0]);
    const calculatedScores = [];

    const { initialSelection, kindCounts, distinctKinds, initialScore } = this.initializeSelectionAndCounts(itemData, limitK, utils);
    calculatedScores[distinctKinds] = initialScore;

    const priorityQueue = new MaxPriorityQueue();
    initialSelection.forEach(item => {
      if (kindCounts[item[0]] > 1) {
        priorityQueue.addWithPriority(item[1], item);
      }
    });

    let currentIndex = initialSelection.length;
    let currentDistinctKinds = distinctKinds; // Use a mutable variable for distinctKinds
    while (priorityQueue.getCurrentSize() > 0 && currentIndex < itemData.length) {
      const removedItem = priorityQueue.extractHighestPriority();
      if (kindCounts[removedItem[0]] >= 2) {
        kindCounts[removedItem[0]]--;
        
        let replacementFound = false;
        while (currentIndex < itemData.length) {
          const currentItem = itemData[currentIndex];
          currentIndex++;
          if (!kindCounts[currentItem[0]]) {
            kindCounts[currentItem[0]] = 1;
            priorityQueue.addWithPriority(currentItem[1], currentItem);
            currentDistinctKinds++;
            const scoreBeforeAddition = calculatedScores[currentDistinctKinds - 1];
            calculatedScores[currentDistinctKinds] = scoreBeforeAddition + currentItem[1] - removedItem[1];
            replacementFound = true;
            break;
          }
        }
      }
    }

    const finalScores = calculatedScores.map((currentScore, index) => {
      if (currentScore !== undefined && currentScore !== null) {
        return currentScore + index * index;
      } else {
        return 0;
      }
    });
    console.log(utils.findMaxElement(finalScores));
  }

  initializeSelectionAndCounts(dataItems, selectionLimit, utilityFunctions) {
    dataItems.sort((a, b) => b[1] - a[1]);
    
    const selectedItems = utilityFunctions.getLeadingElements(dataItems, selectionLimit);
    const kindTally = {};
    selectedItems.forEach(item => {
      kindTally[item[0]] = (kindTally[item[0]] || 0) + 1;
    });
    const uniqueKindCount = Object.keys(kindTally).length;
    const initialTotalScore = utilityFunctions.calculateSumOfArray(selectedItems.map(item => item[1]));
    
    return {
      initialSelection: selectedItems,
      kindCounts: kindTally,
      distinctKinds: uniqueKindCount,
      initialScore: initialTotalScore
    };
  }
}

class InputReader {
  constructor() {
    this.readIndex = 0;
    this.loadAllInputData();
  }

  loadAllInputData() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  retrieveNextLines(count) {
    if (count) {
      const resultLines = this.inputLines.slice(this.readIndex, this.readIndex + count);
      this.readIndex += count;
      return resultLines;
    }
    return this.inputLines[this.readIndex++];
  }

  readSpaceSeparatedStrings() {
    return this.retrieveNextLines().split(' ');
  }

  readSpaceSeparatedIntegers() {
    return this.readSpaceSeparatedStrings().map((element) => Number(element));
  }

  readMatrixOfStrings(rowCount) {
    return this.retrieveNextLines(rowCount).map((line) => line.split(' '));
  }

  readMatrixOfIntegers(rowCount) {
    return this.retrieveNextLines(rowCount).map((line) => line.split(' ').map((element) => Number(element)));
  }
}

class UtilityFunctions {
  calculateSumOfArray(arr) { return arr.reduce((accumulator, currentValue) => accumulator + currentValue); }
  
  findMinElement(arr, comparatorFunc) { 
    if (comparatorFunc == null) { comparatorFunc = (a, b) => a - b; } 
    return arr.reduce((minVal, currentVal) => comparatorFunc(minVal, currentVal) < 0 ? minVal : currentVal); 
  }
  
  findMaxElement(arr, comparatorFunc) { 
    if (comparatorFunc == null) { comparatorFunc = (a, b) => a - b; } 
    return arr.reduce((maxVal, currentVal) => comparatorFunc(maxVal, currentVal) > 0 ? maxVal : currentVal); 
  }

  generateRange(start, stop, step) {
	if (stop == null) {
	  stop = start || 0;
	  start = 0;
	}
	if (!step) {
	  step = stop < start ? -1 : 1;
	}
	const length = Math.max(Math.ceil((stop - start) / step), 0);
	const rangeArray = Array(length);

	for (let index = 0; index < length; index++, start += step) {
	  rangeArray[index] = start;
	}
	return rangeArray;
  }

  getLeadingElements (sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    return this.getInitialSegment(sourceArray, sourceArray.length - count);
  }

  getInitialSegment (sourceArray, countToExclude) { return sourceArray.slice(0, Math.max(0, sourceArray.length - (countToExclude == null ? 1 : countToExclude))); }

  getTrailingElements(sourceArray, countToSkip) { return sourceArray.slice(countToSkip == null ? 1 : countToSkip); }

  getEndingElements (sourceArray, count) { 
    if (count == null) return sourceArray[sourceArray.length - 1];
    return this.getTrailingElements(sourceArray, Math.max(0, sourceArray.length - count)); 
  }

  locateInSortedArray (sourceArray, searchKey, accessorFunction) {
	const itemAccessor = (obj) => (typeof obj === 'object') ? obj[accessorFunction] : obj;
	const targetValue = itemAccessor(searchKey);
	let lowIndex = 0, highIndex = sourceArray.length;
	while (lowIndex < highIndex) {
	  let midIndex = Math.floor((lowIndex + highIndex) / 2);
	  if (itemAccessor(sourceArray[midIndex]) < targetValue) lowIndex = midIndex + 1; else highIndex = midIndex;
	}
	return lowIndex;
  }
}
const utils = new UtilityFunctions();

class MaxPriorityQueue {
  constructor() {
    this.heapStorage = [];
    this.currentSize = 0;
  }

  addWithPriority(priorityValue, actualValue) {
    const heap = this.heapStorage;
    heap.push({priorityValue: priorityValue, actualValue: actualValue});
    let currentIdx = this.currentSize;
    let parentIdx = Math.floor((currentIdx - 1) / 2);

    while (parentIdx >= 0 && heap[parentIdx].priorityValue < heap[currentIdx].priorityValue) {
      const tempSwap = heap[currentIdx];
      heap[currentIdx] = heap[parentIdx];
      heap[parentIdx] = tempSwap;
      currentIdx = parentIdx;
      parentIdx = Math.floor((currentIdx - 1) / 2);
    }
    this.currentSize++;
  }

  extractHighestPriority() {
    if (this.currentSize <= 0) {
      return null;
    }
    const highestPriorityElement = this.getHighestPriorityValue();
    
    this.currentSize--;
    const heap = this.heapStorage;
    const effectiveLength = this.currentSize;
    
    heap[0] = heap[effectiveLength];
    heap.pop();

    let currentIdx = 0;
    while (true) {
        let leftChildIdx = 2 * currentIdx + 1;
        let rightChildIdx = 2 * currentIdx + 2;
        let largestChildIdx = currentIdx;

        if (leftChildIdx < effectiveLength && heap[leftChildIdx].priorityValue > heap[largestChildIdx].priorityValue) {
            largestChildIdx = leftChildIdx;
        }
        if (rightChildIdx < effectiveLength && heap[rightChildIdx].priorityValue > heap[largestChildIdx].priorityValue) {
            largestChildIdx = rightChildIdx;
        }

        if (largestChildIdx !== currentIdx) {
            const tempSwap = heap[currentIdx];
            heap[currentIdx] = heap[largestChildIdx];
            heap[largestChildIdx] = tempSwap;
            currentIdx = largestChildIdx;
        } else {
            break;
        }
    }
    return highestPriorityElement;
  }

  getHighestPriorityValue() {
    if (this.currentSize === 0) return null;
    return this.heapStorage[0].actualValue;
  }

  getCurrentSize() {
    return this.currentSize;
  } 
}

const inputHandler = new InputReader();
(new SolutionProcessor()).processData();
