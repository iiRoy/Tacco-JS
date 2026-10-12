'use strict'

class PrimaryProcessor {
  processSolution() {
    const configParams = dataSource.fetchIntegerArray();
    const unusedInputArray = dataSource.fetchIntegerArray(); // This variable is declared but not used.
    // The original code uses 's' which is not defined, leading to a ReferenceError.
    // This behavior must be preserved.
    const unassignedSequence = undefined; // Renamed 's' to 'unassignedSequence' to maintain the undefined state.
    return _utils.addElements(_utils.pairwiseDifference(unassignedSequence).map(element => Math.min(element * configParams[1], configParams[2])));
  }
}

class UtilityBelt {
  // Calculates the sum of all numbers in an array.
  addElements(collection) { return collection.reduce((valA, valB) => valA + valB); }

  // Finds the minimum element in an array.
  findMinimum(collection, comparisonFn) {
    if (comparisonFn == null) { comparisonFn = (valA, valB) => valA - valB; }
    return collection.reduce((valA, valB) => comparisonFn(valA, valB) < 0 ? valA : valB);
  }

  // Finds the maximum element in an array.
  findMaximum(collection, comparisonFn) {
    if (comparisonFn == null) { comparisonFn = (valA, valB) => valA - valB; }
    return collection.reduce((valA, valB) => comparisonFn(valA, valB) > 0 ? valA : valB);
  }

  // Sorts an array.
  arrangeElements(collection, comparisonFn) {
    if (comparisonFn == null) { comparisonFn = (valA, valB) => valA - valB; }
    return collection.sort(comparisonFn);
  }

  // Generates a sequence of numbers.
  generateSequence(begin, end, increment) {
    if (end == null) { end = begin || 0; begin = 0; }
    if (!increment) { increment = end < begin ? -1 : 1; }
    const count = Math.max(Math.ceil((end - begin) / increment), 0);
    const generatedRange = Array(count);
    for (var index = 0; index < count; index++, begin += increment) { generatedRange[index] = begin; }
    return generatedRange;
  }

  // Gets the first element(s) of an array.
  getHead(dataCollection, numElements) {
    if (dataCollection == null || dataCollection.length < 1) return numElements == null ? undefined : [];
    if (numElements == null) return dataCollection[0];
    return this.getInitialSegment(dataCollection, dataCollection.length - numElements);
  }

  // Gets all but the last N elements of an array.
  getInitialSegment(dataCollection, numElements) { return dataCollection.slice.call(dataCollection, 0, Math.max(0, dataCollection.length - (numElements == null ? 1 : numElements))); }

  // Gets all but the first N elements of an array.
  getTailSegment(dataCollection, numElements) { return dataCollection.slice.call(dataCollection, numElements == null ? 1 : numElements); }

  // Gets the last element(s) of an array.
  getRear(dataCollection, numElements) {
    if (numElements == null) return dataCollection[dataCollection.length - 1];
    return this.getTailSegment(dataCollection, Math.max(0, dataCollection.length - numElements));
  }

  // Calculates the cumulative sum of an array.
  cumulativeSum(collection) { return this.getTailSegment(collection.reduce(((valA, valB, loopIndex) => { valA.push(valB + valA[loopIndex]); return valA; }), [0])); }

  // Calculates the difference between adjacent elements in an array.
  pairwiseDifference(collection) {
    const diffs = [];
    for (let loopIndex = 1; loopIndex < collection.length; ++loopIndex) { diffs.push(collection[loopIndex] - collection[loopIndex - 1]); }
    return diffs;
  }

  // Performs a binary search on a sorted array.
  locateElement(dataCollection, searchKey, propertyAccessor) {
    const accessorFunc = (itemObject) => (typeof itemObject === 'object') ? itemObject[propertyAccessor] : itemObject;
    const targetValue = accessorFunc(searchKey);
    let lowerBound = 0, upperBound = dataCollection.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessorFunc(dataCollection[middleIndex]) < targetValue) lowerBound = middleIndex + 1; else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
const _utils = new UtilityBelt();

class DataFeeder {
  constructor() {
    this.currentPosition = 0;
    this.readAllInput();
  }

  // Reads all input from stdin.
  readAllInput() {
    this.rawData = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawData;
  }

  // Fetches N lines or a single line of input.
  fetchLine(numLines) {
    if (numLines) {
      const resultValue = this.rawData.slice(this.currentPosition, this.currentPosition + numLines);
      this.currentPosition += numLines;
      return resultValue;
    }
    return this.rawData[this.currentPosition++];
  }

  // Fetches a single integer.
  fetchInteger() { return parseInt(this.fetchLine()); }

  // Fetches a line as an array of strings.
  fetchStringArray() { return this.fetchLine().split(' '); }

  // Fetches a line as an array of integers.
  fetchIntegerArray() { return this.fetchStringArray().map((element) => parseInt(element)); }

  // Fetches a line as an array of floating-point numbers.
  fetchFloatArray() { return this.fetchStringArray().map((element) => parseFloat(element)); }

  // Fetches N lines as an array of integers.
  fetchIntegerLines(numLines) { return this.fetchLine(numLines).map((element) => parseInt(element)); }

  // Fetches N lines as an array of floating-point numbers.
  fetchFloatLines(numLines) { return this.fetchLine(numLines).map((element) => parseFloat(element)); }

  // Fetches N lines as a 2D array of strings.
  fetchStringMatrix(numLines) { return this.fetchLine(numLines).map((currentLine) => currentLine.split(' ')); }

  // Fetches N lines as a 2D array of integers.
  fetchIntegerMatrix(numLines) {
    return this.fetchLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }

  // Fetches N lines as a 2D array of floating-point numbers.
  fetchFloatMatrix(numLines) {
    return this.fetchLine(numLines).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}
const dataSource = new DataFeeder();

const DisplayResult = (outputData) => {
  let resultValue;
  if (outputData == null) return;
  if (outputData === true) { resultValue = 'Yes'; }
  else if (outputData === false) { resultValue = 'No'; }
  else { resultValue = outputData; }
  console.log(resultValue);
}

DisplayResult(new PrimaryProcessor().processSolution());
