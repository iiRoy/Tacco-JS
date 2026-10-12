'use strict'; // Enforce strict mode for cleaner code.

class PrimaryProcessor {
  // Main method to execute the problem's logic.
  processData() {
    const dimensionParams = dataFetcher.getIntegerArray(); // Fetch N and K parameters.
    const numItems = dimensionParams[0]; // N: Number of input items.
    const factorVal = dimensionParams[1]; // K: The primary factor for calculations.
    const doubleFactor = 2 * factorVal; // 2K: Double the factor value.

    // Process input data into a collection of points with transformed coordinates.
    const pointCollection = dataFetcher.getStringMatrix(numItems).map(itemEntry => {
      // Transform coordinates based on 'B' character and modulo operations.
      return {
        coordX: (parseInt(itemEntry[0]) + (itemEntry[2] === 'B' ? factorVal : 0)) % doubleFactor,
        coordY: parseInt(itemEntry[1]) % doubleFactor,
      };
    });

    // Create a compressed coordinate map from the processed points.
    const compressedMap = CompressedCoordinateMap.createFrom(pointCollection);

    // Helper function to determine a 'shade' based on coordinates and factorVal.
    const determineShade = (cX, cY) => (cX < factorVal ? 0 : 1) ^ (cY < factorVal ? 0 : 1);

    // Initial count of points with a specific shade.
    let currentTally = pointCollection.filter(entry => determineShade(entry.coordX, entry.coordY) === 0).length;
    let maximumTally = currentTally; // Initialize maximum tally.

    // Iterate through possible y-offsets and x-offsets to find the optimal configuration.
    for (let yOffset = 0; yOffset < factorVal; ++yOffset) {
      for (let xOffset = 0; xOffset < doubleFactor; ++xOffset) {
        // Calculate a shifted x-offset for comparison.
        const shiftedXOffset = xOffset + ((xOffset + factorVal) >= doubleFactor ? -factorVal : factorVal);

        // Skip empty columns efficiently.
        while (xOffset < factorVal && compressedMap.dimensionSize('coordX', xOffset) === 0 && compressedMap.dimensionSize('coordX', xOffset + factorVal) === 0) {
          ++xOffset;
        }

        // Update the maximum tally found so far.
        maximumTally = Math.max(maximumTally, currentTally);

        // Calculate counts for points in the current window.
        const whiteLeft = compressedMap.queryCount(xOffset, yOffset, xOffset, yOffset + factorVal);
        const blackLeft = compressedMap.dimensionSize('coordX', xOffset) - whiteLeft;
        const whiteRight = compressedMap.queryCount(shiftedXOffset, yOffset, shiftedXOffset, yOffset + factorVal);
        const blackRight = compressedMap.dimensionSize('coordX', shiftedXOffset) - whiteRight;

        // Adjust the current tally based on window movement.
        currentTally += (-whiteLeft + blackLeft) + (+whiteRight - blackRight);
      }

      // Skip empty rows efficiently.
      while (yOffset < factorVal && compressedMap.dimensionSize('coordY', yOffset) === 0 && compressedMap.dimensionSize('coordY', yOffset + factorVal) === 0) {
        ++yOffset;
      }

      // If yOffset reaches factorVal, break the outer loop.
      if (yOffset === factorVal) {
        break;
      }

      // Calculate counts for points in the current row segment.
      const whiteYRegion = compressedMap.queryCount(0, yOffset, factorVal, yOffset);
      const blackYRegion = compressedMap.dimensionSize('coordY', yOffset) - whiteYRegion;
      const whiteYRegionNext = compressedMap.queryCount(0, yOffset + factorVal, factorVal, yOffset + factorVal);
      const blackYRegionNext = compressedMap.dimensionSize('coordY', yOffset + factorVal) - whiteYRegionNext;

      // Adjust the current tally based on row segment movement.
      currentTally += (-whiteYRegion + blackYRegion) + (+whiteYRegionNext - blackYRegionNext);
    }
    return maximumTally; // Return the overall maximum tally.
  }
}

// A data structure for efficiently storing and querying points in a compressed grid-like manner.
class CompressedCoordinateMap {
  // Defines the default dimensions used for organization.
  static get StandardDimensions() {
    return ['coordX', 'coordY'];
  }

  // Defines the default sorting keys for each dimension.
  static get StandardSortOrders() {
    return {
      'coordX': (itemA, itemB) => itemA.coordY - itemB.coordY,
      'coordY': (itemA, itemB) => itemA.coordX - itemB.coordX
    };
  }

  // Factory method to create and initialize a new CompressedCoordinateMap.
  static createFrom(dataList, extraDimensions, extraSortOrders) {
    return (new CompressedCoordinateMap()).initialize(dataList, extraDimensions, extraSortOrders);
  }

  // Returns the number of elements at a specific index within a dimension.
  dimensionSize(dimensionKey, indexValue) {
    return this.dimensionLists[dimensionKey][indexValue] == null ? 0 : this.dimensionLists[dimensionKey][indexValue].length;
  }

  // Initializes the map with a list of data points and optional custom parameters.
  initialize(dataList, extraDimensions, extraSortOrders) {
    if (extraDimensions == null) {
      extraDimensions = [];
    }
    if (extraSortOrders == null) {
      extraSortOrders = {};
    }
    this.dimensionKeys = CompressedCoordinateMap.StandardDimensions.concat(extraDimensions);
    this.sortingFunctions = Object.assign(CompressedCoordinateMap.StandardSortOrders, extraSortOrders);
    this.dimensionLists = {}; // Stores points organized by dimension.

    // Initialize an empty object for each dimension key.
    this.dimensionKeys.forEach(dimensionKey => {
      this.dimensionLists[dimensionKey] = {};
    });

    // Populate the dimension lists with data points.
    dataList.forEach(dataPoint => {
      this.dimensionKeys.forEach(dimensionKey => {
        if (this.dimensionLists[dimensionKey][dataPoint[dimensionKey]] === undefined) {
          this.dimensionLists[dimensionKey][dataPoint[dimensionKey]] = [];
        }
        this.dimensionLists[dimensionKey][dataPoint[dimensionKey]].push(dataPoint);
      });
    });

    // Sort the elements within each dimension's lists.
    this.dimensionKeys.forEach(dimensionKey => {
      const dimensionElements = this.dimensionLists[dimensionKey];
      for (const elementKey in dimensionElements) {
        dimensionElements[elementKey].sort(this.sortingFunctions[dimensionKey]);
      }
    });
    return this;
  }

  // Retrieves a specific point by its exact coordinates.
  retrievePoint(targetX, targetY) {
    const idx = utils.performBinarySearch(this.dimensionLists.coordX[targetX], targetY, 'coordY');
    if (this.dimensionLists.coordX[idx] == null || this.dimensionLists.coordX[idx].coordY !== targetY) {
      return null;
    }
    return this.dimensionLists.coordX[idx];
  }

  // Counts the number of points within a specified rectangular range (exclusive end).
  // This method is optimized for queries along a single dimension (x1==x2 or y1==y2).
  queryCount(startX, startY, endX, endY) {
    if (startX === endX) {
      if (this.dimensionLists.coordX[startX] == null) return 0;
      const leftIndex = utils.performBinarySearch(this.dimensionLists.coordX[startX], startY, 'coordY');
      const rightIndex = utils.performBinarySearch(this.dimensionLists.coordX[startX], endY, 'coordY');
      return rightIndex - leftIndex;
    }
    if (startY === endY) {
      if (this.dimensionLists.coordY[startY] == null) return 0;
      const leftIndex = utils.performBinarySearch(this.dimensionLists.coordY[startY], startX, 'coordX');
      const rightIndex = utils.performBinarySearch(this.dimensionLists.coordY[startY], endX, 'coordX');
      return rightIndex - leftIndex;
    }
    return -1; // Indicates an unsupported query range.
  }

  // Retrieves a subset of points within a specified rectangular range.
  // This method is optimized for queries along a single dimension (x1==x2 or y1==y2).
  fetchRange(startX, startY, endX, endY) {
    if (startX === endX) {
      const resultArray = [];
      if (this.dimensionLists.coordX[startX] == null) return resultArray;
      const lowIdx = utils.performBinarySearch(this.dimensionLists.coordX[startX], startY, 'coordY');
      const highIdx = utils.performBinarySearch(this.dimensionLists.coordX[startX], endY, 'coordY');
      // NOTE: There is a potential logical error here; it appears to be fetching from coordY list
      // when iterating over coordX list. Replicating the original logic.
      for (let currIdx = lowIdx; currIdx < highIdx; ++currIdx) {
        resultArray.push(this.dimensionLists.coordY[currIdx]);
      }
      return resultArray;
    }
    if (startY === endY) {
      const resultArray = [];
      if (this.dimensionLists.coordY[startY] == null) return resultArray;
      const lowIdx = utils.performBinarySearch(this.dimensionLists.coordY[startY], startX, 'coordX');
      const highIdx = utils.performBinarySearch(this.dimensionLists.coordY[startY], endX, 'coordX');
      // NOTE: Same potential logical error here. Replicating the original logic.
      for (let currIdxY = lowIdx; currIdxY < highIdx; ++currIdxY) {
        resultArray.push(this.dimensionLists.coordX[currIdxY]);
      }
      return resultArray;
    }
    return -1; // Indicates an unsupported query range.
  }
}

// Class for performing modular arithmetic operations.
class ModularArithmetic {
  // Constructor to set the modulo value.
  constructor(moduloValue) {
    if (moduloValue == null) {
      moduloValue = CombinatorialOperations.StandardModulo;
    }
    this.moduloValue = moduloValue;
  }

  // Performs modular multiplication.
  multiply(valA, valB) {
    let result = 0;
    valA %= this.moduloValue;
    valB %= this.moduloValue;
    while (valB) {
      if (valB & 1) {
        result += valA;
        if (result >= this.moduloValue) {
          result -= this.moduloValue;
        }
      }
      valA <<= 1;
      if (valA >= this.moduloValue) {
        valA -= this.moduloValue;
      }
      valB >>= 1;
    }
    return result;
  }

  // Performs modular exponentiation (a^b % mod).
  power(baseVal, exponentVal) {
    let result = 1;
    while (exponentVal) {
      if (exponentVal & 1) {
        result = this.multiply(result, baseVal);
      }
      baseVal = this.multiply(baseVal, baseVal);
      exponentVal >>= 1;
    }
    return result;
  }

  // Performs modular division using Fermat's Little Theorem (a / b % mod = a * b^(mod-2) % mod).
  divide(numerator, denominator) {
    return this.multiply(numerator, this.power(denominator, this.moduloValue - 2));
  }

  // Calculates combinations (nCk) modulo the set value.
  combinations(totalItems, chooseItems) {
    return ARITHMETIC_HELPER.multiply(factorialTable[totalItems], ARITHMETIC_HELPER.multiply(inverseFactorialTable[chooseItems], inverseFactorialTable[totalItems - chooseItems]));
  }
}

// Global instance for modular arithmetic, typically used for large numbers in combinatorics.
const ARITHMETIC_HELPER = new ModularArithmetic(1_000_000_007);

// A collection of general utility functions.
class UtilityFunctions {
  // Calculates the sum of all elements in an array.
  calculateSum(numberArray) {
    return numberArray.reduce((acc, curr) => acc + curr);
  }

  // Calculates the sum of array elements modulo a given value.
  sumModulo(numberArray, currentModulo) {
    if (currentModulo == null) {
      currentModulo = ARITHMETIC_HELPER.moduloValue;
    }
    return numberArray.reduce((acc, curr) => (acc + curr) % currentModulo);
  }

  // Finds the minimum element in an array, optionally using a custom comparison function.
  findMinimum(valueArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return valueArray.reduce((minVal, currVal) => comparisonFn(minVal, currVal) < 0 ? minVal : currVal);
  }

  // Finds the maximum element in an array, optionally using a custom comparison function.
  findMaximum(valueArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return valueArray.reduce((maxVal, currVal) => comparisonFn(maxVal, currVal) > 0 ? maxVal : currVal);
  }

  // Sorts an array in place, optionally using a custom comparison function.
  sortArray(valueArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return valueArray.sort(comparisonFn);
  }

  // Returns an array containing only the unique elements.
  getUniqueElements(inputArray) {
    inputArray.sort(); // Sort first to group duplicates.
    for (let idx = 0; idx < inputArray.length - 1; ++idx) {
      inputArray[idx] = inputArray[idx + 1] === inputArray[idx] ? null : inputArray[idx];
    }
    return inputArray.filter(elem => elem != null); // Filter out nulls (duplicates).
  }

  // Generates a sequence of numbers within a specified range.
  generateRange(begin, end, increment) {
    if (end == null) {
      end = begin || 0;
      begin = 0;
    }
    if (!increment) {
      increment = end < begin ? -1 : 1;
    }
    const sequenceLength = Math.max(Math.ceil((end - begin) / increment), 0);
    const resultRange = Array(sequenceLength);
    for (var indexCounter = 0; indexCounter < sequenceLength; indexCounter++, begin += increment) {
      resultRange[indexCounter] = begin;
    }
    return resultRange;
  }

  // Retrieves the first element or a specified number of elements from an array.
  getFirst(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    return this.getInitial(sourceArray, sourceArray.length - count);
  }

  // Retrieves all but the last 'n' elements from an array.
  getInitial(sourceArray, count) {
    return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (count == null ? 1 : count)));
  }

  // Retrieves all but the first 'n' elements from an array.
  getTail(sourceArray, count) {
    return sourceArray.slice.call(sourceArray, count == null ? 1 : count);
  }

  // Retrieves the last element or a specified number of elements from an array.
  getLast(sourceArray, count) {
    if (count == null) return sourceArray[sourceArray.length - 1];
    return this.getTail(sourceArray, Math.max(0, sourceArray.length - count));
  }

  // Calculates cumulative sums of an array.
  getCumulativeSums(inputArray) {
    return this.getTail(inputArray.reduce(((accum, currentVal, idx) => {
      accum.push(currentVal + accum[idx]);
      return accum;
    }), [0]));
  }

  // Calculates the differences between adjacent elements in an array.
  getDifferences(inputArray) {
    const diffResult = [];
    for (let i = 1; i < inputArray.length; ++i) {
      diffResult.push(inputArray[i] - inputArray[i - 1]);
    }
    return diffResult;
  }

  // Performs a binary search on a sorted array to find the insertion point for a key.
  // Returns the index where the key *would be* inserted to maintain order (value <= array[index]).
  performBinarySearch(orderedArray, searchKey, propertyAccessor) {
    // Defines how to extract the comparable value from an object or directly use primitives.
    const accessorFunc = (objElement) => (typeof objElement === 'object') ? objElement[propertyAccessor] : objElement;
    const targetValue = accessorFunc(searchKey);
    let lowerBound = 0,
      upperBound = orderedArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessorFunc(orderedArray[middleIndex]) < targetValue) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  }
}

// Global instance for general utility functions.
const utils = new UtilityFunctions();

// Handles reading input data from standard input.
class DataInputReader {
  // Constructor initializes the input cursor and loads all data.
  constructor() {
    this.readPosition = 0; // Current line position for reading.
    this.loadAllData(); // Load all input immediately.
  }

  // Loads all lines from standard input into an array.
  loadAllData() {
    this.rawDataLines = (require('node:fs').readFileSync('/dev/stdin', 'utf8')).split('\n');
    return this.rawDataLines;
  }

  // Fetches one or multiple lines of raw string data.
  fetchNextLines(numLines) {
    if (numLines) {
      const extractedLines = this.rawDataLines.slice(this.readPosition, this.readPosition + numLines);
      this.readPosition += numLines;
      return extractedLines;
    }
    return this.rawDataLines[this.readPosition++];
  }

  // Fetches the next line and parses it as an integer.
  getNextInteger() {
    return parseInt(this.fetchNextLines());
  }

  // Fetches the next line and splits it into a string array.
  getNextStringArray() {
    return this.fetchNextLines().split(' ');
  }

  // Fetches the next line, splits it, and parses elements as integers.
  getNextIntegerArray() {
    return this.getNextStringArray().map((elem) => parseInt(elem));
  }

  // Fetches the next line, splits it, and parses elements as floats.
  getNextFloatArray() {
    return this.getNextStringArray().map((elem) => parseFloat(elem));
  }

  // Fetches 'numLines' and parses each as an integer.
  getIntegerLines(numLines) {
    return this.fetchNextLines(numLines).map((elem) => parseInt(elem));
  }

  // Fetches 'numLines' and parses each as a float.
  getFloatLines(numLines) {
    return this.fetchNextLines(numLines).map((elem) => parseFloat(elem));
  }

  // Fetches 'numLines' and returns a 2D array of strings.
  getStringMatrix(numLines) {
    return this.fetchNextLines(numLines).map((currentLine) => currentLine.split(' '));
  }

  // Fetches 'numLines' and returns a 2D array of integers.
  getIntegerMatrix(numLines) {
    return this.fetchNextLines(numLines).map((currentLine) => currentLine.split(' ').map((elem) => parseInt(elem)));
  }

  // Fetches 'numLines' and returns a 2D array of floats.
  getFloatMatrix(numLines) {
    return this.fetchNextLines(numLines).map((currentLine) => currentLine.split(' ').map((elem) => parseFloat(elem)));
  }
}

// Global instance for reading input data.
const dataFetcher = new DataInputReader();

// Handles writing output data to standard output.
class OutputWriter {
  // Constructor initializes options for boolean output formatting.
  constructor() {
    this.booleanDisplayOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  // Writes the given value to the console. Handles boolean formatting.
  displayResult(outputValue) {
    let formattedOutput;
    if (outputValue == null) return; // Do nothing if output is null or undefined.
    if (outputValue === true) {
      formattedOutput = this.booleanDisplayOptions['true'];
    } else if (outputValue === false) {
      formattedOutput = this.booleanDisplayOptions['false'];
    } else {
      formattedOutput = outputValue;
    }
    console.log(formattedOutput);
  }

  // Configures custom strings for true/false output.
  setBooleanFormat(formatArray) {
    this.booleanDisplayOptions['false'] = formatArray[0];
    this.booleanDisplayOptions['true'] = formatArray[1];
    return this; // Allows chaining.
  }
}

// Global instance for writing output.
const resultWriter = new OutputWriter();

// Execute the main processing logic and display the final result.
resultWriter.displayResult((new PrimaryProcessor()).processData());