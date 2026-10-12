'use strict'

class SolutionProcessor {
  #calculateCombinationSum(digitsReversed, combinationMask) {
    let currentSegmentSum = 0;
    let currentPlaceValue = 1;

    for (const digitChar of digitsReversed) {
      const digitVal = parseInt(digitChar, 10);
      currentSegmentSum += digitVal * currentPlaceValue;

      const shouldConcatenate = (combinationMask & 1) === 1;
      if (shouldConcatenate) {
        currentPlaceValue *= 10;
      } else {
        currentPlaceValue = 1;
      }
      combinationMask >>= 1;
    }
    return currentSegmentSum;
  }

  processInputAndCalculate() {
    const rawInputLine = stdinReader.getLines();
    const digitCharacters = Array.from(rawInputLine);
    const reversedDigitCharacters = digitCharacters.reverse();

    let overallTotalSum = 0;

    const numberOfDigits = reversedDigitCharacters.length;
    if (numberOfDigits === 0) {
      console.log(0);
      return;
    }

    const numberOfSplitPositions = numberOfDigits - 1;
    const totalPossibleCombinations = 1 << numberOfSplitPositions;

    for (let comboIndex = 0; comboIndex < totalPossibleCombinations; ++comboIndex) {
      overallTotalSum += this.#calculateCombinationSum(reversedDigitCharacters, comboIndex);
    }
    console.log(overallTotalSum);
  }
}

class UtilityToolkit {
  sum(dataArray) {
    if (!dataArray || dataArray.length === 0) return 0;
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  #compareElements(a, b, comparator) {
    if (comparator == null) {
      comparator = (valA, valB) => valA - valB;
    }
    return comparator(a, b);
  }

  min(dataArray, comparatorFunc) {
    if (!dataArray || dataArray.length === 0) return undefined;
    return dataArray.reduce((minVal, currentVal) =>
      this.#compareElements(minVal, currentVal, comparatorFunc) < 0 ? minVal : currentVal
    );
  }

  max(dataArray, comparatorFunc) {
    if (!dataArray || dataArray.length === 0) return undefined;
    return dataArray.reduce((maxVal, currentVal) =>
      this.#compareElements(maxVal, currentVal, comparatorFunc) > 0 ? maxVal : currentVal
    );
  }

  sort(dataArray, comparatorFunc) {
    if (comparatorFunc == null) {
      comparatorFunc = (valA, valB) => valA - valB;
    }
    return dataArray.sort(comparatorFunc);
  }

  generateRange(startValue, stopValue, stepValue) {
    if (stopValue == null) {
      stopValue = startValue || 0;
      startValue = 0;
    }
    if (!stepValue) {
      stepValue = stopValue < startValue ? -1 : 1;
    }

    const calculatedLength = Math.max(Math.ceil((stopValue - startValue) / stepValue), 0);
    return Array.from({ length: calculatedLength }, (_, index) => startValue + index * stepValue);
  }

  getFirstElements(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) return count == null ? void 0 : [];
    if (count == null) return sourceArray[0];
    return this.getInitialElements(sourceArray, sourceArray.length - count);
  }

  getInitialElements(sourceArray, countToExclude) {
    const numToExclude = countToExclude == null ? 1 : countToExclude;
    return sourceArray.slice(0, Math.max(0, sourceArray.length - numToExclude));
  }

  getTailElements(sourceArray, countToSkip) {
    const numToSkip = countToSkip == null ? 1 : countToSkip;
    return sourceArray.slice(numToSkip);
  }

  getLastElements(sourceArray, count) {
    if (count == null) return sourceArray[sourceArray.length - 1];
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - count));
  }

  calculateCumulativeSum(sourceArray) {
    if (!sourceArray || sourceArray.length === 0) return [];
    const cumulativeSums = [];
    let currentRunningSum = 0;
    for (let i = 0; i < sourceArray.length; i++) {
      currentRunningSum += sourceArray[i];
      cumulativeSums.push(currentRunningSum);
    }
    return cumulativeSums;
  }

  performBinarySearch(sortedArray, searchKey, propertyAccessor) {
    const getComparableValue = (item) => {
      if (propertyAccessor == null) return item;
      return (typeof item === 'object') ? item[propertyAccessor] : item;
    };

    const targetValue = getComparableValue(searchKey);

    let lowIndex = 0;
    let highIndex = sortedArray.length;

    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      const midValue = getComparableValue(sortedArray[midIndex]);

      if (midValue < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
const util = new UtilityToolkit();

class StandardInputReader {
  constructor() {
    this.currentCursorPosition = 0;
    this.#loadAllInputData();
  }

  #loadAllInputData() {
    const fileSystemModule = require("fs");
    const inputFilePath = "/dev/stdin";
    const fileContent = fileSystemModule.readFileSync(inputFilePath, "utf8");
    this.inputLines = fileContent.split('\n');
    return this.inputLines;
  }

  getLines(numberOfLines) {
    if (numberOfLines) {
      if (numberOfLines <= 0) {
        return [];
      }
      const retrievedLines = this.inputLines.slice(this.currentCursorPosition, this.currentCursorPosition + numberOfLines);
      this.currentCursorPosition += numberOfLines;
      return retrievedLines;
    }
    const singleLine = this.inputLines[this.currentCursorPosition];
    this.currentCursorPosition++;
    return singleLine;
  }

  getNextInteger() {
    const lineContent = this.getLines();
    return parseInt(lineContent, 10);
  }
  getNextStringArray() { return this.getLines().split(' '); }
  getNextIntegerArray() { return this.getNextStringArray().map((element) => parseInt(element, 10)); }
  getNextFloatArray() { return this.getNextStringArray().map((element) => parseFloat(element)); }
  getMultiLineIntegers(count) { return this.getLines(count).map((line) => parseInt(line, 10)) }
  getMultiLineFloats(count) { return this.getLines(count).map((line) => parseFloat(line)) }
  getMultiLineStringMatrix(count) { return this.getLines(count).map((line) => line.split(' ')); }
  getMultiLineIntegerMatrix(count) {
    return this.getLines(count).map((line) => line.split(' ').map((element) => parseInt(element, 10)));
  }
  getMultiLineFloatMatrix(count) {
    return this.getLines(count).map((line) => line.split(' ').map((element) => parseFloat(element)));
  }
}
const stdinReader = new StandardInputReader();

const OutputWriter = (resultValue) => {
  let finalOutputString;
  if (resultValue == null) {
    return;
  }

  switch (resultValue) {
    case true:
      finalOutputString = 'Yes';
      break;
    case false:
      finalOutputString = 'No';
      break;
    default:
      finalOutputString = resultValue;
      break;
  }
  console.log(finalOutputString);
};

OutputWriter(new SolutionProcessor().processInputAndCalculate());
