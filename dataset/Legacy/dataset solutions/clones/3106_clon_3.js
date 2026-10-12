'use strict';

class SolutionProcessor {
  execute() {
    const primeModulo = 1e9 + 7;
    const sequenceLength = parseInt(dataReader.fetchNextLine());
    const validBases = ['A', 'T', 'G', 'C'];

    const createForbiddenPatterns = () => {
      const patternStrings = ['.AGC', 'AG.C', 'A.GC', '.GAC', '.ACG'];
      return patternStrings.map((p) => new RegExp(p));
    };
    const forbiddenPatterns = createForbiddenPatterns();

    const memoTable = Array.from({ length: sequenceLength + 1 }, () => ({}));
    
    memoTable[0]['TTT'] = 1;

    for (let i = 1; i <= sequenceLength; ++i) {
      for (const currentBase of validBases) {
        for (const previousState in memoTable[i - 1]) {
          const previousStateCount = memoTable[i - 1][previousState];
          if (previousStateCount === undefined || previousStateCount === 0) {
            continue;
          }

          const combinedSequence = previousState + currentBase;
          const isForbidden = forbiddenPatterns.some((pattern) => pattern.test(combinedSequence));
          if (isForbidden) {
            continue;
          }

          const currentState = previousState.substring(1) + currentBase;
          
          memoTable[i][currentState] = (memoTable[i][currentState] || 0) + previousStateCount;
          memoTable[i][currentState] %= primeModulo;
        }
      }
    }

    const finalCounts = Object.values(memoTable[sequenceLength]);
    const totalValidSequences = finalCounts.reduce((accumulator, currentCount) => (accumulator + currentCount) % primeModulo, 0);
    
    console.log(totalValidSequences);
  }
}

class UtilityToolkit {
  sum(numbers) { 
    if (!numbers || numbers.length === 0) return 0;
    return numbers.reduce((a, b) => a + b); 
  }

  min(elements, comparisonFn) { 
    const compare = comparisonFn || ((a, b) => a - b);
    if (!elements || elements.length === 0) return undefined;
    return elements.reduce((a, b) => compare(a, b) < 0 ? a : b); 
  }

  max(elements, comparisonFn) { 
    const compare = comparisonFn || ((a, b) => a - b);
    if (!elements || elements.length === 0) return undefined;
    return elements.reduce((a, b) => compare(a, b) > 0 ? a : b); 
  }

  generateRange(startValue, stopValue, stepValue) {
    let actualStart = startValue;
    let actualStop = stopValue;
    let actualStep = stepValue;

    if (actualStop == null) {
      actualStop = actualStart || 0;
      actualStart = 0;
    }
    if (!actualStep) {
      actualStep = actualStop < actualStart ? -1 : 1;
    }

    const count = Math.max(Math.ceil((actualStop - actualStart) / actualStep), 0);
    
    return Array.from({ length: count }, (_, idx) => actualStart + (idx * actualStep));
  }

  getFirstElements(sourceArray, numElements) {
    if (!sourceArray || sourceArray.length < 1) return numElements == null ? undefined : [];
    if (numElements == null) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - numElements);
  }

  getInitialElements(sourceArray, numToExclude) { 
    const excludeCount = numToExclude == null ? 1 : numToExclude;
    return sourceArray.slice(0, Math.max(0, sourceArray.length - excludeCount)); 
  }

  getTailElements(sourceArray, numToSkip) { 
    const skipCount = numToSkip == null ? 1 : numToSkip;
    return sourceArray.slice(skipCount); 
  }

  getLastElements(sourceArray, numElements) { 
    if (numElements == null) return sourceArray[sourceArray.length - 1];
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - numElements)); 
  }

  calculateCumulativeSum(inputArray) { 
    if (!inputArray || inputArray.length === 0) return [];
    const cumulativeSums = [0];
    for (let i = 0; i < inputArray.length; i++) {
      cumulativeSums.push(cumulativeSums[i] + inputArray[i]);
    }
    return cumulativeSums.slice(1);
  }

  performBinarySearch(sortedArray, targetKey, propertyName) {
    const getComparableValue = (item) => (typeof item === 'object' && propertyName) ? item[propertyName] : item;
    const valueToFind = getComparableValue(targetKey);
    
    let lowIndex = 0;
    let highIndex = sortedArray.length;

    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getComparableValue(sortedArray[midIndex]) < valueToFind) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
const util = new UtilityToolkit();

class DataStream {
  constructor() {
    this.readPointer = 0;
    this.allLines = [];
    this.loadAllData();
  }

  loadAllData() {
    const fs = require("fs");
    this.allLines = fs.readFileSync("/dev/stdin", "utf8").split('\n');
    return this.allLines;
  }

  fetchNextLine(numLines = 1) {
    if (numLines > 1) {
      const linesToReturn = this.allLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return linesToReturn;
    }
    const singleLine = this.allLines[this.readPointer];
    this.readPointer++;
    return singleLine;
  }

  fetchStringArray() { 
    const line = this.fetchNextLine();
    return line.split(' '); 
  }

  fetchIntArray() { 
    const stringArray = this.fetchStringArray();
    return stringArray.map((element) => parseInt(element)); 
  }

  fetchFloatArray() { return this.fetchStringArray().map((element) => parseFloat(element)); }

  fetchIntLines(numLines) { 
    const lines = this.fetchNextLine(numLines);
    return lines.map((line) => parseInt(line)); 
  }

  fetchFloatLines(numLines) { 
    const lines = this.fetchNextLine(numLines);
    return lines.map((line) => parseFloat(line)); 
  }

  fetchStringMatrix(numLines) { 
    const lines = this.fetchNextLine(numLines);
    return lines.map((line) => line.split(' ')); 
  }

  fetchIntMatrix(numLines) {
    const lines = this.fetchNextLine(numLines);
    const stringMatrices = lines.map((line) => line.split(' '));
    return stringMatrices.map((row) => row.map((element) => parseInt(element)));
  }

  fetchFloatMatrix(numLines) {
    const lines = this.fetchNextLine(numLines);
    const stringMatrices = lines.map((line) => line.split(' '));
    return stringMatrices.map((row) => row.map((element) => parseFloat(element)));
  }
} 
const dataReader = new DataStream();
(new SolutionProcessor()).execute();
