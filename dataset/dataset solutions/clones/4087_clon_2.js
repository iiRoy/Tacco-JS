'use strict';

// Main application entry point for solving the problem.
class PrimaryProcessor {

  // Executes the primary calculation logic.
  executeCalculation() {
    // Retrieve problem parameters: N and K.
    const dimensionValues = dataFeeder.retrieveIntArray();
    const countPoints = dimensionValues[0];
    const segmentSize = dimensionValues[1];
    const doubleSegment = 2 * segmentSize;

    // Process input data into a collection of points with adjusted coordinates.
    // Coordinates are normalized relative to `doubleSegment`.
    const pointCollection = dataFeeder.fetchStringGrid(countPoints).map(item => {
      return {
        coordX: (Number(item[0]) + (item[2] === 'B' ? segmentSize : 0)) % doubleSegment,
        coordY: Number(item[1]) % doubleSegment,
      };
    });

    // Initialize a compressed grid structure from the point collection.
    const spatialGrid = CompressedSpace.createFrom(pointCollection);

    // Define a function to determine the "shade" (color) of a coordinate.
    const determineShade = (pos_x, pos_y) => (pos_x < segmentSize ? 0 : 1) ^ (pos_y < segmentSize ? 0 : 1);

    // Calculate initial dominant count based on the shade of points.
    let currentDominant = pointCollection.filter(element => determineShade(element.coordX, element.coordY) === 0).length;
    let maximumDominance = currentDominant;

    // Iterate through possible y-offsets and x-offsets to find the maximum dominant count.
    for (let yOffset = 0; yOffset < segmentSize; ++yOffset) {
      for (let xOffset = 0; xOffset < doubleSegment; ++xOffset) {
        // Skip empty columns efficiently in the x-dimension.
        while (xOffset < segmentSize && spatialGrid.dimensionCount('coordX', xOffset) === 0 && spatialGrid.dimensionCount('coordX', xOffset + segmentSize) === 0) {
          ++xOffset;
        }

        // Update the overall maximum dominance.
        maximumDominance = Math.max(maximumDominance, currentDominant);

        // Calculate counts for the current window based on color and position.
        const whiteLeft = spatialGrid.regionCount(xOffset, yOffset, xOffset, yOffset + segmentSize);
        const blackLeft = spatialGrid.dimensionCount('coordX', xOffset) - whiteLeft;
        const whiteRight = spatialGrid.regionCount((xOffset + segmentSize) % doubleSegment, yOffset, (xOffset + segmentSize) % doubleSegment, yOffset + segmentSize);
        const blackRight = spatialGrid.dimensionCount('coordX', (xOffset + segmentSize) % doubleSegment) - whiteRight;

        // Adjust the current dominant count for the sliding window.
        currentDominant += ((-whiteLeft + blackLeft) + (+whiteRight - blackRight));
      }

      // Skip empty rows efficiently in the y-dimension.
      while (yOffset < segmentSize && spatialGrid.dimensionCount('coordY', yOffset) === 0 && spatialGrid.dimensionCount('coordY', yOffset + segmentSize) === 0) {
        ++yOffset;
      }

      // Break loop if yOffset reaches segmentSize.
      if (yOffset === segmentSize) {
        break;
      }

      // Adjust counts for vertical window slide.
      const whiteLeft = spatialGrid.regionCount(0, yOffset, segmentSize, yOffset);
      const blackLeft = spatialGrid.dimensionCount('coordY', yOffset) - whiteLeft;
      const whiteRight = spatialGrid.regionCount(0, yOffset + segmentSize, segmentSize, yOffset + segmentSize);
      const blackRight = spatialGrid.dimensionCount('coordY', yOffset + segmentSize) - whiteRight;

      currentDominant += ((-whiteLeft + blackLeft) + (+whiteRight - blackRight));
    }

    // Return the highest dominance found.
    return maximumDominance;
  }
} // End of PrimaryProcessor class

// Represents a grid structure optimized for counting points within regions.
class CompressedSpace {

  // Static property for default coordinate parameters.
  static get StandardParameters() {
    return ['coordX', 'coordY'];
  }

  // Static property for default sorting key functions.
  static get StandardSortOrders() {
    return {
      'coordX': (ptA, ptB) => ptA.coordY - ptB.coordY,
      'coordY': (ptA, ptB) => ptA.coordX - ptB.coordX
    };
  }

  // Factory method to create an instance of CompressedSpace.
  static createFrom(initialData, extraParameters, extraSortOrders) {
    return new CompressedSpace().initialize(initialData, extraParameters, extraSortOrders);
  }

  // Returns the number of points at a specific parameter index.
  dimensionCount(paramName, index) {
    return this.dataStructures[paramName][index] == null ? 0 : this.dataStructures[paramName][index].length;
  }

  // Initializes the compressed space with point data.
  initialize(initialData, extraParameters, extraSortOrders) {
    if (extraParameters == null) {
      extraParameters = [];
    }
    if (extraSortOrders == null) {
      extraSortOrders = {};
    }

    this.measurementParams = CompressedSpace.StandardParameters.concat(extraParameters);
    this.orderingFunctions = Object.assign(CompressedSpace.StandardSortOrders, extraSortOrders);

    this.dataStructures = {};
    this.measurementParams.forEach(param => {
      this.dataStructures[param] = {};
    });

    initialData.forEach(element => {
      this.measurementParams.forEach(param => {
        if (this.dataStructures[param][element[param]] === undefined) {
          this.dataStructures[param][element[param]] = [];
        }
        this.dataStructures[param][element[param]].push(element);
      });
    });

    this.dimensionKeys = {};
    this.measurementParams.forEach(param => {
      const currentElements = this.dataStructures[param];
      for (const idxKey in currentElements) {
        currentElements[idxKey].sort(this.orderingFunctions[param]);
      }
      this.dimensionKeys[param] = Object.keys(this.dataStructures[param]);
    });

    return this;
  } // End of initialize method

  // Retrieves a single point by its exact coordinates.
  retrievePoint(coordXval, coordYval) {
    const idx = UTIL.findPosition(this.dataStructures.coordX[coordXval], coordYval, 'coordY');
    if (this.dataStructures.coordX[coordXval] == null || this.dataStructures.coordX[coordXval][idx] == null || this.dataStructures.coordX[coordXval][idx].coordY !== coordYval) {
      return null;
    }
    return this.dataStructures.coordX[coordXval][idx];
  }

  // Counts points within a rectangular region defined by (startX,startY) and (endX,endY).
  // Note: This count is exclusive of endX/endY if x1==x2 or y1==y2.
  regionCount(startX, startY, endX, endY) {
    if (startX === endX) {
      if (this.dataStructures.coordX[startX] == null) return 0;
      const lowerBound = UTIL.findPosition(this.dataStructures.coordX[startX], startY, 'coordY');
      const upperBound = UTIL.findPosition(this.dataStructures.coordX[startX], endY, 'coordY');
      return upperBound - lowerBound;
    }
    if (startY === endY) {
      if (this.dataStructures.coordY[startY] == null) return 0;
      const lowerBound = UTIL.findPosition(this.dataStructures.coordY[startY], startX, 'coordX');
      const upperBound = UTIL.findPosition(this.dataStructures.coordY[startY], endX, 'coordX');
      return upperBound - lowerBound;
    }
    // For general rectangles, the logic is not implemented; returns -1.
    return -1;
  }

  // Fetches points within a specified range (inclusive start, exclusive end).
  fetchRange(startX, startY, endX, endY) {
    if (startX === endX) {
      const resultArray = [];
      if (this.dataStructures.coordX[startX] == null) return resultArray;
      const lowerBound = UTIL.findPosition(this.dataStructures.coordX[startX], startY, 'coordY');
      const upperBound = UTIL.findPosition(this.dataStructures.coordX[startX], endY, 'coordY');
      for (let iterX = lowerBound; iterX < upperBound; ++iterX) {
        resultArray.push(this.dataStructures.coordX[startX][iterX]);
      }
      return resultArray;
    }
    if (startY === endY) {
      const resultArray = [];
      if (this.dataStructures.coordY[startY] == null) return resultArray;
      const lowerBound = UTIL.findPosition(this.dataStructures.coordY[startY], startX, 'coordX');
      const upperBound = UTIL.findPosition(this.dataStructures.coordY[startY], endX, 'coordX');
      for (let iterY = lowerBound; iterY < upperBound; ++iterY) {
        resultArray.push(this.dataStructures.coordY[startY][iterY]);
      }
      return resultArray;
    }
    // For general rectangles, the logic is not implemented; returns -1.
    return -1;
  }
} // End of CompressedSpace class

// Provides modular arithmetic operations.
class ModuloArithmetic {

  // Constructor for the ModuloArithmetic class.
  constructor(modulusVal) {
    if (modulusVal == null) {
      // Default modulus if none is provided.
      modulusVal = MathOperations.StandardModulus;
    }
    this.modulus = modulusVal;
  }

  // Multiplies two numbers modulo this.modulus.
  multiply(valA, valB) {
    let productResult = 0;
    valA %= this.modulus;
    valB %= this.modulus;
    while (valB) {
      if (valB & 1) {
        productResult += valA;
        if (productResult >= this.modulus) {
          productResult -= this.modulus;
        }
      }
      valA <<= 1;
      if (valA >= this.modulus) {
        valA -= this.modulus;
      }
      valB >>= 1;
    }
    return productResult;
  }

  // Computes baseVal raised to the power of exponent modulo this.modulus.
  power(baseVal, exponent) {
    let productResult = 1;
    while (exponent) {
      if (exponent & 1) {
        productResult = this.multiply(productResult, baseVal);
      }
      baseVal = this.multiply(baseVal, baseVal);
      exponent >>= 1;
    }
    return productResult;
  }

  // Divides numerator by denominator modulo this.modulus (using modular inverse).
  divide(numerator, denominator) {
    return this.multiply(numerator, this.power(denominator, this.modulus - 2));
  }

  // Calculates combinations (nCk) modulo this.modulus.
  combinations(totalItems, chosenItems) {
    return ARITHMETIC_MOD.multiply(factorialTable[totalItems], ARITHMETIC_MOD.multiply(inverseFactorialTable[chosenItems], inverseFactorialTable[totalItems - chosenItems]));
  }
}
const ARITHMETIC_MOD = new ModuloArithmetic(1_000_000_007); // Initialize with a common large prime modulus.

// Placeholder for MathOperations class, assumed to exist elsewhere if Combinatorics.DefaultMod is used.
class MathOperations {
  static get StandardModulus() {
    return 1_000_000_007;
  }
}

// Placeholder for factorial tables, assumed to be populated elsewhere.
const factorialTable = [];
const inverseFactorialTable = [];

// A collection of general utility functions.
class UtilityFunctions {

  // Sums all elements in a numeric array.
  calculateSum(numericArray) {
    return numericArray.reduce((acc, val) => acc + val);
  }

  // Sums all elements in a numeric array modulo a given modulus.
  moduloSum(numericArray, modulusVal) {
    if (modulusVal == null) {
      modulusVal = ARITHMETIC_MOD.modulus;
    }
    return numericArray.reduce((acc, val) => (acc + val) % modulusVal);
  }

  // Finds the minimum element in an array using an optional comparison function.
  findMinimum(dataArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((currentMin, currentVal) => comparisonFn(currentMin, currentVal) < 0 ? currentMin : currentVal);
  }

  // Finds the maximum element in an array using an optional comparison function.
  findMaximum(dataArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (valA, valB) => valA - valB;
    }
    return dataArray.reduce((currentMax, currentVal) => comparisonFn(currentMax, currentVal) > 0 ? currentMax : currentVal);
  }

  // Sorts an array using an optional comparison function.
  sortArray(dataArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (valA, valB) => valA - valB;
    }
    return dataArray.sort(comparisonFn);
  }

  // Returns an array containing only unique elements.
  uniqueElements(dataArray) {
    dataArray.sort(); // Sort to group identical elements.
    for (let i = 0; i < dataArray.length - 1; ++i) {
      if (dataArray[i + 1] === dataArray[i]) {
        dataArray[i] = null; // Mark duplicates for removal.
      }
    }
    return dataArray.filter(element => element !== null); // Filter out marked duplicates.
  }

  // Generates a numeric range similar to Python's range function.
  generateRange(startValue, stopValue, stepValue) {
    if (stopValue == null) {
      stopValue = startValue || 0;
      startValue = 0;
    }
    if (!stepValue) {
      stepValue = stopValue < startValue ? -1 : 1;
    }
    const rangeLength = Math.max(Math.ceil((stopValue - startValue) / stepValue), 0);
    const generatedRange = Array(rangeLength);
    for (var indexCounter = 0; indexCounter < rangeLength; indexCounter++, startValue += stepValue) {
      generatedRange[indexCounter] = startValue;
    }
    return generatedRange;
  }

  // Retrieves the first N elements of an array.
  getBeginning(sourceArray, count) {
    if (sourceArray == null || sourceArray.length < 1) return count == null ? undefined : [];
    if (count == null) return sourceArray[0];
    return this.getInitialSegment(sourceArray, sourceArray.length - count);
  }

  // Retrieves an initial segment of an array, excluding the last N elements.
  getInitialSegment(sourceArray, numToExclude) {
    return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (numToExclude == null ? 1 : numToExclude)));
  }

  // Retrieves the remainder of an array after skipping the first N elements.
  getRemaining(sourceArray, numToSkip) {
    return sourceArray.slice.call(sourceArray, numToSkip == null ? 1 : numToSkip);
  }

  // Retrieves the last N elements of an array.
  getEnd(sourceArray, count) {
    if (count == null) return sourceArray[sourceArray.length - 1];
    return this.getRemaining(sourceArray, Math.max(0, sourceArray.length - count));
  }

  // Calculates the cumulative sum of a numeric array.
  cumulativeSum(numericArray) {
    return this.getRemaining(numericArray.reduce(((accum, currentVal, index) => {
      accum.push(currentVal + accum[index]);
      return accum;
    }), [0]));
  }

  // Calculates the difference between adjacent elements in a numeric array.
  differenceArray(numericArray) {
    const diffs = [];
    for (let i = 1; i < numericArray.length; ++i) {
      diffs.push(numericArray[i] - numericArray[i - 1]);
    }
    return diffs;
  }

  // Performs a binary search on a sorted array to find the insertion point.
  // Returns the index where 'searchKey' would be inserted to maintain sorted order.
  findPosition(sortedArray, searchKey, propertyName) {
    const accessorFn = (dataObject) => (typeof dataObject === 'object') ? dataObject[propertyName] : dataObject;
    const targetValue = accessorFn(searchKey);
    let lowerBound = 0,
      upperBound = sortedArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessorFn(sortedArray[middleIndex]) < targetValue) lowerBound = middleIndex + 1;
      else upperBound = middleIndex;
    }
    return lowerBound;
  }
}
const UTIL = new UtilityFunctions(); // Global instance of UtilityFunctions.

// Handles reading input data from standard input.
class DataReader {

  // Constructor initializes the data reader.
  constructor() {
    this.readPointer = 0; // Pointer to the current line being read.
    this.loadAllData(); // Load all input data immediately.
  }

  // Loads all lines from standard input into memory.
  loadAllData() {
    this.rawDataLines = (require('node:fs').readFileSync('/dev/stdin', {
      encoding: 'utf8'
    })).split('\n');
    return this.rawDataLines;
  }

  // Reads one or multiple lines from input.
  readNextLine(numLines) {
    if (numLines) {
      const segment = this.rawDataLines.slice(this.readPointer, this.readPointer + numLines);
      this.readPointer += numLines;
      return segment;
    }
    return this.rawDataLines[this.readPointer++];
  }

  // Reads the next line as a single integer.
  readNextInt() {
    return Number(this.readNextLine());
  }

  // Reads the next line as an array of strings.
  readStringArray() {
    return this.readNextLine().split(' ');
  }

  // Reads the next line as an array of integers.
  readIntArray() {
    return this.readStringArray().map((item) => Number(item));
  }

  // Reads the next line as an array of floating-point numbers.
  readFloatArray() {
    return this.readStringArray().map((item) => parseFloat(item));
  }

  // Reads N lines, each converted to an integer.
  readIntLines(numLines) {
    return this.readNextLine(numLines).map((lineItem) => Number(lineItem));
  }

  // Reads N lines, each converted to a floating-point number.
  readFloatLines(numLines) {
    return this.readNextLine(numLines).map((lineItem) => parseFloat(lineItem));
  }

  // Reads N lines, each split into an array of strings (a grid of strings).
  readStringGrid(numRows) {
    return this.readNextLine(numRows).map((lineItem) => lineItem.split(' '));
  }

  // Reads N lines, each split and converted into an array of integers (a grid of integers).
  readIntGrid(numRows) {
    return this.readNextLine(numRows).map((lineItem) => lineItem.split(' ').map((item) => Number(item)));
  }

  // Reads N lines, each split and converted into an array of floats (a grid of floats).
  readFloatGrid(numRows) {
    return this.readNextLine(numRows).map((lineItem) => lineItem.split(' ').map((item) => parseFloat(item)));
  }
}
const dataFeeder = new DataReader(); // Global instance for reading input.

// Handles writing output data to standard output.
class OutputHandler {

  // Constructor initializes output display options.
  constructor() {
    this.displayOptions = {
      'true': 'Yes',
      'false': 'No',
    };
  }

  // Prints the given result data to the console.
  printResult(resultData) {
    let formattedOutput;
    if (resultData == null) return; // Do nothing if there's no data.

    if (resultData === true) {
      formattedOutput = this.displayOptions['true'];
    } else if (resultData === false) {
      formattedOutput = this.displayOptions['false'];
    } else {
      formattedOutput = resultData; // Use the data as-is if not boolean.
    }
    console.log(formattedOutput);
  }

  // Configures the string representation for boolean true/false.
  configureBooleanOutput(booleanOptions) {
    this.displayOptions['false'] = booleanOptions[0];
    this.displayOptions['true'] = booleanOptions[1];
    return this; // Allow method chaining.
  }
}
const resultPrinter = new OutputHandler(); // Global instance for printing output.

// Execute the main processing and print the final result.
resultPrinter.printResult(new PrimaryProcessor().executeCalculation());