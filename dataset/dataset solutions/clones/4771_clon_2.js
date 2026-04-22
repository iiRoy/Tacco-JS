'use strict'
class PrimaryTask {
  executeOperation() {
    const initialValues = dataFeeder.retrieveIntegerVector();
    const dataPoints = dataFeeder.retrieveIntegerVector();
    return _util.aggregate(
      _util.calculateDifferences(dataPoints)
      .map(elementVal => Math.min(elementVal * initialValues[1], initialValues[2]))
    );
  }
}
class UtilityToolkit {
  aggregate(dataList) {
    return dataList.reduce((accumulator, currentVal) => accumulator + currentVal);
  }
  findMinimum(dataList, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (firstVal, secondVal) => firstVal - secondVal
    }
    return dataList.reduce((currentMin, currentVal) => comparisonFn(currentMin, currentVal) < 0 ? currentMin : currentVal);
  }
  findMaximum(dataList, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (firstVal, secondVal) => firstVal - secondVal
    }
    return dataList.reduce((currentMax, currentVal) => comparisonFn(currentMax, currentVal) > 0 ? currentMax : currentVal);
  }
  orderElements(dataList, sortFn) {
    if (sortFn == null) {
      sortFn = (valA, valB) => valA - valB
    }
    return dataList.sort(sortFn)
  }
  generateSequence(begin, end, stride) {
    if (end == null) {
      end = begin || 0;
      begin = 0;
    }
    if (!stride) {
      stride = end < begin ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((end - begin) / stride), 0);
    const generatedSequence = Array(sequenceLength);
    for (var indexCounter = 0; indexCounter < sequenceLength; indexCounter++, begin += stride) {
      generatedSequence[indexCounter] = begin;
    }
    return generatedSequence;
  }
  getLeadingElements(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - count);
  }
  getInitialElements(sourceArray, count) {
    return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (count == null ? 1 : count)));
  }
  getTrailingElements(sourceArray, count) {
    return sourceArray.slice.call(sourceArray, count == null ? 1 : count);
  }
  getFinalElements(sourceArray, count) {
    if (count == null) return sourceArray[sourceArray.length - 1];
    return this.getTrailingElements(sourceArray, Math.max(0, sourceArray.length - count));
  }
  computeCumulativeSum(inputArray) {
    return this.getTrailingElements(inputArray.reduce(((accumulated, currentElement, currentIndex) => {
      accumulated.push(currentElement + accumulated[currentIndex]);
      return accumulated
    }), [0]));
  }
  calculateDifferences(inputArray) {
    const differenceList = [];
    for (let idxIterator = 1; idxIterator < inputArray.length; ++idxIterator) {
      differenceList.push(inputArray[idxIterator] - inputArray[idxIterator - 1]);
    }
    return differenceList;
  }
  performBinarySearch(sortedList, targetKey, accessorFn) {
    const itemAccessor = (currentItem) => (typeof currentItem === 'object') ? currentItem[accessorFn] : currentItem;
    const targetValue = itemAccessor(targetKey);
    let lowerBound = 0,
      upperBound = sortedList.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (itemAccessor(sortedList[middleIndex]) < targetValue) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
const _util = new UtilityToolkit();
class DataFeeder {
  constructor() {
    this.readPointer = 0;
    this.loadAllData();
  }
  loadAllData() {
    this.loadedLines = (require("node:fs").readFileSync("/dev/fd/0", "utf8")).split('\n');
    return this.loadedLines;
  }
  fetchNextLine(numLines) {
    if (numLines) {
      const resultLines = this.loadedLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return resultLines;
    }
    return this.loadedLines[this.readPointer++];
  }
  retrieveNextInteger() {
    return Number.parseInt(this.fetchNextLine());
  }
  retrieveStringVector() {
    return this.fetchNextLine().split(' ');
  }
  retrieveIntegerVector() {
    return this.retrieveStringVector().map((elementString) => Number.parseInt(elementString));
  }
  retrieveFloatVector() {
    return this.retrieveStringVector().map((elementString) => Number.parseFloat(elementString));
  }
  retrieveIntegerLines(numLines) {
    return this.fetchNextLine(numLines).map((lineContent) => Number.parseInt(lineContent))
  }
  retrieveFloatLines(numLines) {
    return this.fetchNextLine(numLines).map((lineContent) => Number.parseFloat(lineContent))
  }
  retrieveStringMatrix(numRows) {
    return this.fetchNextLine(numRows).map((currentLine) => currentLine.split(' '));
  }
  retrieveIntegerMatrix(numRows) {
    return this.fetchNextLine(numRows).map((currentLine) => currentLine.split(' ').map((elementString) => Number.parseInt(elementString)));
  }
  retrieveFloatMatrix(numRows) {
    return this.fetchNextLine(numRows).map((currentLine) => currentLine.split(' ').map((elementString) => Number.parseFloat(elementString)));
  }
}
const dataFeeder = new DataFeeder();
const DisplayResult = (finalOutput) => {
  let displayValue;
  if (finalOutput == null) return;
  if (finalOutput === true) {
    displayValue = 'Yes';
  } else if (finalOutput === false) {
    displayValue = 'No';
  } else {
    displayValue = finalOutput;
  }
  console.log(displayValue);
}
DisplayResult(new PrimaryTask().executeOperation());