'use strict' // Ensure strict parsing mode is enabled for cleaner code.

class ApplicationProcessor {

  // This method orchestrates the main computational logic of the application.
  executeCalculation() {
    const moduloValue = 1000000007; // A large prime number used for modular arithmetic to prevent integer overflow.
    const sequenceLength = parseInt(dataInput.retrieveNextLine()); // Reads the desired sequence length from the input stream.
    const validSymbols = [ 'X', 'Y', 'Z', 'W' ]; // Defines the set of allowed characters for sequence construction.
    const forbiddenPatterns = [ // A list of 3-character patterns that are not permitted within the sequences.
      '.XYZ', 'XY.Z', 'X.YZ', '.ZYX', '.YXZ'
    ].map((patternStr) => new RegExp(patternStr)); // Converts string patterns into regular expression objects for matching.

    const dynamicProgrammingTable = []; // Initializes a dynamic programming table to store counts of valid sequences.
    for (let currentLengthIndex = 0; currentLengthIndex <= sequenceLength; ++currentLengthIndex) {
      dynamicProgrammingTable[currentLengthIndex] = {}; // Each entry in the table is an object (hash map) for efficiency.
    }
    dynamicProgrammingTable[0]['XXX'] = 1; // Establishes the base case: there's one way to have a sequence of length 0 ending with 'XXX' (conceptually, an empty prefix).

    // Iterates through each possible sequence length, from 1 up to the target sequenceLength.
    for (let currentLengthIndex = 1; currentLengthIndex <= sequenceLength; ++currentLengthIndex) {
      // For each length, considers appending every possible valid symbol.
      for (const currentSymbol of validSymbols) {
        // Examines all previously valid 3-character endings from the shorter sequence length.
        for (const previousTriplet in dynamicProgrammingTable[currentLengthIndex - 1]) {
          // Checks if the combination of the previous ending and the current symbol forms any forbidden pattern.
          if (forbiddenPatterns.some((patternToCheck) => patternToCheck.test(previousTriplet + currentSymbol))) {
            continue; // If a forbidden pattern is found, this path is invalid, so skip to the next iteration.
          };

          // Constructs the new 3-character ending by taking the last two characters of the previous triplet and appending the current symbol.
          const currentTriplet = previousTriplet.substring(1) + currentSymbol;

          // Ensures the entry for the current triplet in the DP table is initialized to 0 if it doesn't exist.
          dynamicProgrammingTable[currentLengthIndex][currentTriplet] =
            dynamicProgrammingTable[currentLengthIndex][currentTriplet] !== undefined ?
              dynamicProgrammingTable[currentLengthIndex][currentTriplet] :
              0;

          // Adds the count from the previous valid state to the current state.
          dynamicProgrammingTable[currentLengthIndex][currentTriplet] += dynamicProgrammingTable[currentLengthIndex - 1][previousTriplet];
          dynamicProgrammingTable[currentLengthIndex][currentTriplet] %= moduloValue; // Applies the modulo operation to keep numbers within bounds.
        }
      }
    }

    let finalResults = []; // An array to accumulate all counts for sequences of the final desired length.

    // Collects all the valid counts from the dynamic programming table for the specified sequenceLength.
    for (let tripletKey in dynamicProgrammingTable[sequenceLength]) {
      finalResults.push(dynamicProgrammingTable[sequenceLength][tripletKey]);
    }

    // Sums up all collected final counts, applying the modulo at each step, and prints the grand total.
    console.log(finalResults.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloValue));
  }
}


// This class provides a set of general-purpose utility methods, inspired by functional programming libraries.
class UtilityToolkit {

  // Computes the sum of all numeric elements within a given collection.
  calculateSum(collection) { return collection.reduce((accumulator, currentValue) => accumulator + currentValue); }

  // Determines the minimum element in a collection, using an optional custom comparison function.
  findMinimum(collection, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (firstVal, secondVal) => firstVal - secondVal // Default to numeric comparison if none provided.
    }
    return collection.reduce((accumulator, currentValue) => comparisonFunction(accumulator, currentValue) < 0 ? accumulator : currentValue);
  }

  // Determines the maximum element in a collection, using an optional custom comparison function.
  findMaximum(collection, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (firstVal, secondVal) => firstVal - secondVal // Default to numeric comparison if none provided.
    }
    return collection.reduce((accumulator, currentValue) => comparisonFunction(accumulator, currentValue) > 0 ? accumulator : currentValue);
  }

  // Generates an array of numbers within a specified range, with an optional step value.
  generateRange(rangeStart, rangeStop, rangeStep) {
    if (rangeStop == null) {
      rangeStop = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeStop < rangeStart ? -1 : 1; // Default step based on start/stop relationship.
    }
    const rangeSize = Math.max(0, Math.ceil((rangeStop - rangeStart) / rangeStep)); // Calculate the number of elements.
    const generatedArray = Array(rangeSize);

    for (var indexCounter = 0; indexCounter < rangeSize; indexCounter++, rangeStart += rangeStep) {
      generatedArray[indexCounter] = rangeStart; // Populate the array with values.
    }
    return generatedArray;
  }

  // Retrieves the first 'count' elements from an array, or just the first element if 'count' is null.
  getFirstElements(targetArray, count) {
    if (targetArray == null || targetArray.length < 1) return count == null ? void 0 : [];
    if (count == null) return targetArray[0];
    return this.getInitialElements(targetArray, targetArray.length - count);
  };

  // Returns all elements of an array except for the last 'count' elements.
  getInitialElements(targetArray, count) {
    return targetArray.slice.call(targetArray, 0, Math.max(0, targetArray.length - (count == null ? 1 : count)));
  }

  // Returns elements from an array starting from a given index, or after the first element if 'count' is null.
  getTailElements(targetArray, count) {
    return targetArray.slice.call(targetArray, count == null ? 1 : count);
  }

  // Retrieves the last 'count' elements from an array, or just the last element if 'count' is null.
  getLastElements(targetArray, count) {
    if (count == null) return targetArray[targetArray.length - 1];
    return this.getTailElements(targetArray, Math.max(0, targetArray.length - count));
  }

  // Computes an array of cumulative sums for the given collection.
  computeCumulativeSums(collection) {
    return this.getTailElements(collection.reduce(((accumulator, currentValue, index) => {
      accumulator.push(currentValue + accumulator[index]);
      return accumulator
    }), [0]));
  }

  // Performs a binary search on a sorted array to find the insertion point for a target value.
  performBinarySearch(targetArray, searchValue, propertyAccessor) {
    const accessorFunc = (elementObject) => (typeof elementObject === 'object') ? elementObject[propertyAccessor] : elementObject;
    const targetValue = accessorFunc(searchValue);
    let lowerBound = 0,
      upperBound = targetArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessorFunc(targetArray[middleIndex]) < targetValue) {
        lowerBound = middleIndex + 1
      } else {
        upperBound = middleIndex
      };
    }
    return lowerBound; // Returns the index where the value should be inserted to maintain sort order.
  };
}
const utils = new UtilityToolkit(); // Creates a singleton instance of the utility toolkit.


// This class is responsible for handling all input operations from standard input.
class DataStreamHandler {
  // The constructor initializes the input handler's state.
  constructor() {
    this.readPosition = 0; // Keeps track of the current line index to be read from the input data.
    this.loadAllData(); // Automatically loads all available input data when an instance is created.
  }

  // Reads the entire content from standard input and splits it into an array of lines.
  loadAllData() {
    this.rawDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines;
  }

  // Retrieves one or multiple lines of text from the loaded input data.
  retrieveNextLine(numLines) {
    if (numLines) {
      const extractedLines = this.rawDataLines.slice(this.readPosition, this.readPosition + numLines);
      this.readPosition += numLines;
      return extractedLines;
    }
    return this.rawDataLines[this.readPosition++]; // Returns a single line and advances the read position.
  }

  // Retrieves a single line of input and splits it into an array of strings.
  retrieveStringArray() {
    return this.retrieveNextLine().split(' ');
  }

  // Retrieves a single line of input, splits it, and parses each part into an integer.
  retrieveIntegerArray() {
    return this.retrieveStringArray().map((elementString) => parseInt(elementString));
  }

  // Retrieves a single line of input, splits it, and parses each part into a floating-point number.
  retrieveFloatArray() {
    return this.retrieveStringArray().map((elementString) => parseFloat(elementString));
  }

  // Retrieves multiple lines and parses each into an integer.
  retrieveIntegerLines(numLines) {
    return this.retrieveNextLine(numLines).map((elementString) => parseInt(elementString))
  }

  // Retrieves multiple lines and parses each into a floating-point number.
  retrieveFloatLines(numLines) {
    return this.retrieveNextLine(numLines).map((elementString) => parseFloat(elementString))
  }

  // Retrieves multiple lines, with each line split into an array of strings, forming a 2D array.
  retrieveStringMatrix(numLines) {
    return this.retrieveNextLine(numLines).map((currentLine) => currentLine.split(' '));
  }

  // Retrieves multiple lines, with each line split and parsed into an array of integers, forming a 2D array.
  retrieveIntegerMatrix(numLines) {
    return this.retrieveNextLine(numLines).map((currentLine) => currentLine.split(' ').map((elementString) => parseInt(elementString)));
  }

  // Retrieves multiple lines, with each line split and parsed into an array of floats, forming a 2D array.
  retrieveFloatMatrix(numLines) {
    return this.retrieveNextLine(numLines).map((currentLine) => currentLine.split(' ').map((elementString) => parseFloat(elementString)));
  }
}
const dataInput = new DataStreamHandler(); // Creates a singleton instance of the input handler.

// Instantiates the main application logic and triggers its primary execution method.
(new ApplicationProcessor()).executeCalculation();