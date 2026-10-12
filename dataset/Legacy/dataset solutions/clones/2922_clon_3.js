'use strict'

class SolutionProcessor {
  execute() {
    const inputSize = inputReader.readNextInt();
    const sequenceValues = inputReader.readNextIntArray();

    const getSymmetricIndex = (idx, totalLen) => Math.min(idx, totalLen - 1 - idx);

    const symmetricalSumsLength = sequenceValues.length >> 1;
    const symmetricalSums = new Array(symmetricalSumsLength).fill(0);

    for (let i = 0; i < inputSize; ++i) {
      const targetIndex = getSymmetricIndex(i, sequenceValues.length);
      symmetricalSums[targetIndex] += sequenceValues[i];
    }

    let maximumSubarraySum = 0;

    const calculateMaxSegmentSum = (dataArray, step) => {
      let currentMax = 0;
      let currentSum = 0;
      for (let innerIdx = 0; innerIdx < dataArray.length; innerIdx += step) {
        currentSum += dataArray[innerIdx];
        currentMax = Math.max(currentMax, currentSum);
      }
      return currentMax;
    };

    const halfInputSize = Math.floor(inputSize / 2);
    for (let outerLoopIndex = 0; outerLoopIndex < halfInputSize; ++outerLoopIndex) {
      if (outerLoopIndex < 2) {
        continue;
      }
      for (let stepValue = 1; stepValue < outerLoopIndex; ++stepValue) {
        const segmentMax = calculateMaxSegmentSum(symmetricalSums, stepValue);
        maximumSubarraySum = Math.max(maximumSubarraySum, segmentMax);
      }
    }
    return maximumSubarraySum;
  }
}

class ModularArithmetic {
  constructor(modulusValue) {
    if (modulusValue == null) { modulusValue = Combinatorics.DefaultMod; }
    this.mod = modulusValue;
  }
  multiply(valA, valB) {
    let result = 0;
    valA %= this.mod;
    valB %= this.mod;
    while (valB) {
      if (valB & 1) {
        result += valA;
        if (result > this.mod) { result -= this.mod; }
      }
      valA <<= 1;
      if (valA > this.mod) { valA -= this.mod; }
      valB >>= 1;
    }
    return result;
  }
  power(base, exponent) {
    let result = 1;
    while(exponent) {
      if (exponent & 1) { result = this.multiply(result, base); }
      base = this.multiply(base, base);
      exponent >>= 1;
    }
    return result;
  }
  divide(numerator, denominator) { return this.multiply(numerator, this.power(denominator, this.mod - 2)) }
  combinations(n, k) { return MOD_CALCULATOR.multiply(factTable[n], MOD_CALCULATOR.multiply(invFactTable[k], invFactTable[n-k])); }
}
const MOD_CALCULATOR = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  calculateSum(arrayData) { return arrayData.reduce((accumulator, currentValue) => accumulator + currentValue); }
  calculateModSum(arrayData, modulusValue) { if (modulusValue == null) { modulusValue = MOD_CALCULATOR.mod; } return arrayData.reduce((accumulator, currentValue) => (accumulator + currentValue) % modulusValue); }
  findMin(arrayData, comparisonFunc) { if (comparisonFunc == null) {comparisonFunc = (a,b) => a - b} return arrayData.reduce((a,b) => comparisonFunc(a,b) < 0 ? a : b); }
  findMax(arrayData, comparisonFunc) { if (comparisonFunc == null) {comparisonFunc = (a,b) => a - b} return arrayData.reduce((a,b) => comparisonFunc(a,b) > 0 ? a : b); }
  sortArray(arrayData, comparisonFunc) { if (comparisonFunc == null) {comparisonFunc = (a,b) => a - b} return arrayData.sort(comparisonFunc) }
  uniqueElements(arrayData) {
    arrayData.sort((a, b) => a - b);
    const uniqueList = [];
    if (arrayData.length > 0) {
      uniqueList.push(arrayData[0]);
      for (let i = 1; i < arrayData.length; ++i) {
        if (arrayData[i] !== arrayData[i-1]) {
          uniqueList.push(arrayData[i]);
        }
      }
    }
    return uniqueList;
  }
  generateRange(startValue, stopValue, stepValue) {
    if (stopValue == null) { stopValue = startValue || 0; startValue = 0; }
    if (!stepValue) { stepValue = stopValue < startValue ? -1 : 1; }
    const length = Math.max(Math.ceil((stopValue - startValue) / stepValue), 0);
    const rangeArray = Array(length);
    for (var idx = 0; idx < length; idx++, startValue += stepValue) { rangeArray[idx] = startValue; }
    return rangeArray;
  }
  getFirstElements (arrayData, count) {
    if (arrayData == null || arrayData.length < 1) return count == null ? void 0 : [];
    if (count == null) return arrayData[0];
    return this.getInitialElements(arrayData, arrayData.length - count);
  };
  getInitialElements (arrayData, count) { return arrayData.slice(0, Math.max(0, arrayData.length - (count == null ? 1 : count))); }
  getTailElements(arrayData, count) { return arrayData.slice(count == null ? 1 : count); }
  getLastElements (arrayData, count) { if (count == null) return arrayData[arrayData.length - 1]; return this.getTailElements(arrayData, Math.max(0, arrayData.length - count)); }
  calculatePrefixSums (arrayData) {
    if (!arrayData || arrayData.length === 0) return [];
    const prefixSums = [];
    let currentSum = 0;
    for (let i = 0; i < arrayData.length; i++) {
      currentSum += arrayData[i];
      prefixSums.push(currentSum);
    }
    return prefixSums;
  }
  calculateDifferences (arrayData) { const diffs = []; for (let i = 1; i < arrayData.length; ++i) { diffs.push(arrayData[i] - arrayData[i-1]); } return diffs; }
  performBinarySearch (arrayData, searchKey, iterateeProperty) {
    const getIteratedValue = (obj) => (typeof obj === 'object') ? obj[iterateeProperty] : obj;
    const valueToSearch = getIteratedValue(searchKey);
    let lowIndex = 0, highIndex = arrayData.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getIteratedValue(arrayData[midIndex]) < valueToSearch) lowIndex = midIndex + 1; else highIndex = midIndex;
    }
    return lowIndex;
  };
}
const _utils = new UtilityFunctions();

class InputHandler {
  constructor() {
    this.readCursor = 0;
    this.readAllInput();
  }

  readAllInput() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  getNextLines(count) {
    if (count) {
      const lines = this.inputLines.slice(this.readCursor, this.readCursor + count);
      this.readCursor += count;
      return lines;
    }
    return this.inputLines[this.readCursor++];
  }

  readNextInt() { return Number(this.getNextLines()); }
  _parseLineOfNumbers(line, parser) {
    return line.split(' ').map(parser);
  }
  readNextStrArray() { return this.getNextLines().split(' '); }
  readNextIntArray() { return this._parseLineOfNumbers(this.getNextLines(), Number); }
  readNextFloatArray() { return this._parseLineOfNumbers(this.getNextLines(), parseFloat); }
  readIntLines(count) { return this.getNextLines(count).map((line) => Number(line)) }
  readFloatLines(count) { return this.getNextLines(count).map((line) => parseFloat(line)) }
  readStrMatrix(count) { return this.getNextLines(count).map((line) => line.split(' ')); }
  readIntMatrix(count) {
    return this.getNextLines(count).map((line) => this._parseLineOfNumbers(line, Number));
  }
  readFloatMatrix(count) {
    return this.getNextLines(count).map((line) => this._parseLineOfNumbers(line, parseFloat));
  }
}
const inputReader = new InputHandler();

class OutputWriter {
  constructor() {
    this.booleanOutputOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  printOutput(outputValue){
    if (outputValue == null) return;
    const finalOutput = (outputValue === true)
      ? this.booleanOutputOptions['true']
      : (outputValue === false)
        ? this.booleanOutputOptions['false']
        : String(outputValue);
    console.log(finalOutput);
  }
  setBooleanOutput(options) {
    this.booleanOutputOptions['false'] = options[0];
    this.booleanOutputOptions['true'] = options[1];
    return this;
  }
}
const outputHandler = new OutputWriter();

outputHandler.printOutput(new SolutionProcessor().execute());
