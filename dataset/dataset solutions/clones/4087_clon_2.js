'use strict'

// This class handles the primary logic for solving the problem.
class Processor {
  // Executes the main problem-solving algorithm.
  processData() {
    // Read N and K from input.
    const inputValues = dataIngestor.getNextIntArray();
    const pointCount = inputValues[0], gridSize = inputValues[1];
    // Calculate 2*K, which is used frequently.
    const doubleGridSize = 2 * gridSize;

    // Process the input points, adjusting coordinates based on 'B' color and modulo doubleGridSize.
    const pointList = dataIngestor.getNextStringMatrix(pointCount).map(elementData => {
      return {
        coordX: (parseInt(elementData[0]) + (elementData[2] === 'B' ? gridSize : 0)) % doubleGridSize,
        coordY: parseInt(elementData[1]) % doubleGridSize,
      };
    });

    // Create a compressed grid structure from the processed points.
    const dataGrid = CoordinateGrid.createFrom(pointList);

    // Helper function to determine the color based on coordinates.
    // 0 for white, 1 for black.
    const determineColor = (coordX, coordY) => (coordX < gridSize ? 0 : 1) ^ (coordY < gridSize ? 0 : 1);

    // Initialize the current count of points with a specific color.
    let currentCount = pointList.filter(elementData => determineColor(elementData.coordX, elementData.coordY) === 0).length;
    // Initialize the maximum count found so far.
    let maximumCount = currentCount;

    // Iterate through possible shifts in Y-direction.
    for (let deltaY = 0; deltaY < gridSize; ++deltaY) {
      // Iterate through possible shifts in X-direction.
      for (let deltaX = 0; deltaX < doubleGridSize; ++deltaX) {
        // Skip empty columns efficiently.
        while (deltaX < gridSize && dataGrid.dimensionSize('coordX', deltaX) === 0 && dataGrid.dimensionSize('coordX', deltaX + gridSize) === 0) {
          ++deltaX;
        }
        // Update maximum count.
        maximumCount = Math.max(maximumCount, currentCount);

        // Calculate points in the current window for X-dimension.
        const whiteLeft = dataGrid.countPoints(deltaX, deltaY, deltaX, deltaY + gridSize);
        const blackLeft = dataGrid.dimensionSize('coordX', deltaX) - whiteLeft;
        const whiteRight = dataGrid.countPoints((deltaX + gridSize) % doubleGridSize, deltaY, (deltaX + gridSize) % doubleGridSize, deltaY + gridSize);
        const blackRight = dataGrid.dimensionSize('coordX', (deltaX + gridSize) % doubleGridSize) - whiteRight;

        // Adjust current count based on points moving in/out of the window.
        currentCount += (-whiteLeft + blackLeft) + (+whiteRight - blackRight);
      }
      // Skip empty rows efficiently.
      while (deltaY < gridSize && dataGrid.dimensionSize('coordY', deltaY) === 0 && dataGrid.dimensionSize('coordY', deltaY + gridSize) === 0) {
        ++deltaY;
      }
      // If deltaY reaches gridSize, break the outer loop.
      if (deltaY === gridSize) {
        break;
      }

      // Calculate points in the current window for Y-dimension.
      const whiteLeft = dataGrid.countPoints(0, deltaY, gridSize, deltaY);
      const blackLeft = dataGrid.dimensionSize('coordY', deltaY) - whiteLeft;
      const whiteRight = dataGrid.countPoints(0, deltaY + gridSize, gridSize, deltaY + gridSize);
      const blackRight = dataGrid.dimensionSize('coordY', deltaY + gridSize) - whiteRight;

      // Adjust current count based on points moving in/out of the window.
      currentCount += (-whiteLeft + blackLeft) + (+whiteRight - blackRight);
    }
    // Return the overall maximum count.
    return maximumCount;
  }
}

// This class represents a compressed grid structure for efficient point querying.
class CoordinateGrid {
  // Default parameters for dimensions.
  static get DefaultDimensions() {
    return ['coordX', 'coordY'];
  }
  // Default sorting keys for each dimension.
  static get DefaultSortingRules() {
    return { 'coordX': (first, second) => first.coordY - second.coordY, 'coordY': (first, second) => first.coordX - second.coordX };
  }
  // Factory method to create a CoordinateGrid instance.
  static createFrom(pointList, additionalDimensions, additionalSortingRules) {
    return new CoordinateGrid().initializeGrid(pointList, additionalDimensions, additionalSortingRules);
  }
  // Returns the number of points along a specific dimension at a given index.
  dimensionSize(dimensionKey, indexValue) {
    return this.dimensionLists[dimensionKey][indexValue] == null ? 0 : this.dimensionLists[dimensionKey][indexValue].length;
  }
  // Initializes the grid with a list of points.
  initializeGrid(pointList, additionalDimensions, additionalSortingRules) {
    if (additionalDimensions == null) {
      additionalDimensions = [];
    }
    if (additionalSortingRules == null) {
      additionalSortingRules = {};
    }
    // Combine default and additional dimensions/sorting rules.
    this.gridDimensions = CoordinateGrid.DefaultDimensions.concat(additionalDimensions);
    this.sortingRules = Object.assign(CoordinateGrid.DefaultSortingRules, additionalSortingRules);
    this.dimensionLists = {};

    // Initialize lists for each dimension.
    this.gridDimensions.forEach(dimensionKey => {
      this.dimensionLists[dimensionKey] = {};
    });

    // Populate dimension lists with points.
    pointList.forEach(elementData => {
      this.gridDimensions.forEach(dimensionKey => {
        if (this.dimensionLists[dimensionKey][elementData[dimensionKey]] === undefined) {
          this.dimensionLists[dimensionKey][elementData[dimensionKey]] = [];
        }
        this.dimensionLists[dimensionKey][elementData[dimensionKey]].push(elementData);
      });
    });

    this.dimensionKeys = {};
    // Sort points within each dimension and store keys.
    this.gridDimensions.forEach(dimensionKey => {
      const dimensionElements = this.dimensionLists[dimensionKey];
      for (const dimensionKeyName in dimensionElements) {
        dimensionElements[dimensionKeyName].sort(this.sortingRules[dimensionKey]);
      }
      this.dimensionKeys[dimensionKey] = Object.keys(this.dimensionLists[dimensionKey]);
    });
    return this;
  }

  // Retrieves a specific point at (x,y).
  retrievePoint(coordX, coordY) {
    const leftIndex = _UTIL.performBinarySearch(this.dimensionLists.coordX[coordX], coordY, 'coordY');
    if (this.dimensionLists.coordX[leftIndex] == null || this.dimensionLists.coordX[leftIndex].coordY !== coordY) {
      return null;
    }
    return this.dimensionLists.coordX[leftIndex];
  }

  // Counts points within a rectangular region [(x1,y1),(x2,y2)).
  // This method is optimized for counting along a single axis.
  countPoints(x1, y1, x2, y2) {
    if (x1 === x2) {
      if (this.dimensionLists.coordX[x1] == null) return 0;
      const leftIndex = _UTIL.performBinarySearch(this.dimensionLists.coordX[x1], y1, 'coordY');
      const rightIndex = _UTIL.performBinarySearch(this.dimensionLists.coordX[x1], y2, 'coordY');
      return rightIndex - leftIndex;
    }
    if (y1 === y2) {
      if (this.dimensionLists.coordY[y1] == null) return 0;
      const leftIndex = _UTIL.performBinarySearch(this.dimensionLists.coordY[y1], x1, 'coordX');
      const rightIndex = _UTIL.performBinarySearch(this.dimensionLists.coordY[y1], x2, 'coordX');
      return rightIndex - leftIndex;
    }
    // For general rectangular counts, this implementation returns -1 (not supported).
    return -1;
  }

  // Fetches some points within a rectangular region [(x1,y1),(x2,y2)).
  // This method is optimized for fetching along a single axis.
  fetchSome(x1, y1, x2, y2) {
    if (x1 === x2) {
      const resultValue = [];
      if (this.dimensionLists.coordX[x1] == null) return resultValue;
      const leftIndex = _UTIL.performBinarySearch(this.dimensionLists.coordX[x1], y1, 'coordY');
      const rightIndex = _UTIL.performBinarySearch(this.dimensionLists.coordX[x1], y2, 'coordY');
      for (let currentX = leftIndex; currentX < rightIndex; ++currentX) {
        resultValue.push(this.dimensionLists.coordY[currentX]);
      }
      return resultValue;
    }
    if (y1 === y2) {
      const resultValue = [];
      if (this.dimensionLists.coordY[y1] == null) return resultValue;
      const leftIndex = _UTIL.performBinarySearch(this.dimensionLists.coordY[y1], x1, 'coordX');
      const rightIndex = _UTIL.performBinarySearch(this.dimensionLists.coordY[y1], x2, 'coordX');
      for (let currentY = leftIndex; currentY < rightIndex; ++currentY) {
        resultValue.push(this.dimensionLists.coordX[currentY]);
      }
      return resultValue;
    }
    // For general rectangular fetches, this implementation returns -1 (not supported).
    return -1;
  }
}

// Class for performing modular arithmetic operations.
class ModularArithmetic {
  // Constructor initializes with a modulo value.
  constructor(moduloValue) {
    if (moduloValue == null) {
      moduloValue = 1000000007; // Default modulo value.
    }
    this.moduloValue = moduloValue;
  }
  // Multiplies two numbers modulo the stored value.
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
  // Calculates (a^b) modulo the stored value.
  powerMod(operandA, operandB) {
    let resultValue = 1;
    while (operandB) {
      if (operandB & 1) {
        resultValue = this.multiplyMod(resultValue, operandA);
      }
      operandA = this.multiplyMod(operandA, operandA);
      operandB >>= 1;
    }
    return resultValue;
  }
  // Divides a by b modulo the stored value (a * b^(mod-2)).
  divideMod(operandA, operandB) {
    return this.multiplyMod(operandA, this.powerMod(operandB, this.moduloValue - 2));
  }
  // Calculates combinations (nCk) modulo the stored value.
  // Note: factorialTable and inverseFactorialTable are not defined in the original code,
  // so this method would cause an error if called. Preserving original behavior.
  combinationsMod(n, k) {
    return MOD_CALCULATOR.multiplyMod(factorialTable[n], MOD_CALCULATOR.multiplyMod(inverseFactorialTable[k], inverseFactorialTable[n - k]));
  }
}
// Global instance of ModularArithmetic.
const MOD_CALCULATOR = new ModularArithmetic(1000000007);

// A collection of general utility functions, similar to Lodash.
class UtilityFunctions {
  // Calculates the sum of elements in an array.
  calculateSum(inputArray) {
    return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }
  // Calculates the sum of elements in an array modulo a given value.
  calculateModSum(inputArray, moduloValue) {
    if (moduloValue == null) {
      moduloValue = MOD_CALCULATOR.moduloValue;
    }
    return inputArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloValue);
  }
  // Finds the minimum element in an array using an optional comparison function.
  findMinimum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (first, second) => first - second;
    }
    return inputArray.reduce((accumulator, currentValue) => comparisonFunction(accumulator, currentValue) < 0 ? accumulator : currentValue);
  }
  // Finds the maximum element in an array using an optional comparison function.
  findMaximum(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (first, second) => first - second;
    }
    return inputArray.reduce((accumulator, currentValue) => comparisonFunction(accumulator, currentValue) > 0 ? accumulator : currentValue);
  }
  // Sorts an array using an optional comparison function.
  sortArray(inputArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (first, second) => first - second;
    }
    return inputArray.sort(comparisonFunction);
  }
  // Returns an array with unique elements.
  getUnique(inputArray) {
    inputArray.sort(); // Sort first to group duplicates.
    for (let i = 0; i < inputArray.length - 1; ++i) {
      inputArray[i] = inputArray[i + 1] === inputArray[i] ? null : inputArray[i];
    }
    return inputArray.filter(element => element != null);
  }
  // Generates a range of numbers.
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
  // Returns the first N elements of an array.
  getFirstElements(targetArray, countN) {
    if (targetArray == null || targetArray.length < 1) return countN == null ? void 0 : [];
    if (countN == null) return targetArray[0];
    return this.getInitialElements(targetArray, targetArray.length - countN);
  }
  // Returns all but the last N elements of an array.
  getInitialElements(targetArray, countN) {
    return targetArray.slice.call(targetArray, 0, Math.max(0, targetArray.length - (countN == null ? 1 : countN)));
  }
  // Returns all but the first N elements of an array.
  getTailElements(targetArray, countN) {
    return targetArray.slice.call(targetArray, countN == null ? 1 : countN);
  }
  // Returns the last N elements of an array.
  getLastElements(targetArray, countN) {
    if (countN == null) return targetArray[targetArray.length - 1];
    return this.getTailElements(targetArray, Math.max(0, targetArray.length - countN));
  }
  // Calculates prefix sums for an array.
  getPrefixSums(inputArray) {
    return this.getTailElements(inputArray.reduce(((accumulator, currentValue, currentIndex) => {
      accumulator.push(currentValue + accumulator[currentIndex]);
      return accumulator;
    }), [0]));
  }
  // Calculates differences between adjacent elements in an array.
  getDifferences(inputArray) {
    const differenceArray = [];
    for (let i = 1; i < inputArray.length; ++i) {
      differenceArray.push(inputArray[i] - inputArray[i - 1]);
    }
    return differenceArray;
  }
  // Performs a binary search on a sorted array to find the index of the first element
  // greater than or equal to the key.
  performBinarySearch(targetArray, searchValue, iterateeProperty) {
    // Helper function to get the value for comparison.
    const iteratorFunction = (objectItem) => (typeof objectItem === 'object') ? objectItem[iterateeProperty] : objectItem;
    const comparisonValue = iteratorFunction(searchValue);
    let lowerBound = 0, upperBound = targetArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (iteratorFunction(targetArray[middleIndex]) < comparisonValue) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
// Global instance of UtilityFunctions.
const _UTIL = new UtilityFunctions();

// Class for handling input operations.
class DataIngestor {
  // Constructor reads all input data upon instantiation.
  constructor() {
    this.currentCursorPosition = 0;
    this.readAllInput();
  }

  // Reads all input from stdin and splits it into lines.
  readAllInput() {
    this.inputDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.inputDataLines;
  }

  // Reads one or multiple lines of input.
  getNextLine(countN) {
    if (countN) {
      const resultValue = this.inputDataLines.slice(this.currentCursorPosition, this.currentCursorPosition + countN);
      this.currentCursorPosition += countN;
      return resultValue;
    }
    return this.inputDataLines[this.currentCursorPosition++];
  }
  // Reads the next line as a single integer.
  getNextInt() {
    return parseInt(this.getNextLine());
  }
  // Reads the next line as an array of strings.
  getNextStringArray() {
    return this.getNextLine().split(' ');
  }
  // Reads the next line as an array of integers.
  getNextIntArray() {
    return this.getNextStringArray().map((itemValue) => parseInt(itemValue));
  }
  // Reads the next line as an array of floats.
  getNextFloatArray() {
    return this.getNextStringArray().map((itemValue) => parseFloat(itemValue));
  }
  // Reads N lines as an array of integers.
  getNextIntLines(countN) {
    return this.getNextLine(countN).map((itemValue) => parseInt(itemValue));
  }
  // Reads N lines as an array of floats.
  getNextFloatLines(countN) {
    return this.getNextLine(countN).map((itemValue) => parseFloat(itemValue));
  }
  // Reads N lines as a 2D array of strings.
  getNextStringMatrix(countN) {
    return this.getNextLine(countN).map((currentLine) => currentLine.split(' '));
  }
  // Reads N lines as a 2D array of integers.
  getNextIntMatrix(countN) {
    return this.getNextLine(countN).map((currentLine) => currentLine.split(' ').map((itemValue) => parseInt(itemValue)));
  }
  // Reads N lines as a 2D array of floats.
  getNextFloatMatrix(countN) {
    return this.getNextLine(countN).map((currentLine) => currentLine.split(' ').map((itemValue) => parseFloat(itemValue)));
  }
}
// Global instance of DataIngestor.
const dataIngestor = new DataIngestor();

// Class for handling output operations.
class OutputHandler {
  // Constructor initializes default boolean output options.
  constructor() {
    this.outputOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }
  // Displays the given data to the console.
  displayResult(dataToDisplay) {
    let finalOutput;
    if (dataToDisplay == null) return; // Do nothing if input is null/undefined.
    if (dataToDisplay === true) {
      finalOutput = this.outputOptions['true'];
    } else if (dataToDisplay === false) {
      finalOutput = this.outputOptions['false'];
    } else {
      finalOutput = dataToDisplay;
    }
    console.log(finalOutput);
  }
  // Configures custom strings for boolean output.
  configureBooleanOutput(customOptions) {
    this.outputOptions['false'] = customOptions[0];
    this.outputOptions['true'] = customOptions[1];
    return this; // Allow chaining.
  }
}
// Global instance of OutputHandler.
const outputHandler = new OutputHandler();

// Execute the main processing logic and display the result.
outputHandler.displayResult(new Processor().processData());
