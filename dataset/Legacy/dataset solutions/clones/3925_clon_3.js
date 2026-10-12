'use strict';

class ProblemSolver {
  executeSolution() {
    const inputCount = inputHandler.readNextInt();
    const inputPairs = inputHandler.readIntMatrix(inputCount);

    const allPairsEqual = inputPairs.every(element => element[0] === element[1]);
    if (allPairsEqual) {
      return 0;
    }

    const greaterPairs = inputPairs.filter(element => element[0] > element[1]);
    const totalSumOfA = utilityFunctions.calculateSum(inputPairs.map(element => element[0]));

    let minBToRemove = 0;
    if (greaterPairs.length > 0) {
      const bValuesOfGreaterPairs = greaterPairs.map(element => element[1]);
      minBToRemove = utilityFunctions.findMin(bValuesOfGreaterPairs);
    }

    return totalSumOfA - minBToRemove;
  }
}

class ModularArithmetic {
  constructor(moduloValue) {
    if (moduloValue == null) {
      moduloValue = 1e9 + 7; // Assuming a default if not provided, similar to original intent
    }
    this.moduloValue = moduloValue;
  }

  multiplyMod(operandA, operandB) {
    let resultValue = 0;
    operandA %= this.moduloValue;
    operandB %= this.moduloValue;
    while (operandB) {
      if (operandB & 1) {
        resultValue += operandA;
        if (resultValue >= this.moduloValue) {
          resultValue -= this.moduloValue;
        }
      }
      operandA <<= 1;
      if (operandA >= this.moduloValue) {
        operandA -= this.moduloValue;
      }
      operandB >>= 1;
    }
    return resultValue;
  }

  powerMod(base, exponent) {
    let resultValue = 1;
    let currentBase = base;
    while (exponent) {
      if (exponent & 1) {
        resultValue = this.multiplyMod(resultValue, currentBase);
      }
      currentBase = this.multiplyMod(currentBase, currentBase);
      exponent >>= 1;
    }
    return resultValue;
  }

  divideMod(numerator, denominator) {
    return this.multiplyMod(numerator, this.powerMod(denominator, this.moduloValue - 2));
  }

  // Note: factTable and invFactTable are not defined in the original snippet,
  // so this method would cause a runtime error if called. Preserving original behavior.
  combinationsMod(n, k) {
    return MOD_CALCULATOR.multiplyMod(factTable[n], MOD_CALCULATOR.multiplyMod(invFactTable[k], invFactTable[n - k]));
  }
}
const MOD_CALCULATOR = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  calculateSum(dataArray) {
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  calculateModSum(dataArray, moduloValue) {
    if (moduloValue == null) {
      moduloValue = MOD_CALCULATOR.moduloValue;
    }
    return dataArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloValue);
  }

  findMin(dataArray, compareFunction) {
    if (dataArray.length === 0) return undefined; // Guard clause for empty array
    const actualCompare = compareFunction == null ? (a, b) => a - b : compareFunction;
    return dataArray.reduce((minVal, currentVal) => actualCompare(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  findMax(dataArray, compareFunction) {
    if (dataArray.length === 0) return undefined; // Guard clause for empty array
    const actualCompare = compareFunction == null ? (a, b) => a - b : compareFunction;
    return dataArray.reduce((maxVal, currentVal) => actualCompare(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  sortArray(dataArray, compareFunction) {
    const actualCompare = compareFunction == null ? (a, b) => a - b : compareFunction;
    return dataArray.sort(actualCompare);
  }

  uniqueElements(dataArray) {
    if (!dataArray || dataArray.length === 0) {
      return [];
    }
    const sortedCopy = [...dataArray].sort(); // Create a copy to avoid modifying original
    const uniqueResult = [];
    uniqueResult.push(sortedCopy[0]);
    for (let i = 1; i < sortedCopy.length; ++i) {
      if (sortedCopy[i] !== sortedCopy[i - 1]) {
        uniqueResult.push(sortedCopy[i]);
      }
    }
    return uniqueResult;
  }

  generateRange(rangeStart, rangeStop, rangeStep) {
    if (rangeStop == null) {
      rangeStop = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeStop < rangeStart ? -1 : 1;
    }
    const arrayLength = Math.max(Math.ceil((rangeStop - rangeStart) / rangeStep), 0);
    const resultRange = Array(arrayLength);
    for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++, rangeStart += rangeStep) {
      resultRange[currentIndex] = rangeStart;
    }
    return resultRange;
  }

  getFirstElements(dataArray, count) {
    if (dataArray == null || dataArray.length < 1) return count == null ? void 0 : [];
    if (count == null) return dataArray[0];
    return this.getInitialElements(dataArray, dataArray.length - count);
  }

  getInitialElements(dataArray, count) {
    return dataArray.slice.call(dataArray, 0, Math.max(0, dataArray.length - (count == null ? 1 : count)));
  }

  getTailElements(dataArray, count) {
    return dataArray.slice.call(dataArray, count == null ? 1 : count);
  }

  getLastElements(dataArray, count) {
    if (count == null) return dataArray[dataArray.length - 1];
    return this.getTailElements(dataArray, Math.max(0, dataArray.length - count));
  }

  cumulativeSumArray(dataArray) {
    const sums = [0];
    for (let i = 0; i < dataArray.length; i++) {
      sums.push(dataArray[i] + sums[i]);
    }
    return this.getTailElements(sums);
  }

  differenceArray(dataArray) {
    const differences = [];
    for (let i = 1; i < dataArray.length; ++i) {
      differences.push(dataArray[i] - dataArray[i - 1]);
    }
    return differences;
  }

  // Finds the largest index whose value is less than or equal to the key
  performBinarySearch(dataArray, searchValue, propertyAccessor) {
    const getIteratedValue = (obj) => (typeof obj === 'object') ? obj[propertyAccessor] : obj;
    const targetValue = getIteratedValue(searchValue);
    let lowIndex = 0,
      highIndex = dataArray.length;
    while (lowIndex < highIndex) {
      let middleIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getIteratedValue(dataArray[middleIndex]) < targetValue) lowIndex = middleIndex + 1;
      else highIndex = middleIndex;
    }
    return lowIndex;
  }
}
const utilityFunctions = new UtilityFunctions();

class InputReader {
  constructor() {
    this.readCursor = 0;
    this.readAllInput();
  }

  readAllInput() {
    this.allInputData = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.allInputData;
  }

  getNextLine(linesToRead) {
    if (this.readCursor >= this.allInputData.length) {
      // Handle end of input gracefully, or throw an error if strict behavior is needed.
      // Original code would return undefined, preserving that.
      return undefined;
    }
    if (linesToRead) {
      const lines = this.allInputData.slice(this.readCursor, this.readCursor + linesToRead);
      this.readCursor += linesToRead;
      return lines;
    }
    return this.allInputData[this.readCursor++];
  }

  readNextInt() {
    return parseInt(this.getNextLine());
  }

  readNextStringArray() {
    return this.getNextLine().split(' ');
  }

  _parseLineToIntArray(line) {
    return line.split(' ').map((element) => parseInt(element));
  }

  readNextIntArray() {
    return this._parseLineToIntArray(this.getNextLine());
  }

  readNextFloatArray() {
    return this.getNextLine().split(' ').map((element) => parseFloat(element));
  }

  readIntLines(count) {
    return this.getNextLine(count).map((line) => parseInt(line));
  }

  readFloatLines(count) {
    return this.getNextLine(count).map((line) => parseFloat(line));
  }

  readStringMatrix(count) {
    return this.getNextLine(count).map((currentLine) => currentLine.split(' '));
  }

  readIntMatrix(count) {
    return this.getNextLine(count).map((currentLine) => this._parseLineToIntArray(currentLine));
  }

  readFloatMatrix(count) {
    return this.getNextLine(count).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
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

  printOutput(outputValue) {
    let finalOutputString;
    if (outputValue == null) {
      return;
    } else if (outputValue === true) {
      finalOutputString = this.booleanOptions['true'];
    } else if (outputValue === false) {
      finalOutputString = this.booleanOptions['false'];
    } else {
      finalOutputString = outputValue;
    }
    console.log(finalOutputString);
  }

  setBooleanOutput(optionsArray) {
    this.booleanOptions['false'] = optionsArray[0];
    this.booleanOptions['true'] = optionsArray[1];
    return this;
  }
}
const outputHandler = new OutputWriter();

outputHandler.printOutput(new ProblemSolver().executeSolution());
