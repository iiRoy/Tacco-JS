'use strict';

class SolverApp {
  executeSolution() {
    const inputLength = inputHandler.readNextInt();
    const charSequence = inputHandler.readSingleLine();
    const processedChars = Array.from(charSequence).map(charItem => charItem === '#' ? 1 : 0);

    let firstRelevantIndex = -1;
    for (let i = 0; i < inputLength; ++i) {
      if (processedChars[i] === 1) {
        firstRelevantIndex = i;
        break;
      }
    }

    if (firstRelevantIndex === -1) {
      return 0;
    }

    const trimmedLeadingSequence = processedChars.slice(firstRelevantIndex);

    let lastRelevantIndex = trimmedLeadingSequence.length - 1;
    for (let i = trimmedLeadingSequence.length - 1; i >= 0; --i) {
      if (trimmedLeadingSequence[i] === 0) {
        lastRelevantIndex = i;
      } else {
        break;
      }
    }

    const finalProcessedSequence = trimmedLeadingSequence.slice(0, lastRelevantIndex + 1);

    if (finalProcessedSequence.length === 0) {
      return 0;
    }

    const blackCells = finalProcessedSequence;
    const whiteCells = finalProcessedSequence.map(cellValue => cellValue === 1 ? 0 : 1);

    const cumulativeBlackCounts = util.getPrefixSums(blackCells);
    const cumulativeWhiteCounts = util.getPrefixSums(whiteCells);

    const totalBlackCount = util.calculateSum(blackCells);
    const totalWhiteCount = util.calculateSum(whiteCells);

    const potentialCosts = [];
    potentialCosts.push(totalWhiteCount); // Cost if no black cells are flipped

    for (let i = 0; i < blackCells.length; ++i) {
      const currentBlackPrefixSum = cumulativeBlackCounts[i]; // Sum of black cells from 0 to i
      const currentWhiteSuffixSum = totalWhiteCount - cumulativeWhiteCounts[i]; // Sum of white cells from i+1 to end
      potentialCosts.push(currentBlackPrefixSum + currentWhiteSuffixSum);
    }

    return util.findMinimum(potentialCosts);
  }
}

class ModularArithmetic {
  constructor(modulusValue) {
    if (modulusValue == null) {
      modulusValue = Combinatorics.DefaultMod; // Assuming Combinatorics is defined elsewhere if needed
    }
    this.modulusValue = modulusValue;
  }

  multiplyMod(valA, valB) {
    let result = 0;
    valA %= this.modulusValue;
    valB %= this.modulusValue;
    while (valB) {
      if (valB & 1) {
        result += valA;
        if (result >= this.modulusValue) {
          result -= this.modulusValue;
        }
      }
      valA <<= 1;
      if (valA >= this.modulusValue) {
        valA -= this.modulusValue;
      }
      valB >>= 1;
    }
    return result;
  }

  powerMod(base, exponent) {
    let result = 1;
    while (exponent) {
      if (exponent & 1) {
        result = this.multiplyMod(result, base);
      }
      base = this.multiplyMod(base, base);
      exponent >>= 1;
    }
    return result;
  }

  divideMod(numerator, denominator) {
    return this.multiplyMod(numerator, this.powerMod(denominator, this.modulusValue - 2));
  }

  combinationsMod(n, k) {
    // Assumes factTable and invFactTable are globally available or part of a larger context
    return MOD_CALCULATOR.multiplyMod(factTable[n], MOD_CALCULATOR.multiplyMod(invFactTable[k], invFactTable[n - k]));
  }
}
const MOD_CALCULATOR = new ModularArithmetic(998244353);

class UtilityToolkit {
  calculateSum(dataArray) {
    let total = 0;
    for (let i = 0; i < dataArray.length; ++i) {
      total += dataArray[i];
    }
    return total;
  }

  calculateModSum(dataArray, modulus) {
    if (modulus == null) {
      modulus = MOD_CALCULATOR.modulusValue;
    }
    return dataArray.reduce((acc, current) => (acc + current) % modulus, 0);
  }

  findMinimum(dataArray, comparisonFunction) {
    if (dataArray.length === 0) return undefined;
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB;
    }
    let currentMinimum = dataArray[0];
    for (let i = 1; i < dataArray.length; ++i) {
      if (comparisonFunction(dataArray[i], currentMinimum) < 0) {
        currentMinimum = dataArray[i];
      }
    }
    return currentMinimum;
  }

  findMaximum(dataArray, comparisonFunction) {
    if (dataArray.length === 0) return undefined;
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB;
    }
    let currentMaximum = dataArray[0];
    for (let i = 1; i < dataArray.length; ++i) {
      if (comparisonFunction(dataArray[i], currentMaximum) > 0) {
        currentMaximum = dataArray[i];
      }
    }
    return currentMaximum;
  }

  sortArray(dataArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB;
    }
    return dataArray.sort(comparisonFunction);
  }

  getUniqueElements(dataArray) {
    const sortedArray = [...dataArray].sort(); // Create a copy to avoid modifying original
    const uniqueList = [];
    if (sortedArray.length > 0) {
      uniqueList.push(sortedArray[0]);
      for (let i = 1; i < sortedArray.length; ++i) {
        if (sortedArray[i] !== sortedArray[i - 1]) {
          uniqueList.push(sortedArray[i]);
        }
      }
    }
    return uniqueList;
  }

  generateRange(startValue, stopValue, stepValue) {
    if (stopValue == null) {
      stopValue = startValue || 0;
      startValue = 0;
    }
    if (!stepValue) {
      stepValue = stopValue < startValue ? -1 : 1;
    }
    const count = Math.max(Math.ceil((stopValue - startValue) / stepValue), 0);
    const generatedRange = Array(count);
    for (let idx = 0; idx < count; idx++, startValue += stepValue) {
      generatedRange[idx] = startValue;
    }
    return generatedRange;
  }

  getFirstElements(sourceArray, numElements) {
    if (sourceArray == null || sourceArray.length < 1) return numElements == null ? undefined : [];
    if (numElements == null) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - numElements);
  }

  getInitialElements(sourceArray, numToExclude) {
    return sourceArray.slice(0, Math.max(0, sourceArray.length - (numToExclude == null ? 1 : numToExclude)));
  }

  getTailElements(sourceArray, numToSkip) {
    return sourceArray.slice(numToSkip == null ? 1 : numToSkip);
  }

  getLastElements(sourceArray, numElements) {
    if (numElements == null) return sourceArray[sourceArray.length - 1];
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - numElements));
  }

  getPrefixSums(dataArray) {
    if (dataArray.length === 0) return [];
    const prefixSums = [];
    let currentAccumulatedSum = 0;
    for (let i = 0; i < dataArray.length; ++i) {
      currentAccumulatedSum += dataArray[i];
      prefixSums.push(currentAccumulatedSum);
    }
    return prefixSums;
  }

  getDifferences(dataArray) {
    const differences = [];
    for (let i = 1; i < dataArray.length; ++i) {
      differences.push(dataArray[i] - dataArray[i - 1]);
    }
    return differences;
  }

  performBinarySearch(sortedArray, searchKey, iterateeProperty) {
    const getComparableValue = (obj) => (typeof obj === 'object') ? obj[iterateeProperty] : obj;
    const targetValue = getComparableValue(searchKey);
    let lowIndex = 0,
      highIndex = sortedArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getComparableValue(sortedArray[midIndex]) < targetValue) lowIndex = midIndex + 1;
      else highIndex = midIndex;
    }
    return lowIndex;
  }
}
const util = new UtilityToolkit();

class InputReader {
  constructor() {
    this.readCursor = 0;
    this.readAllInput();
  }

  readAllInput() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  readSingleLine() {
    return this.inputLines[this.readCursor++];
  }

  readMultipleLines(count) {
    const lines = this.inputLines.slice(this.readCursor, this.readCursor + count);
    this.readCursor += count;
    return lines;
  }

  readNextInt() {
    return parseInt(this.readSingleLine());
  }

  readNextStringArray() {
    return this.readSingleLine().split(' ');
  }

  readNextIntArray() {
    return this.readNextStringArray().map((element) => parseInt(element));
  }

  readNextFloatArray() {
    return this.readNextStringArray().map((element) => parseFloat(element));
  }

  readNextIntLines(count) {
    return this.readMultipleLines(count).map((line) => parseInt(line));
  }

  readNextFloatLines(count) {
    return this.readMultipleLines(count).map((line) => parseFloat(line));
  }

  readNextStringMatrix(count) {
    return this.readMultipleLines(count).map((line) => line.split(' '));
  }

  readNextIntMatrix(count) {
    return this.readMultipleLines(count).map((line) => line.split(' ').map((element) => parseInt(element)));
  }

  readNextFloatMatrix(count) {
    return this.readMultipleLines(count).map((line) => line.split(' ').map((element) => parseFloat(element)));
  }
}
const inputHandler = new InputReader();

class OutputWriter {
  constructor() {
    this.booleanOutputOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  printResult(outputValue) {
    if (outputValue == null) return;
    let finalOutputString;
    if (typeof outputValue === 'boolean') {
      finalOutputString = outputValue ? this.booleanOutputOptions['true'] : this.booleanOutputOptions['false'];
    } else {
      finalOutputString = outputValue;
    }
    console.log(finalOutputString);
  }

  configureBooleanOutput(options) {
    this.booleanOutputOptions['false'] = options[0];
    this.booleanOutputOptions['true'] = options[1];
    return this;
  }
}
const outputHandler = new OutputWriter();

outputHandler.printResult(new SolverApp().executeSolution());
