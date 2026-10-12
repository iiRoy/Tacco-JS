'use strict'

class Solver {
  computeResult() {
    const countElements = dataInput.fetchInt();
    const charSequence = dataInput.fetchLine();

    let firstHashIndex = -1;
    for (let i = 0; i < countElements; ++i) {
      if (charSequence[i] === '#') {
        firstHashIndex = i;
        break;
      }
    }

    if (firstHashIndex === -1) {
      return 0;
    }

    let lastHashIndex = -1;
    for (let i = countElements - 1; i >= 0; --i) {
      if (charSequence[i] === '#') {
        lastHashIndex = i;
        break;
      }
    }

    const relevantSegment = charSequence.substring(firstHashIndex, lastHashIndex + 1);

    let totalBlackCount = 0;
    let totalWhiteCount = 0;
    for (let i = 0; i < relevantSegment.length; ++i) {
      if (relevantSegment[i] === '#') {
        totalBlackCount++;
      } else {
        totalWhiteCount++;
      }
    }

    let minimumOperationCount = totalWhiteCount;

    let currentPrefixWhiteCount = 0;
    let currentPrefixBlackCount = 0;

    for (let k = 0; k < relevantSegment.length; ++k) {
      if (relevantSegment[k] === '#') {
        currentPrefixBlackCount++;
      } else {
        currentPrefixWhiteCount++;
      }

      const currentOperationCost = currentPrefixWhiteCount + (totalBlackCount - currentPrefixBlackCount);
      minimumOperationCount = Math.min(minimumOperationCount, currentOperationCost);
    }

    return minimumOperationCount;
  }
}

class ModularArithmetic {
  constructor(modulusValue) {
    if (modulusValue == null) { modulusValue = Combinatorics.DefaultMod; }
    this.modulus = modulusValue;
  }
  multiplyMod(valA, valB) {
    let result = 0;
    valA %= this.modulus;
    valB %= this.modulus;
    while (valB) {
      if (valB & 1) {
        result += valA;
        if (result > this.modulus) { result -= this.modulus; }
      }
      valA <<= 1;
      if (valA > this.modulus) { valA -= this.modulus; }
      valB >>= 1;
    }
    return result;
  }
  powerMod(base, exponent) {
    let result = 1;
    while(exponent) {
      if (exponent & 1) { result = this.multiplyMod(result, base); }
      base = this.multiplyMod(base, base);
      exponent >>= 1;
    }
    return result;
  }
  divideMod(numerator, denominator) { return this.multiplyMod(numerator, this.powerMod(denominator, this.modulus - 2)) }
  combinationsMod(nVal, kVal) { return MOD_CALCULATOR.multiplyMod(factTable[nVal], MOD_CALCULATOR.multiplyMod(invFactTable[kVal], invFactTable[nVal - kVal])); }
}
const MOD_CALCULATOR = new ModularArithmetic(998244353);

class UtilityFunctions {
  calculateSum(arrayData) { return arrayData.reduce((acc, val) => acc + val); }
  calculateModSum(arrayData, modulusValue) { if (modulusValue == null) { modulusValue = MOD_CALCULATOR.modulus; } return arrayData.reduce((acc, val) => (acc + val) % modulusValue); }
  findMinimum(arrayData, comparisonFunc) { if (comparisonFunc == null) {comparisonFunc = (a,b) => a - b} return arrayData.reduce((minVal, currentVal) => comparisonFunc(minVal, currentVal) < 0 ? minVal : currentVal); }
  findMaximum(arrayData, comparisonFunc) { if (comparisonFunc == null) {comparisonFunc = (a,b) => a - b} return arrayData.reduce((maxVal, currentVal) => comparisonFunc(maxVal, currentVal) > 0 ? maxVal : currentVal); }
  sortArray(arrayData, comparisonFunc) { if (comparisonFunc == null) {comparisonFunc = (a,b) => a - b} return arrayData.sort(comparisonFunc) }
  getUniqueElements(arrayData) { 
    arrayData.sort();
    for(let i = 0; i < arrayData.length - 1; ++i) { 
      arrayData[i] = arrayData[i+1] == arrayData[i] ? null : arrayData[i]; 
    }
    return arrayData.filter(e => e != null);
  }
  generateRange(startVal, stopVal, stepVal) {
    if (stopVal == null) { stopVal = startVal || 0; startVal = 0; }
    if (!stepVal) { stepVal = stopVal < startVal ? -1 : 1; }
    const length = Math.max(Math.ceil((stopVal - startVal) / stepVal), 0);
    const rangeArray = Array(length);
    for (var idx = 0; idx < length; idx++, startVal += stepVal) { rangeArray[idx] = startVal; }
    return rangeArray;
  }
  getFirstElements (arrayData, numElements) {
    if (arrayData == null || arrayData.length < 1) return numElements == null ? void 0 : [];
    if (numElements == null) return arrayData[0];
    return this.getInitialElements(arrayData, arrayData.length - numElements);
  };
  getInitialElements (arrayData, numElements) { return arrayData.slice.call(arrayData, 0, Math.max(0, arrayData.length - (numElements == null ? 1 : numElements))); }
  getTailElements(arrayData, numElements) { return arrayData.slice.call(arrayData, numElements == null ? 1 : numElements); }
  getLastElements (arrayData, numElements) { if (numElements == null) return arrayData[arrayData.length - 1]; return this.getTailElements(arrayData, Math.max(0, arrayData.length - numElements)); }
  getPrefixSums (arrayData) { return this.getTailElements(arrayData.reduce(((accumulator, currentVal, index) => {accumulator.push(currentVal + accumulator[index]); return accumulator}), [0])); }
  getDifferenceArray (arrayData) { const differences = []; for (let i = 1; i < arrayData.length; ++i) { differences.push(arrayData[i] - arrayData[i-1]); } return differences; }
  performBinarySearch (arrayData, searchKey, iterateeFunc) {
    const iterator = (obj) => (typeof obj === 'object') ? obj[iterateeFunc] : obj;
    const valueToSearch = iterator(searchKey);
    let lowIndex = 0, highIndex = arrayData.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (iterator(arrayData[midIndex]) < valueToSearch) lowIndex = midIndex + 1; else highIndex = midIndex;
    }
    return lowIndex;
  };
}
const _util = new UtilityFunctions();

class DataStream {
  constructor() {
    this.readPointer = 0;
    this.loadAllData();
  }

  loadAllData() {
    this.rawData = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawData;
  }

  fetchLine(numLines) {
    if (numLines) {
      const retrievedLines = this.rawData.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return retrievedLines;
    }
    return this.rawData[this.readPointer++];
  }
  fetchInt() { return parseInt(this.fetchLine()); } 
  fetchStringArray() { return this.fetchLine().split(' '); } 
  fetchIntArray() { return this.fetchStringArray().map((element) => parseInt(element)); }
  fetchFloatArray() { return this.fetchStringArray().map((element) => parseFloat(element)); }
  fetchIntLines(numLines) { return this.fetchLine(numLines).map((element) => parseInt(element)) }
  fetchFloatLines(numLines) { return this.fetchLine(numLines).map((element) => parseFloat(element)) }
  fetchStringMatrix(numLines) { return this.fetchLine(numLines).map((lineContent) => lineContent.split(' ')); }
  fetchIntMatrix(numLines) {
    return this.fetchLine(numLines).map((lineContent) => lineContent.split(' ').map((element) => parseInt(element)));
  }
  fetchFloatMatrix(numLines) {
    return this.fetchLine(numLines).map((lineContent) => lineContent.split(' ').map((element) => parseFloat(element)));
  }
} 
const dataInput = new DataStream();

class OutputHandler {
  constructor() {
    this.booleanOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  displayResult(outputValue){
    let finalOutput;
    if (outputValue == null) return;
    if (outputValue === true) { finalOutput = this.booleanOptions['true']; }
    else if (outputValue === false) { finalOutput = this.booleanOptions['false']; }
    else { finalOutput = outputValue; }
    console.log(finalOutput);
  }
  configureBooleanOutput(optionsArray) {
    this.booleanOptions['false'] = optionsArray[0];
    this.booleanOptions['true'] = optionsArray[1];
    return this;
  }
}
const resultOutput = new OutputHandler();

resultOutput.displayResult(new Solver().computeResult());
