'use strict'

class ProblemSolver {
  executeSolution() {
    const count = inputHandler.readNextInt();
    const pairs = inputHandler.readIntMatrix(count);

    if (pairs.every(pairEntry => pairEntry[0] === pairEntry[1])) {
      return 0;
    }

    const greaterPairs = pairs.filter(pairEntry => pairEntry[0] > pairEntry[1]);

    const totalSumOfA = utils.calculateSum(pairs.map(pairEntry => pairEntry[0]));

    const conditionValue = totalSumOfA - greaterPairs.length;

    if (conditionValue === 0) {
      return 0;
    } else {
      const minBFromGreaterPairs = utils.findMinimum(greaterPairs.map(pairEntry => pairEntry[1]));
      return minBFromGreaterPairs;
    }
  }
}

class ModularArithmetic {
  constructor(modulusValue) {
    this.modulus = modulusValue != null ? modulusValue : 1e9 + 7;
  }

  _applyModulo(value) {
    return value % this.modulus;
  }

  multiplyMod(valA, valB) {
    let currentResult = 0;
    let aReduced = this._applyModulo(valA);
    let bReduced = this._applyModulo(valB);

    while (bReduced > 0) {
      if (bReduced & 1) {
        currentResult += aReduced;
        if (currentResult >= this.modulus) {
          currentResult -= this.modulus;
        }
      }
      aReduced <<= 1;
      if (aReduced >= this.modulus) {
        aReduced -= this.modulus;
      }
      bReduced >>= 1;
    }
    return currentResult;
  }

  powerMod(base, exponent) {
    let finalResult = 1;
    let currentBase = base;
    while (exponent > 0) {
      if (exponent & 1) {
        finalResult = this.multiplyMod(finalResult, currentBase);
      }
      currentBase = this.multiplyMod(currentBase, currentBase);
      exponent >>= 1;
    }
    return finalResult;
  }

  divideMod(numerator, denominator) {
    const inverseDenominator = this.powerMod(denominator, this.modulus - 2);
    return this.multiplyMod(numerator, inverseDenominator);
  }

  combinationsMod(n, k) {
    const nFact = factTable[n];
    const kInvFact = invFactTable[k];
    const nkInvFact = invFactTable[n - k];
    return MOD_ARITHMETIC.multiplyMod(nFact, MOD_ARITHMETIC.multiplyMod(kInvFact, nkInvFact));
  }
}
const MOD_ARITHMETIC = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  calculateSum(dataArray) {
    let total = 0;
    for (const item of dataArray) {
      total += item;
    }
    return total;
  }

  calculateModSum(dataArray, modulusVal) {
    const currentModulus = modulusVal != null ? modulusVal : MOD_ARITHMETIC.modulus;
    return dataArray.reduce((acc, current) => (acc + current) % currentModulus, 0);
  }

  _getDefaultComparator() {
    return (a, b) => a - b;
  }

  findMinimum(dataArray, comparatorFunc) {
    const actualComparator = comparatorFunc != null ? comparatorFunc : this._getDefaultComparator();
    return dataArray.reduce((minVal, currentVal) => actualComparator(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  findMaximum(dataArray, comparatorFunc) {
    const actualComparator = comparatorFunc != null ? comparatorFunc : this._getDefaultComparator();
    return dataArray.reduce((maxVal, currentVal) => actualComparator(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  sortArray(dataArray, comparatorFunc) {
    const actualComparator = comparatorFunc != null ? comparatorFunc : this._getDefaultComparator();
    return dataArray.sort(actualComparator);
  }

  uniqueElements(dataArray) {
    dataArray.sort();
    for (let i = 0; i < dataArray.length - 1; ++i) {
      dataArray[i] = dataArray[i + 1] == dataArray[i] ? null : dataArray[i];
    }
    return dataArray.filter(element => element != null);
  }

  generateRange(startVal, stopVal, stepVal) {
    let currentStart = startVal;
    let currentStop = stopVal;
    let currentStep = stepVal;

    if (currentStop == null) {
      currentStop = currentStart || 0;
      currentStart = 0;
    }
    if (!currentStep) {
      currentStep = currentStop < currentStart ? -1 : 1;
    }

    const rangeLength = Math.max(Math.ceil((currentStop - currentStart) / currentStep), 0);
    const generatedRange = [];
    for (let idx = 0; idx < rangeLength; idx++) {
      generatedRange.push(currentStart);
      currentStart += currentStep;
    }
    return generatedRange;
  }

  getFirstElements(dataArray, numElements) {
    if (dataArray == null || dataArray.length < 1) {
      return numElements == null ? undefined : [];
    }
    if (numElements == null) {
      return dataArray[0];
    }
    return dataArray.slice(0, numElements);
  }

  getInitialElements(dataArray, numToExclude) {
    const actualNumToExclude = numToExclude == null ? 1 : numToExclude;
    return dataArray.slice(0, Math.max(0, dataArray.length - actualNumToExclude));
  }

  getTailElements(dataArray, numToSkip) {
    const actualNumToSkip = numToSkip == null ? 1 : numToSkip;
    return dataArray.slice(actualNumToSkip);
  }

  getLastElements(dataArray, numElements) {
    if (numElements == null) {
      return dataArray[dataArray.length - 1];
    }
    return dataArray.slice(Math.max(0, dataArray.length - numElements));
  }

  getPrefixSums(dataArray) {
    const sums = [0];
    for (let i = 0; i < dataArray.length; i++) {
      sums.push(dataArray[i] + sums[i]);
    }
    return this.getTailElements(sums);
  }

  getDifferences(dataArray) {
    const diffs = [];
    for (let i = 1; i < dataArray.length; ++i) {
      diffs.push(dataArray[i] - dataArray[i - 1]);
    }
    return diffs;
  }

  performBinarySearch(dataArray, searchKey, iterateeKey) {
    const getIteratedValue = (obj) => {
      if (typeof obj === 'object' && obj !== null && iterateeKey !== undefined) {
        return obj[iterateeKey];
      }
      return obj;
    };
    const targetValue = getIteratedValue(searchKey);
    let lowIndex = 0;
    let highIndex = dataArray.length;
    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getIteratedValue(dataArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
const utils = new UtilityFunctions();

class InputReader {
  constructor() {
    this.readCursor = 0;
    this.inputLines = [];
    this._initializeInputData();
  }

  _initializeInputData() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  getNextLines(numLines) {
    if (numLines !== undefined && numLines !== null) {
      const linesToReturn = [];
      for (let i = 0; i < numLines; i++) {
        if (this.readCursor < this.inputLines.length) {
          linesToReturn.push(this.inputLines[this.readCursor]);
          this.readCursor++;
        } else {
          break;
        }
      }
      return linesToReturn;
    }
    if (this.readCursor < this.inputLines.length) {
      return this.inputLines[this.readCursor++];
    }
    return undefined;
  }

  readNextInt() { return parseInt(this.getNextLines(), 10); }
  readNextStringArray() { return this.getNextLines().split(' '); }
  readNextIntArray() { return this.readNextStringArray().map((element) => parseInt(element, 10)); }
  readNextFloatArray() { return this.readNextStringArray().map((element) => parseFloat(element)); }

  _parseLineToInt(lineContent) {
    return parseInt(lineContent, 10);
  }

  _parseLineToFloat(lineContent) {
    return parseFloat(lineContent);
  }

  readIntLines(numLines) { return this.getNextLines(numLines).map(this._parseLineToInt); }
  readFloatLines(numLines) { return this.getNextLines(numLines).map(this._parseLineToFloat); }

  _parseLineToStringArray(lineContent) {
    return lineContent.split(' ');
  }

  _parseLineToIntArray(lineContent) {
    return lineContent.split(' ').map((element) => parseInt(element, 10));
  }

  _parseLineToFloatArray(lineContent) {
    return lineContent.split(' ').map((element) => parseFloat(element));
  }

  readStringMatrix(numLines) { return this.getNextLines(numLines).map(this._parseLineToStringArray); }
  readIntMatrix(numLines) {
    return this.getNextLines(numLines).map(this._parseLineToIntArray);
  }
  readFloatMatrix(numLines) {
    return this.getNextLines(numLines).map(this._parseLineToFloatArray);
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

  _getFormattedOutput(outputValue) {
    switch (outputValue) {
      case true:
        return this.booleanOptions['true'];
      case false:
        return this.booleanOptions['false'];
      default:
        return outputValue;
    }
  }

  printOutput(outputValue) {
    if (outputValue == null) {
      return;
    }
    const finalOutput = this._getFormattedOutput(outputValue);
    console.log(finalOutput);
  }

  setBooleanOptions(optionsArray) {
    this.booleanOptions['false'] = optionsArray[0];
    this.booleanOptions['true'] = optionsArray[1];
    return this;
  }
}
const outputHandler = new OutputWriter();

outputHandler.printOutput(new ProblemSolver().executeSolution());
