'use strict'

class ProblemSolver {
  computeResult() {
    const itemCount = dataFeeder.fetchInteger();
    const dataPoints = dataFeeder.fetchIntegerMatrix(itemCount);

    let totalSumOfFirstElements = 0;
    let minimumSecondElementForGreaterFirst = Infinity;
    let allPairsHaveEqualElements = true;

    for (let i = 0; i < itemCount; i++) {
      const currentPair = dataPoints[i];
      const firstValue = currentPair[0];
      const secondValue = currentPair[1];

      totalSumOfFirstElements += firstValue;

      if (firstValue !== secondValue) {
        allPairsHaveEqualElements = false;
      }

      if (firstValue > secondValue) {
        if (secondValue < minimumSecondElementForGreaterFirst) {
          minimumSecondElementForGreaterFirst = secondValue;
        }
      }
    }

    if (allPairsHaveEqualElements) {
      return 0;
    }

    const valueToSubtract = (minimumSecondElementForGreaterFirst === Infinity) ? 0 : minimumSecondElementForGreaterFirst;

    return totalSumOfFirstElements - valueToSubtract;
  }
}

class ModularArithmetic {
  constructor(moduloBaseValue) {
    this.moduloBase = moduloBaseValue;
  }

  multiplyMod(factorA, factorB) {
    let productAccumulator = 0;
    factorA %= this.moduloBase;
    factorB %= this.moduloBase;
    
    while (factorB > 0) {
      if ((factorB % 2) === 1) {
        productAccumulator = (productAccumulator + factorA);
        if (productAccumulator >= this.moduloBase) { productAccumulator -= this.moduloBase; }
      }
      factorA = (factorA * 2);
      if (factorA >= this.moduloBase) { factorA -= this.moduloBase; }
      factorB = Math.floor(factorB / 2);
    }
    return productAccumulator;
  }

  powerMod(baseVal, exponentVal) {
    let resultVal = 1;
    while(exponentVal > 0) {
      if ((exponentVal % 2) === 1) { resultVal = this.multiplyMod(resultVal, baseVal); }
      baseVal = this.multiplyMod(baseVal, baseVal);
      exponentVal = Math.floor(exponentVal / 2);
    }
    return resultVal;
  }

  divideMod(numerator, denominator) { return this.multiplyMod(numerator, this.powerMod(denominator, this.moduloBase - 2)) }
}
const MOD_CALCULATOR = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  sumElements(collection) { 
    let total = 0;
    for (const item of collection) {
      total += item;
    }
    return total;
  }
  
  sumModulo(collection, modulus) { 
    if (modulus == null) { modulus = MOD_CALCULATOR.moduloBase; } 
    let total = 0;
    for (const item of collection) {
      total = (total + item) % modulus;
    }
    return total;
  }

  findMinimum(collection, comparisonFn) { 
    if (collection.length === 0) return undefined;
    if (comparisonFn == null) { comparisonFn = (a,b) => a - b; } 
    let currentMin = collection[0];
    for (let i = 1; i < collection.length; i++) {
      if (comparisonFn(currentMin, collection[i]) > 0) {
        currentMin = collection[i];
      }
    }
    return currentMin;
  }

  findMaximum(collection, comparisonFn) { 
    if (collection.length === 0) return undefined;
    if (comparisonFn == null) { comparisonFn = (a,b) => a - b; } 
    let currentMax = collection[0];
    for (let i = 1; i < collection.length; i++) {
      if (comparisonFn(currentMax, collection[i]) < 0) {
        currentMax = collection[i];
      }
    }
    return currentMax;
  }

  sortCollection(collection, comparisonFn) { 
    if (comparisonFn == null) { comparisonFn = (a,b) => a - b; } 
    return collection.sort(comparisonFn); 
  }

  getUniqueElements(collection) { 
    return Array.from(new Set(collection));
  }

  generateRange(startValue, stopValue, stepSize) {
    if (stopValue == null) { stopValue = startValue || 0; startValue = 0; }
    if (!stepSize) { stepSize = stopValue < startValue ? -1 : 1; }
    
    const length = Math.max(Math.ceil((stopValue - startValue) / stepSize), 0);
    return Array.from({ length }, (_, index) => startValue + index * stepSize);
  }

  retrieveFirst (collection, numElements) {
    if (collection == null || collection.length < 1) return numElements == null ? undefined : [];
    return collection.slice(0, numElements == null ? 1 : numElements);
  };

  retrieveInitial (collection, numToExclude) { 
    return collection.slice(0, Math.max(0, collection.length - (numToExclude == null ? 1 : numToExclude))); 
  }

  retrieveTail(collection, numToSkip) { 
    return collection.slice(numToSkip == null ? 1 : numToSkip); 
  }

  retrieveLast (collection, numElements) { 
    if (numElements == null) return collection[collection.length - 1]; 
    return collection.slice(Math.max(0, collection.length - numElements)); 
  }

  calculateCumulativeSums (sourceArray) { 
    const cumulativeResults = [];
    let currentSum = 0;
    for (let i = 0; i < sourceArray.length; i++) {
      currentSum += sourceArray[i];
      cumulativeResults.push(currentSum);
    }
    return cumulativeResults;
  }

  calculateDifferences (sourceArray) { 
    const diffs = []; 
    for (let i = 1; i < sourceArray.length; ++i) { 
      diffs.push(sourceArray[i] - sourceArray[i-1]); 
    } 
    return diffs; 
  }

  findInsertionPoint (sortedArray, searchKey, accessorProperty) {
    const getComparableValue = (obj) => (typeof obj === 'object' && accessorProperty) ? obj[accessorProperty] : obj;
    const targetValue = getComparableValue(searchKey);
    let lowIndex = 0, highIndex = sortedArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getComparableValue(sortedArray[midIndex]) < targetValue) lowIndex = midIndex + 1; else highIndex = midIndex;
    }
    return lowIndex;
  };
}
const utilityBelt = new UtilityFunctions();

class DataFeeder {
  constructor() {
    this.readPointer = 0;
    this.loadAllData();
  }

  loadAllData() {
    this.rawLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawLines;
  }

  retrieveLine(numLines) {
    if (numLines) {
      const segment = this.rawLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return segment;
    }
    return this.rawLines[this.readPointer++];
  }

  fetchInteger() { return Number(this.retrieveLine()); } 
  fetchStringArray() { return this.retrieveLine().split(' '); } 
  fetchIntegerArray() { return this.fetchStringArray().map((element) => Number(element)); }
  fetchFloatArray() { return this.fetchStringArray().map((element) => parseFloat(element)); }
  fetchIntegerLines(numLines) { return this.retrieveLine(numLines).map((element) => Number(element)) }
  fetchFloatLines(numLines) { return this.retrieveLine(numLines).map((element) => parseFloat(element)) }
  fetchStringMatrix(numLines) { return this.retrieveLine(numLines).map((lineContent) => lineContent.split(' ')); }
  fetchIntegerMatrix(numLines) {
    return this.retrieveLine(numLines).map((lineContent) => lineContent.split(' ').map((element) => Number(element)));
  }
  fetchFloatMatrix(numLines) {
    return this.retrieveLine(numLines).map((lineContent) => lineContent.split(' ').map((element) => parseFloat(element)));
  }
} 
const dataFeeder = new DataFeeder();

class OutputHandler {
  constructor() {
    this.booleanMap = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  displayResult(valueToDisplay){
    let finalOutput;
    if (valueToDisplay == null) return;
    if (valueToDisplay === true) { finalOutput = this.booleanMap['true']; }
    else if (valueToDisplay === false) { finalOutput = this.booleanMap['false']; }
    else { finalOutput = valueToDisplay; }
    console.log(finalOutput);
  }
  configureBooleanOutput(options) {
    this.booleanMap['false'] = options[0];
    this.booleanMap['true'] = options[1];
    return this;
  }
}
const outputHandler = new OutputHandler();

outputHandler.displayResult(new ProblemSolver().computeResult());
