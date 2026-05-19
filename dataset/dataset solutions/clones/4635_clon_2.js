'use strict'

// Note: This code processes ant movement on a circular track.
class Processor {
  processData() {
    const paramsArray = inputReader.getNextIntArray();
    const numAnts = paramsArray[0];
    const trackLength = paramsArray[1];
    const timeElapsed = paramsArray[2];

    const antPositionsAndDirections = inputReader.getNextIntMatrix(numAnts)
      .map(currentElement => {
        return {
          position: currentElement[0],
          direction: currentElement[1] === 1 ? 1 : -1
        };
      });

    const finalPositions = antPositionsAndDirections.map(antData =>
      (antData.position + antData.direction * (timeElapsed % trackLength) + trackLength) % trackLength
    );

    // Calculate the total number of collisions for the first ant if ants could pass through each other.
    let collisionCount = 0;
    const firstAntData = antPositionsAndDirections[0];

    for (let antIndex = 1; antIndex < numAnts; ++antIndex) {
      const currentAntData = antPositionsAndDirections[antIndex];
      // If ants move in the same direction, they don't collide.
      if (currentAntData.direction === firstAntData.direction) continue;

      // Determine the initial separation.
      const initialDistance = (firstAntData.direction * (currentAntData.position - firstAntData.position) + trackLength) % trackLength;

      // Effective relative speed is 2.
      // Find the maximum 'collisionCycles' such that 2 * timeElapsed <= (collisionCycles - 1) * trackLength + initialDistance,
      // which simplifies to collisionCycles >= (2 * timeElapsed - initialDistance) / trackLength + 1.
      const collisionCycles = 1 + ((2 * timeElapsed - initialDistance) / trackLength | 0);
      collisionCount += collisionCycles;
      collisionCount %= numAnts;
    }

    const relativeIndex = (firstAntData.direction * collisionCount + numAnts) % numAnts;
    const firstAntFinalPosition = finalPositions[0];

    _util.sortArray(finalPositions);

    let rotationOffset = (firstAntData.direction === 1
      ? _util.performBinarySearch(finalPositions, firstAntFinalPosition + 1) - 1
      : _util.performBinarySearch(finalPositions, firstAntFinalPosition));

    // console.log(finalPositions); // Debugging: Log the sorted final positions.
    // console.log(`${relativeIndex} ${rotationOffset} ${firstAntFinalPosition}`); // Debugging: Log calculated indices and position.
    // const sortedFinalAnts = _util.rotateArray(finalPositions, relativeIndex - rotationOffset); // Alternative rotation logic.
    // const sortedFinalAnts = _util.rotateArray(finalPositions, -1); // Another alternative rotation.
    const sortedFinalAnts = _util.rotateArray(finalPositions, rotationOffset - relativeIndex);

    return sortedFinalAnts.join('\n');
  }
}

class ModularArithmetic {
  constructor(moduloValue) {
    if (moduloValue == null) {
      moduloValue = Combinatorics.DefaultMod;
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
        if (resultValue > this.moduloValue) {
          resultValue -= this.moduloValue;
        }
      }
      operandA <<= 1;
      if (operandA > this.moduloValue) {
        operandA -= this.moduloValue;
      }
      operandB >>= 1;
    }
    return resultValue;
  }

  powerMod(baseValue, exponentValue) {
    let resultValue = 1;
    while (exponentValue) {
      if (exponentValue & 1) {
        resultValue = this.multiplyMod(resultValue, baseValue);
      }
      baseValue = this.multiplyMod(baseValue, baseValue);
      exponentValue >>= 1;
    }
    return resultValue;
  }
}
const MOD_ARITHMETIC = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  calculateSum(inputArray) {
    return inputArray.reduce((acc, current) => acc + current);
  }
  calculateModSum(inputArray, moduloVal) {
    if (moduloVal == null) {
      moduloVal = MOD_ARITHMETIC.moduloValue;
    }
    return inputArray.reduce((acc, current) => (acc + current) % moduloVal);
  }
  findMinimum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB
    }
    return inputArray.reduce((valA, valB) => comparisonFunction(valA, valB) < 0 ? valA : valB);
  }
  findMaximum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB
    }
    return inputArray.reduce((valA, valB) => comparisonFunction(valA, valB) > 0 ? valA : valB);
  }
  sortArray(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (valA, valB) => valA - valB
    }
    return inputArray.sort(comparisonFunction)
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
    const generatedRange = Array(arrayLength);
    for (var currentIndex = 0; currentIndex < arrayLength; currentIndex++, rangeStart += rangeStep) {
      generatedRange[currentIndex] = rangeStart;
    }
    return generatedRange;
  }
  getFirstElements(targetArray, count) {
    if (targetArray == null || targetArray.length < 1) return count == null ? void 0 : [];
    if (count == null) return targetArray[0];
    return this.getInitialElements(targetArray, targetArray.length - count);
  };
  getInitialElements(targetArray, count) {
    return targetArray.slice.call(targetArray, 0, Math.max(0, targetArray.length - (count == null ? 1 : count)));
  }
  getTailElements(targetArray, count) {
    return targetArray.slice.call(targetArray, count == null ? 1 : count);
  }
  getLastElements(targetArray, count) {
    if (count == null) return targetArray[targetArray.length - 1];
    return this.getTailElements(targetArray, Math.max(0, targetArray.length - count));
  }
  getCumulativeSums(inputArray) {
    return this.getTailElements(inputArray.reduce(((acc, current, index) => {
      acc.push(current + acc[index]);
      return acc
    }), [0]));
  }
  getDifferences(inputArray) {
    const diffsArray = [];
    for (let index = 1; index < inputArray.length; ++index) {
      diffsArray.push(inputArray[index] - inputArray[index - 1]);
    }
    return diffsArray;
  }
  // Returns the index of the first element greater than or equal to the search key.
  performBinarySearch(targetArray, searchValue, propertyAccessor) {
    const accessorFunc = (obj) => (typeof obj === 'object') ? obj[propertyAccessor] : obj;
    const targetValue = accessorFunc(searchValue);
    let lowerBound = 0,
      upperBound = targetArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessorFunc(targetArray[middleIndex]) < targetValue) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  };
  // Rotates the array by 'count' positions.
  rotateArray(inputArray, count) {
    count %= inputArray.length;
    if (count < 0) {
      count += inputArray.length;
    }
    return inputArray.slice(count).concat(inputArray.slice(0, count));
  }
}
const _util = new UtilityFunctions();

class DataParser {
  constructor() {
    this.readCursor = 0;
    this.readAllInput();
  }

  readAllInput() {
    this.rawData = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawData;
  }

  /* Reads one or multiple lines as strings. */
  getNextLines(count) {
    if (count) {
      const outputResult = this.rawData.slice(this.readCursor, this.readCursor + count);
      this.readCursor += count;
      return outputResult;
    }
    return this.rawData[this.readCursor++];
  }
  /* Reads a single integer. */
  getNextInt() {
    return parseInt(this.getNextLines());
  }
  /* Reads a line as a string array. */
  getNextStringArray() {
    return this.getNextLines().split(' ');
  }
  /* Reads a line as an integer array. */
  getNextIntArray() {
    return this.getNextStringArray().map((element) => parseInt(element));
  }
  /* Reads a line as a float array. */
  getNextFloatArray() {
    return this.getNextStringArray().map((element) => parseFloat(element));
  }
  /* Reads multiple lines as integer arrays. */
  getNextIntLines(count) {
    return this.getNextLines(count).map((element) => parseInt(element))
  }
  /* Reads multiple lines as float arrays. */
  getNextFloatLines(count) {
    return this.getNextLines(count).map((element) => parseFloat(element))
  }
  /* Reads multiple lines as a 2D string array. */
  getNextStringMatrix(count) {
    return this.getNextLines(count).map((currentLine) => currentLine.split(' '));
  }
  /* Reads multiple lines as a 2D integer array. */
  getNextIntMatrix(count) {
    return this.getNextLines(count).map((currentLine) => currentLine.split(' ').map((element) => parseInt(element)));
  }
  /* Reads multiple lines as a 2D float array. */
  getNextFloatMatrix(count) {
    return this.getNextLines(count).map((currentLine) => currentLine.split(' ').map((element) => parseFloat(element)));
  }
}
const inputReader = new DataParser();

const displayResult = (dataToOutput) => {
  let outputResult;
  if (dataToOutput == null) return;
  if (dataToOutput === true) {
    outputResult = 'Yes';
  } else if (dataToOutput === false) {
    outputResult = 'No';
  } else {
    outputResult = dataToOutput;
  }
  console.log(outputResult);
}

displayResult(new Processor().processData());
