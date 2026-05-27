'use strict';

class ProblemSolver {
  executeSolution() {
    const paramsArray = dataReader.readNextIntArray();
    const sequenceData = dataReader.readNextIntArray();

    const multiplierValue = paramsArray[1];
    const ceilingValue = paramsArray[2];

    const differences = util.calculateDifferences(sequenceData);

    const processedValues = differences.map(diffElement => {
      const productResult = diffElement * multiplierValue;
      return Math.min(productResult, ceilingValue);
    });

    return util.calculateSum(processedValues);
  }
}

class UtilityToolkit {
  calculateSum(inputArray) {
    return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  findMinimum(inputArray, comparisonFn = (a, b) => a - b) {
    if (!inputArray || inputArray.length === 0) return undefined;
    return inputArray.reduce((minVal, currentVal) => comparisonFn(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  findMaximum(inputArray, comparisonFn = (a, b) => a - b) {
    if (!inputArray || inputArray.length === 0) return undefined;
    return inputArray.reduce((maxVal, currentVal) => comparisonFn(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  sortElements(inputArray, comparisonFn = (a, b) => a - b) {
    return [...inputArray].sort(comparisonFn);
  }

  generateRange(startValue, stopValue, stepSize) {
    let actualStart = startValue;
    let actualStop = stopValue;
    let actualStep = stepSize;

    if (actualStop == null) {
      actualStop = actualStart || 0;
      actualStart = 0;
    }
    if (!actualStep) {
      actualStep = actualStop < actualStart ? -1 : 1;
    }

    const rangeLength = Math.max(Math.ceil((actualStop - actualStart) / actualStep), 0);
    const generatedRange = Array(rangeLength);

    let currentElement = actualStart;
    for (let i = 0; i < rangeLength; i++) {
      generatedRange[i] = currentElement;
      currentElement += actualStep;
    }
    return generatedRange;
  }

  getFirstElements(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) {
      return count == null ? undefined : [];
    }
    if (count == null) {
      return sourceArray[0];
    }
    return this.getInitialElements(sourceArray, sourceArray.length - count);
  }

  getInitialElements(sourceArray, count) {
    const elementsToKeep = Math.max(0, sourceArray.length - (count == null ? 1 : count));
    return sourceArray.slice(0, elementsToKeep);
  }

  getTailElements(sourceArray, count) {
    const startIndex = count == null ? 1 : count;
    return sourceArray.slice(startIndex);
  }

  getLastElements(sourceArray, count) {
    if (count == null) {
      return sourceArray[sourceArray.length - 1];
    }
    const startIndex = Math.max(0, sourceArray.length - count);
    return this.getTailElements(sourceArray, startIndex);
  }

  computeCumulativeSum(inputArray) {
    const cumulativeSums = [0];
    for (let i = 0; i < inputArray.length; ++i) {
      cumulativeSums.push(inputArray[i] + cumulativeSums[i]);
    }
    return this.getTailElements(cumulativeSums);
  }

  calculateDifferences(inputArray) {
    const differenceResults = [];
    const arrayLength = inputArray.length;
    for (let i = 1; i < arrayLength; ++i) {
      const currentElement = inputArray[i];
      const previousElement = inputArray[i - 1];
      differenceResults.push(currentElement - previousElement);
    }
    return differenceResults;
  }

  performBinarySearch(sortedArray, searchKey, iterateeProperty) {
    const getIteratedValue = (obj) => {
      if (typeof obj === 'object' && iterateeProperty != null) {
        return obj[iterateeProperty];
      }
      return obj;
    };

    const targetValue = getIteratedValue(searchKey);

    let lowIndex = 0;
    let highIndex = sortedArray.length;

    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      const midElementValue = getIteratedValue(sortedArray[midIndex]);

      if (midElementValue < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }
}
const util = new UtilityToolkit();

class InputHandler {
  constructor() {
    this.readPointer = 0;
    this.loadAllInput();
  }

  loadAllInput() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  fetchNextLines(count) {
    if (count) {
      const endIndex = this.readPointer + count;
      const linesToReturn = this.inputLines.slice(this.readPointer, endIndex);
      this.readPointer = endIndex;
      return linesToReturn;
    }
    return this.inputLines[this.readPointer++];
  }

  readNextInt() {
    const lineContent = this.fetchNextLines();
    return parseInt(lineContent);
  }

  readNextStringArray() {
    const lineContent = this.fetchNextLines();
    return lineContent.split(' ');
  }

  readNextIntArray() {
    const stringArray = this.readNextStringArray();
    return stringArray.map(elementString => parseInt(elementString));
  }

  readNextFloatArray() {
    const stringArray = this.readNextStringArray();
    return stringArray.map(elementString => parseFloat(elementString));
  }

  readIntLines(count) {
    const lines = this.fetchNextLines(count);
    return lines.map(lineContent => parseInt(lineContent));
  }

  readFloatLines(count) {
    const lines = this.fetchNextLines(count);
    return lines.map(lineContent => parseFloat(lineContent));
  }

  readStringMatrix(count) {
    const lines = this.fetchNextLines(count);
    return lines.map(lineContent => lineContent.split(' '));
  }

  readIntMatrix(count) {
    const lines = this.fetchNextLines(count);
    return lines.map(lineContent => lineContent.split(' ').map(elementString => parseInt(elementString)));
  }

  readFloatMatrix(count) {
    const lines = this.fetchNextLines(count);
    return lines.map(lineContent => lineContent.split(' ').map(elementString => parseFloat(elementString)));
  }
}
const dataReader = new InputHandler();

const OutputWriter = (resultValue) => {
  if (resultValue == null) {
    return;
  }

  let formattedOutput;
  if (resultValue === true) {
    formattedOutput = 'Yes';
  } else if (resultValue === false) {
    formattedOutput = 'No';
  } else {
    formattedOutput = resultValue;
  }
  console.log(formattedOutput);
};

OutputWriter(new ProblemSolver().executeSolution());
