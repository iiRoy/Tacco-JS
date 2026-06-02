'use strict'

class ProblemSolver {
  execute() {
    const countOfPairs = DATA_READER.fetchNextInteger();
    let totalSumOfFirstElements = 0;
    let minimumSecondElementForFirstLarger = Number.MAX_SAFE_INTEGER;
    let allElementsIdentical = true;

    for (let i = 0; i < countOfPairs; ++i) {
      const currentLine = DATA_READER.obtainNextLine();
      const parts = currentLine.split(' ');
      const valA = parseInt(parts[0], 10);
      const valB = parseInt(parts[1], 10);

      totalSumOfFirstElements += valA;

      if (valA > valB) {
        if (valB < minimumSecondElementForFirstLarger) {
          minimumSecondElementForFirstLarger = valB;
        }
      }

      if (valA !== valB) {
        allElementsIdentical = false;
      }
    }

    if (allElementsIdentical) {
      return 0;
    }

    if (minimumSecondElementForFirstLarger === Number.MAX_SAFE_INTEGER) {
      return 0;
    }

    return totalSumOfFirstElements - minimumSecondElementForFirstLarger;
  }
}

class ModularArithmetic {
  constructor(modValue) {
    if (modValue == null) { modValue = 1e9 + 7; } // Assuming default mod if Combinatorics.DefaultMod is not defined
    this.modulusValue = modValue;
  }
  multiplyModulo(factorA, factorB) {
    return Number((BigInt(factorA) * BigInt(factorB)) % BigInt(this.modulusValue));
  }
  powerModulo(baseVal, exponentVal) {
    if (exponentVal === 0) {
      return 1;
    }
    const halfPower = this.powerModulo(baseVal, Math.floor(exponentVal / 2));
    let result = this.multiplyModulo(halfPower, halfPower);
    if (exponentVal % 2 === 1) {
      result = this.multiplyModulo(result, baseVal);
    }
    return result;
  }
  divideModulo(numerator, denominator) { return this.multiplyModulo(numerator, this.powerModulo(denominator, this.modulusValue - 2)) }
  combinationsModulo(nVal, kVal) { return MOD_CALCULATOR.multiplyModulo(factTable[nVal], MOD_CALCULATOR.multiplyModulo(invFactTable[kVal], invFactTable[nVal - kVal])); }
}
const MOD_CALCULATOR = new ModularArithmetic(1e9 + 7);

class CollectionUtilities {
  calculateSum(numericArray) {
    let total = 0;
    for (const element of numericArray) {
      total += element;
    }
    return total;
  }
  calculateModularSum(numericArray, modulus) {
    if (modulus == null) { modulus = MOD_CALCULATOR.modulusValue; }
    let total = 0;
    for (const element of numericArray) {
      total = (total + element) % modulus;
    }
    return total;
  }
  findMinimum(dataArray, comparisonFunction) {
    if (dataArray.length === 0) return undefined;
    if (comparisonFunction == null) { comparisonFunction = (a, b) => a - b; }
    let currentMin = dataArray[0];
    for (let i = 1; i < dataArray.length; ++i) {
      if (comparisonFunction(currentMin, dataArray[i]) > 0) {
        currentMin = dataArray[i];
      }
    }
    return currentMin;
  }
  findMaximum(dataArray, comparisonFunction) {
    if (dataArray.length === 0) return undefined;
    if (comparisonFunction == null) { comparisonFunction = (a, b) => a - b; }
    let currentMax = dataArray[0];
    for (let i = 1; i < dataArray.length; ++i) {
      if (comparisonFunction(currentMax, dataArray[i]) < 0) {
        currentMax = dataArray[i];
      }
    }
    return currentMax;
  }
  performSort(dataArray, comparisonFunction) {
    if (comparisonFunction == null) { comparisonFunction = (a, b) => a - b; }
    for (let i = 1; i < dataArray.length; i++) {
      let currentElement = dataArray[i];
      let j = i - 1;
      while (j >= 0 && comparisonFunction(dataArray[j], currentElement) > 0) {
        dataArray[j + 1] = dataArray[j];
        j--;
      }
      dataArray[j + 1] = currentElement;
    }
    return dataArray;
  }
  deduplicateArray(inputArray) {
    const sortedArray = this.performSort([...inputArray]);
    if (sortedArray.length === 0) return [];
    const uniqueElements = [sortedArray[0]];
    for (let i = 1; i < sortedArray.length; ++i) {
      if (sortedArray[i] !== sortedArray[i - 1]) {
        uniqueElements.push(sortedArray[i]);
      }
    }
    return uniqueElements;
  }
  generateRange(startValue, stopValue, stepValue) {
    if (stopValue == null) { stopValue = startValue || 0; startValue = 0; }
    if (!stepValue) { stepValue = stopValue < startValue ? -1 : 1; }
    const length = Math.max(Math.ceil((stopValue - startValue) / stepValue), 0);
    return Array.from({ length: length }, (_, index) => startValue + index * stepValue);
  }
  retrieveFirstElements(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    const result = [];
    for (let i = 0; i < Math.min(sourceArray.length, count); ++i) {
      result.push(sourceArray[i]);
    }
    return result;
  }
  getInitialSegment(sourceArray, elementsToExclude) {
    const excludeCount = elementsToExclude == null ? 1 : elementsToExclude;
    const result = [];
    for (let i = 0; i < Math.max(0, sourceArray.length - excludeCount); ++i) {
      result.push(sourceArray[i]);
    }
    return result;
  }
  getTrailingElements(sourceArray, elementsToSkip) {
    const skipCount = elementsToSkip == null ? 1 : elementsToSkip;
    const result = [];
    for (let i = Math.min(sourceArray.length, skipCount); i < sourceArray.length; ++i) {
      result.push(sourceArray[i]);
    }
    return result;
  }
  retrieveLastElements(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) return count == null ? undefined : [];
    if (count == null) return sourceArray[sourceArray.length - 1];
    const startIndex = Math.max(0, sourceArray.length - count);
    const result = [];
    for (let i = startIndex; i < sourceArray.length; ++i) {
      result.push(sourceArray[i]);
    }
    return result;
  }
  computePrefixSums(inputArray) {
    if (inputArray.length === 0) return [];
    const sums = [];
    let currentSum = 0;
    for (const element of inputArray) {
      currentSum += element;
      sums.push(currentSum);
    }
    return sums;
  }
  computeDifferences(inputArray) {
    if (inputArray.length < 2) return [];
    return inputArray.slice(1).map((element, index) => element - inputArray[index]);
  }
  locateInsertionPoint(sortedArray, targetKey, propertyName) {
    const getComparableValue = (item) => (typeof item === 'object') ? item[propertyName] : item;
    const targetValue = getComparableValue(targetKey);

    function recursiveSearch(lowIndex, highIndex) {
      if (lowIndex >= highIndex) {
        return lowIndex;
      }
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getComparableValue(sortedArray[midIndex]) < targetValue) {
        return recursiveSearch(midIndex + 1, highIndex);
      } else {
        return recursiveSearch(lowIndex, midIndex);
      }
    }
    return recursiveSearch(0, sortedArray.length);
  }
}
const UTILS = new CollectionUtilities();

class DataStreamProcessor {
  constructor() {
    this.rawInputLines = [];
    this.lineGenerator = null;
    this.loadAllData();
  }

  loadAllData() {
    this.rawInputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    this.lineGenerator = this.createLineGenerator();
  }

  *createLineGenerator() {
    for (const line of this.rawInputLines) {
      yield line;
    }
  }

  obtainNextLine(numLines) {
    if (numLines) {
      const collectedLines = [];
      for (let i = 0; i < numLines; ++i) {
        const { value, done } = this.lineGenerator.next();
        if (done) break;
        collectedLines.push(value);
      }
      return collectedLines;
    }
    const { value } = this.lineGenerator.next();
    return value;
  }

  fetchNextInteger() { return parseInt(this.obtainNextLine(), 10); }
  fetchNextStringArray() { return this.obtainNextLine().split(' '); }
  fetchNextIntegerArray() { return this.fetchNextStringArray().map((element) => parseInt(element, 10)); }
  fetchNextFloatArray() { return this.fetchNextStringArray().map((element) => parseFloat(element)); }
  fetchIntegerLines(num) { return this.obtainNextLine(num).map((element) => parseInt(element, 10)); }
  fetchFloatLines(num) { return this.obtainNextLine(num).map((element) => parseFloat(element)); }
  fetchStringMatrix(num) { return this.obtainNextLine(num).map((line) => line.split(' ')); }
  fetchIntegerMatrix(num) {
    return this.obtainNextLine(num).map((line) => line.split(' ').map((element) => parseInt(element, 10)));
  }
  fetchFloatMatrix(num) {
    return this.obtainNextLine(num).map((line) => line.split(' ').map((element) => parseFloat(element)));
  }
}
const DATA_READER = new DataStreamProcessor();

class OutputFormatter {
  constructor() {
    this.booleanRepresentations = new Map([
      [true, 'Yes'],
      [false, 'No']
    ]);
  }

  displayResult(outputValue) {
    let finalOutput;
    if (outputValue == null) return;

    if (this.booleanRepresentations.has(outputValue)) {
      finalOutput = this.booleanRepresentations.get(outputValue);
    } else {
      finalOutput = outputValue;
    }
    console.log(finalOutput);
  }

  configureBooleanOutput(optionsArray) {
    this.booleanRepresentations.set(false, optionsArray[0]);
    this.booleanRepresentations.set(true, optionsArray[1]);
    return this;
  }
}
const RESULT_WRITER = new OutputFormatter();

RESULT_WRITER.displayResult(new ProblemSolver().execute());
