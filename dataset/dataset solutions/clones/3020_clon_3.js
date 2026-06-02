'use strict';

class Solver {
  _trimLeadingZeros(sequence) {
    let foundOne = false;
    const processedSequence = [];
    for (const element of sequence) {
      if (element === 1) {
        foundOne = true;
      }
      if (foundOne) {
        processedSequence.push(element);
      }
    }
    return processedSequence;
  }

  _trimTrailingOnes(sequence) {
    let currentEffectiveLength = sequence.length;
    for (let i = sequence.length - 1; i >= 0; --i) {
      if (sequence[i] === 0) {
        break;
      }
      currentEffectiveLength = i;
    }
    return sequence.slice(0, currentEffectiveLength);
  }

  execute() {
    const inputCount = inputHandler.readInt();
    const charValueSequence = Array.from(inputHandler.readLine()).map(charElem => charElem === '#' ? 1 : 0);

    const trimmedFromStart = this._trimLeadingZeros(charValueSequence);

    if (trimmedFromStart.length === 0) {
      return 0;
    }

    const finalProcessedSegment = this._trimTrailingOnes(trimmedFromStart);

    if (finalProcessedSegment.length === 0) {
      return 0;
    }

    let onesCounter = 0;
    let zerosCounter = 0;
    for (const value of finalProcessedSegment) {
      if (value === 1) {
        onesCounter++;
      } else {
        zerosCounter++;
      }
    }

    return Math.min(onesCounter, zerosCounter);
  }
}

class ModularArithmetic {
  constructor(modulusValue) {
    if (modulusValue == null) { modulusValue = Combinatorics.DefaultMod; }
    this.modulus = modulusValue;
  }
  multiply(valA, valB) {
    let resultAccumulator = 0;
    valA %= this.modulus;
    valB %= this.modulus;
    while (valB > 0) {
      if (valB & 1) {
        resultAccumulator += valA;
        if (resultAccumulator >= this.modulus) { resultAccumulator -= this.modulus; }
      }
      valA = valA << 1;
      if (valA >= this.modulus) { valA -= this.modulus; }
      valB = valB >> 1;
    }
    return resultAccumulator;
  }
  power(base, exponent) {
    let result = 1;
    while(exponent > 0) {
      if (exponent & 1) { result = this.multiply(result, base); }
      base = this.multiply(base, base);
      exponent = exponent >> 1;
    }
    return result;
  }
  divide(numerator, denominator) { return this.multiply(numerator, this.power(denominator, this.modulus - 2)); }
  combinations(n, k) { return MOD_ARITHMETIC.multiply(factTable[n], MOD_ARITHMETIC.multiply(invFactTable[k], invFactTable[n - k])); }
}
const MOD_ARITHMETIC = new ModularArithmetic(998244353);

class UtilityFunctions {
  calculateSum(numberArray) { return numberArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0); }
  calculateModSum(numberArray, currentMod) { if (currentMod == null) { currentMod = MOD_ARITHMETIC.modulus; } return numberArray.reduce((acc, val) => (acc + val) % currentMod, 0); }
  findMin(numberArray, comparisonFunc) {
    const actualComparisonFunc = comparisonFunc == null ? (a, b) => a - b : comparisonFunc;
    return numberArray.reduce((a, b) => actualComparisonFunc(a, b) < 0 ? a : b);
  }
  findMax(numberArray, comparisonFunc) {
    const actualComparisonFunc = comparisonFunc == null ? (a, b) => a - b : comparisonFunc;
    return numberArray.reduce((a, b) => actualComparisonFunc(a, b) > 0 ? a : b);
  }
  sortArray(numberArray, comparisonFunc) {
    const actualComparisonFunc = comparisonFunc == null ? (a, b) => a - b : comparisonFunc;
    return numberArray.sort(actualComparisonFunc);
  }
  uniqueElements(inputArray) {
    inputArray.sort();
    const arrayLength = inputArray.length;
    for (let i = 0; i < arrayLength - 1; ++i) {
      const currentVal = inputArray[i];
      const nextVal = inputArray[i+1];
      if (currentVal === nextVal) {
        inputArray[i] = null;
      }
    }
    const finalUniqueArray = inputArray.filter(element => element !== null);
    return finalUniqueArray;
  }
  generateRange(startVal, stopVal, stepVal) {
    let actualStart = startVal || 0;
    let actualStop = stopVal;
    if (actualStop == null) {
      actualStop = actualStart;
      actualStart = 0;
    }
    let actualStep = stepVal;
    if (!actualStep) {
      actualStep = actualStop < actualStart ? -1 : 1;
    }

    const rangeLength = Math.max(Math.ceil((actualStop - actualStart) / actualStep), 0);
    const generatedRange = Array(rangeLength);
    let currentVal = actualStart;
    for (let idx = 0; idx < rangeLength; idx++) {
      generatedRange[idx] = currentVal;
      currentVal += actualStep;
    }
    return generatedRange;
  }
  getFirst (array, numElements) {
    if (array == null || array.length < 1) return numElements == null ? void 0 : [];
    if (numElements == null) return array[0];
    return this.getInitial(array, array.length - numElements);
  }
  getInitial (array, numToExclude) { return array.slice(0, Math.max(0, array.length - (numToExclude == null ? 1 : numToExclude))); }
  getTail(array, numToSkip) { return array.slice(numToSkip == null ? 1 : numToSkip); }
  getLast (array, numElements) { if (numElements == null) return array[array.length - 1]; return this.getTail(array, Math.max(0, array.length - numElements)); }
  cumulativeSum (inputArray) {
    const intermediateSums = [0];
    inputArray.forEach((element, index) => {
      intermediateSums.push(element + intermediateSums[index]);
    });
    return this.getTail(intermediateSums);
  }
  differenceArray (inputArray) {
    const differences = [];
    const arrayLength = inputArray.length;
    for (let i = 1; i < arrayLength; ++i) {
      const currentDiff = inputArray[i] - inputArray[i-1];
      differences.push(currentDiff);
    }
    return differences;
  }
  performBinarySearch (targetArray, searchKey, iteratorKey) {
    const getIteratedValue = (obj) => (typeof obj === 'object') ? obj[iteratorKey] : obj;
    const targetValue = getIteratedValue(searchKey);
    let lowIndex = 0, highIndex = targetArray.length;
    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getIteratedValue(targetArray[midIndex]) < targetValue) lowIndex = midIndex + 1; else highIndex = midIndex;
    }
    return lowIndex;
  }
}
const _util = new UtilityFunctions();

class InputReader {
  constructor() {
    this.readCursor = 0;
    this.readAllInput();
  }

  readAllInput() {
    const fileContent = (require("fs").readFileSync("/dev/stdin", "utf8"));
    this.dataLines = fileContent.split('\n');
    return this.dataLines;
  }

  readLine(numLines) {
    if (numLines) {
      const linesToReturn = this.dataLines.slice(this.readCursor, this.readCursor + numLines);
      this.readCursor += numLines;
      return linesToReturn;
    }
    const singleLine = this.dataLines[this.readCursor];
    this.readCursor++;
    return singleLine;
  }
  readInt() {
    const lineContent = this.readLine();
    return parseInt(lineContent, 10);
  }
  readStringArray() {
    const lineContent = this.readLine();
    return lineContent.split(' ');
  }
  readIntArray() {
    const stringArray = this.readStringArray();
    return stringArray.map((element) => parseInt(element, 10));
  }
  readFloatArray() {
    const stringArray = this.readStringArray();
    return stringArray.map((element) => parseFloat(element));
  }
  readIntLines(numLines) {
    const linesContent = this.readLine(numLines);
    return linesContent.map((element) => parseInt(element, 10));
  }
  readFloatLines(numLines) {
    const linesContent = this.readLine(numLines);
    return linesContent.map((element) => parseFloat(element));
  }
  readStringMatrix(numLines) {
    const linesContent = this.readLine(numLines);
    return linesContent.map((line) => line.split(' '));
  }
  readIntMatrix(numLines) {
    const linesContent = this.readLine(numLines);
    return linesContent.map((line) => line.split(' ').map((element) => parseInt(element, 10)));
  }
  readFloatMatrix(numLines) {
    const linesContent = this.readLine(numLines);
    return linesContent.map((line) => line.split(' ').map((element) => parseFloat(element)));
  }
}
const inputHandler = new InputReader();

class OutputWriter {
  constructor() {
    this.booleanOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  print(outputValue){
    let finalOutputString;
    if (outputValue == null) return;
    if (outputValue === true) { finalOutputString = this.booleanOptions['true']; }
    else if (outputValue === false) { finalOutputString = this.booleanOptions['false']; }
    else { finalOutputString = outputValue; }
    console.log(finalOutputString);
  }
  setBooleanOptions(optionsArray) {
    this.booleanOptions['false'] = optionsArray[0];
    this.booleanOptions['true'] = optionsArray[1];
    return this;
  }
}
const outputHandler = new OutputWriter();

outputHandler.print(new Solver().execute());
