'use strict';

class Solver {
  execute() {
    const problemParameters = inputHandler.readNextIntArray();
    const numAnts = problemParameters[0];
    const trackLength = problemParameters[1];
    const timeElapsed = problemParameters[2];

    const antInitialStates = inputHandler.readIntMatrix(numAnts);

    const doubleTrackLength = 2 * trackLength;

    const calculateFinalPosition = (initialX, direction, time) => {
      const displacement = direction === 1 ? time : -time;
      return (initialX + displacement + doubleTrackLength) % trackLength;
    };

    const finalPositionsRaw = antInitialStates.map(antState =>
      calculateFinalPosition(antState[0], antState[1], timeElapsed)
    );

    let collisionOffset = 0;
    const firstAntInitialState = antInitialStates[0];

    for (let otherAntIndex = 1; otherAntIndex < numAnts; ++otherAntIndex) {
      const currentAntInitialState = antInitialStates[otherAntIndex];

      if (currentAntInitialState[1] === firstAntInitialState[1]) {
        continue;
      }

      let initialRelativeDistance;
      if (firstAntInitialState[1] === 1) {
        initialRelativeDistance = currentAntInitialState[0] - firstAntInitialState[0];
      } else {
        initialRelativeDistance = (trackLength - currentAntInitialState[0]) + firstAntInitialState[0];
      }

      const effectiveMovementDistance = 2 * timeElapsed;
      const numerator = effectiveMovementDistance + trackLength - initialRelativeDistance;
      const effectiveLapsCrossed = Math.floor(numerator / trackLength);

      collisionOffset = (collisionOffset + effectiveLapsCrossed) % numAnts;
    }

    const finalAntPositionsWithOriginalIndices = [];
    const firstAntDirection = firstAntInitialState[1];
    const directionFactor = firstAntDirection === 1 ? 1 : -1;
    const adjustedCollisionOffset = (collisionOffset * directionFactor + numAnts) % numAnts;

    for (let i = 0; i < numAnts; ++i) {
      const originalIndex = i;
      const finalPosition = finalPositionsRaw[i];
      const newLogicalIndex = (originalIndex + adjustedCollisionOffset + numAnts) % numAnts;
      finalAntPositionsWithOriginalIndices.push([newLogicalIndex, finalPosition]);
    }

    finalAntPositionsWithOriginalIndices.sort((a, b) => a[0] - b[0]);

    return finalAntPositionsWithOriginalIndices.map(entry => entry[1]).join('\n');
  }
}

class ModularArithmetic {
  constructor(moduloValue) {
    if (moduloValue == null) {
      this.moduloValue = 1e9 + 7;
    } else {
      this.moduloValue = moduloValue;
    }
  }

  multiply(valA, valB) {
    let productAccumulator = 0;
    valA %= this.moduloValue;
    valB %= this.moduloValue;
    while (valB > 0) {
      if (valB % 2 === 1) {
        productAccumulator += valA;
        if (productAccumulator >= this.moduloValue) {
          productAccumulator -= this.moduloValue;
        }
      }
      valA <<= 1;
      if (valA >= this.moduloValue) {
        valA -= this.moduloValue;
      }
      valB >>= 1;
    }
    return productAccumulator;
  }

  power(base, exponent) {
    let result = 1;
    while (exponent > 0) {
      if (exponent % 2 === 1) {
        result = this.multiply(result, base);
      }
      base = this.multiply(base, base);
      exponent >>= 1;
    }
    return result;
  }
}
const MOD_OPERATOR = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  calculateSum(dataArray) { return dataArray.reduce((acc, val) => acc + val, 0); }
  calculateModSum(dataArray, modulo) {
    if (modulo == null) { modulo = MOD_OPERATOR.moduloValue; }
    return dataArray.reduce((acc, val) => (acc + val) % modulo, 0);
  }
  findMin(dataArray, comparisonFunc) {
    if (dataArray.length === 0) return undefined;
    if (comparisonFunc == null) { comparisonFunc = (a, b) => a - b; }
    return dataArray.reduce((minVal, currentVal) => comparisonFunc(minVal, currentVal) < 0 ? minVal : currentVal);
  }
  findMax(dataArray, comparisonFunc) {
    if (dataArray.length === 0) return undefined;
    if (comparisonFunc == null) { comparisonFunc = (a, b) => a - b; }
    return dataArray.reduce((maxVal, currentVal) => comparisonFunc(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }
  sortArray(dataArray, comparisonFunc) {
    if (comparisonFunc == null) { comparisonFunc = (a, b) => a - b; }
    return dataArray.sort(comparisonFunc);
  }
  generateRange(startVal, stopVal, stepVal) {
    if (stopVal == null) { stopVal = startVal || 0; startVal = 0; }
    if (!stepVal) { stepVal = stopVal < startVal ? -1 : 1; }
    const numElements = Math.max(Math.ceil((stopVal - startVal) / stepVal), 0);
    const generatedArray = Array(numElements);
    let currentVal = startVal;
    for (let idx = 0; idx < numElements; idx++) {
      generatedArray[idx] = currentVal;
      currentVal += stepVal;
    }
    return generatedArray;
  }
  getFirstElements(dataArray, count) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return count == null ? undefined : [];
    if (count == null) return dataArray[0];
    return dataArray.slice(0, Math.max(0, count));
  }
  getInitialElements(dataArray, countToExclude) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
    const actualCountToExclude = countToExclude == null ? 1 : countToExclude;
    return dataArray.slice(0, Math.max(0, dataArray.length - actualCountToExclude));
  }
  getTailElements(dataArray, countToSkip) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return [];
    const actualCountToSkip = countToSkip == null ? 1 : countToSkip;
    return dataArray.slice(Math.max(0, actualCountToSkip));
  }
  getLastElements(dataArray, count) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) return count == null ? undefined : [];
    if (count == null) return dataArray[dataArray.length - 1];
    return dataArray.slice(Math.max(0, dataArray.length - count));
  }
  getCumulativeSums(dataArray) {
    const cumulative = [0];
    for (let i = 0; i < dataArray.length; i++) {
      cumulative.push(cumulative[i] + dataArray[i]);
    }
    return this.getTailElements(cumulative);
  }
  getDifferences(dataArray) {
    const differences = [];
    if (dataArray.length < 2) return differences;
    for (let i = 1; i < dataArray.length; ++i) {
      differences.push(dataArray[i] - dataArray[i - 1]);
    }
    return differences;
  }
  performBinarySearch(dataArray, searchKey, accessorKey) {
    const getComparableValue = (item) => (typeof item === 'object' && accessorKey != null) ? item[accessorKey] : item;
    const targetValue = getComparableValue(searchKey);

    let lowIndex = 0;
    let highIndex = dataArray.length;

    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getComparableValue(dataArray[midIndex]) < targetValue) {
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
    this.readAllInput();
  }

  readAllInput() {
    this.inputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputLines;
  }

  readNextLine(numLines) {
    if (numLines) {
      const linesToReturn = this.inputLines.slice(this.readCursor, this.readCursor + numLines);
      this.readCursor += numLines;
      return linesToReturn;
    }
    if (this.readCursor >= this.inputLines.length) {
      return null;
    }
    return this.inputLines[this.readCursor++];
  }

  readNextInt() {
    const line = this.readNextLine();
    return line != null ? parseInt(line, 10) : NaN;
  }

  readNextStringArray() {
    const line = this.readNextLine();
    return line != null ? line.split(' ') : [];
  }

  readNextIntArray() {
    return this.readNextStringArray().map((element) => parseInt(element, 10));
  }

  readNextFloatArray() {
    return this.readNextStringArray().map((element) => parseFloat(element));
  }

  readIntLines(numLines) {
    const lines = this.readNextLine(numLines);
    return lines != null ? lines.map((line) => parseInt(line, 10)) : [];
  }

  readFloatLines(numLines) {
    const lines = this.readNextLine(numLines);
    return lines != null ? lines.map((line) => parseFloat(line)) : [];
  }

  readStringMatrix(numRows) {
    const lines = this.readNextLine(numRows);
    return lines != null ? lines.map((line) => line.split(' ')) : [];
  }

  readIntMatrix(numRows) {
    const lines = this.readNextLine(numRows);
    return lines != null ? lines.map((line) => line.split(' ').map((element) => parseInt(element, 10))) : [];
  }

  readFloatMatrix(numRows) {
    const lines = this.readNextLine(numRows);
    return lines != null ? lines.map((line) => line.split(' ').map((element) => parseFloat(element))) : [];
  }
}
const inputHandler = new InputReader();

const OutputWriter = (resultData) => {
  let formattedOutput;
  if (resultData == null) return;

  switch (resultData) {
    case true:
      formattedOutput = 'Yes';
      break;
    case false:
      formattedOutput = 'No';
      break;
    default:
      formattedOutput = resultData;
  }
  console.log(formattedOutput);
};

OutputWriter(new Solver().execute());
