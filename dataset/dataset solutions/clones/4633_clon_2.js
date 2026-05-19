'use strict';

class Processor {
  // This method orchestrates the solution logic for the ant problem.
  execute() {
    // Read N, L, T parameters from the input.
    const problemParameters = dataReader.retrieveNextIntegerArray();
    const numberOfAnts = problemParameters[0];
    const trackCircumference = problemParameters[1];
    const timeDuration = problemParameters[2];

    // Read initial positions and directions for all ants.
    const antInitialStates = dataReader.retrieveNextIntegerMatrix(numberOfAnts);

    // Calculate the final position for each ant if they passed through each other.
    // (position + (direction == 1 ? time : -time) + 2 * circumference) % circumference
    const computedFinalPositions = antInitialStates
      .map(antState => (antState[0] + (antState[1] === 1 ? timeDuration : -timeDuration) + 2 * trackCircumference) % trackCircumference);

    // Calculate the number of times the first ant effectively "collides" with other ants.
    // This determines the final relative order shift.
    let totalCollisions = 0;
    const firstAntInitialState = antInitialStates[0];

    // Iterate through other ants to count collisions with the first ant.
    for (let antIndex = 1; antIndex < numberOfAnts; ++antIndex) {
      const currentAntState = antInitialStates[antIndex];

      // If ants move in the same direction, they never collide or pass each other.
      if (currentAntState[1] === firstAntInitialState[1]) {
        continue;
      }

      // Ants effectively move at a relative speed of 2 when moving towards each other.
      // Calculate the initial distance between the first ant and the current ant.
      const relativeInitialDistance = firstAntInitialState[1] === 1
        ? currentAntState[0] - firstAntInitialState[0] // First ant moves right, current ant moves left
        : (trackCircumference - currentAntState[0]) + firstAntInitialState[0]; // First ant moves left, current ant moves right

      // Determine the number of times they would cross paths.
      // The formula 2 * T <= (x - 1)L + d is used to find the maximum x.
      // Rearranging gives (2 * T - d) / L <= x.
      // We add L to 2*T to handle negative results from (2*T - d) before division,
      // ensuring the floor division works correctly for positive results.
      const collisionMultiplier = (2 * timeDuration + trackCircumference - relativeInitialDistance) / trackCircumference | 0;
      
      totalCollisions += collisionMultiplier;
      totalCollisions %= numberOfAnts; // Keep the collision count within the range [0, N-1]
    }

    // Create a list of final ant states, pairing their new logical index with their final physical position.
    // The logical index is shifted based on the total collisions.
    const sortedFinalAnts = computedFinalPositions.map((position, originalIndex) => {
      // Calculate the new logical index for each ant.
      // If the first ant moved right, collisions shift indices positively.
      // If the first ant moved left, collisions shift indices negatively.
      // Add numberOfAnts to ensure the result of modulo is always positive.
      const newLogicalIndex = (originalIndex + (firstAntInitialState[1] === 1 ? totalCollisions : -totalCollisions) + numberOfAnts) % numberOfAnts;
      return [newLogicalIndex, position];
    });

    // Sort the ants by their new logical index.
    sortedFinalAnts.sort((antA, antB) => antA[0] - antB[0]);

    // Extract only the final physical positions and join them with newlines.
    return sortedFinalAnts.map(finalAntState => finalAntState[1]).join('\n');
  }
}

class ModularArithmetic {
  // Initializes the modular arithmetic instance with a given modulo.
  constructor(moduloBase) {
    if (moduloBase == null) {
      // If no modulo is provided, use a default (assuming Combinatorics.DefaultMod is an external constant).
      moduloBase = Combinatorics.DefaultMod;
    }
    this.currentModulo = moduloBase;
  }

  // Performs modular multiplication (a * b) % mod.
  // Uses binary multiplication to prevent overflow for large numbers.
  multiply(factorA, factorB) {
    let productResult = 0;
    factorA %= this.currentModulo;
    factorB %= this.currentModulo;

    while (factorB) {
      if (factorB & 1) { // If the last bit of factorB is 1
        productResult += factorA;
        if (productResult >= this.currentModulo) {
          productResult -= this.currentModulo;
        }
      }
      factorA <<= 1; // Double factorA
      if (factorA >= this.currentModulo) {
        factorA -= this.currentModulo;
      }
      factorB >>= 1; // Halve factorB
    }
    return productResult;
  }

  // Performs modular exponentiation (a^b) % mod.
  // Uses binary exponentiation (exponentiation by squaring).
  power(baseValue, exponentValue) {
    let powerResult = 1;
    while (exponentValue) {
      if (exponentValue & 1) { // If the last bit of exponentValue is 1
        powerResult = this.multiply(powerResult, baseValue);
      }
      baseValue = this.multiply(baseValue, baseValue); // Square the base
      exponentValue >>= 1; // Halve the exponent
    }
    return powerResult;
  }
}
// Global instance for modular arithmetic with a common prime modulo.
const MODULO_CALCULATOR = new ModularArithmetic(1e9 + 7);

class UtilityFunctions {
  // Calculates the sum of all elements in an array.
  calculateSum(inputArray) {
    return inputArray.reduce((accumulator, currentValue) => accumulator + currentValue);
  }

  // Calculates the sum of all elements in an array, modulo a given value.
  calculateModSum(inputArray, moduloVal) {
    if (moduloVal == null) {
      moduloVal = MODULO_CALCULATOR.currentModulo;
    }
    return inputArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % moduloVal);
  }

  // Finds the minimum element in an array using an optional comparison function.
  findMinimum(inputArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return inputArray.reduce((accumulator, currentValue) => comparisonFn(accumulator, currentValue) < 0 ? accumulator : currentValue);
  }

  // Finds the maximum element in an array using an optional comparison function.
  findMaximum(inputArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return inputArray.reduce((accumulator, currentValue) => comparisonFn(accumulator, currentValue) > 0 ? accumulator : currentValue);
  }

  // Sorts an array in place using an optional comparison function.
  sortArray(inputArray, comparisonFn) {
    if (comparisonFn == null) {
      comparisonFn = (a, b) => a - b;
    }
    return inputArray.sort(comparisonFn);
  }

  // Generates a range of numbers.
  // Similar to Python's range: range(stop), range(start, stop), range(start, stop, step).
  generateRange(rangeStart, rangeEnd, rangeStep) {
    if (rangeEnd == null) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeEnd < rangeStart ? -1 : 1;
    }
    const generatedLength = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
    const numberRange = Array(generatedLength);
    for (var indexCounter = 0; indexCounter < generatedLength; indexCounter++, rangeStart += rangeStep) {
      numberRange[indexCounter] = rangeStart;
    }
    return numberRange;
  }

  // Retrieves the first 'elementCount' elements from an array.
  getFirstElements(sourceArray, elementCount) {
    if (sourceArray == null || sourceArray.length < 1) {
      return elementCount == null ? void 0 : [];
    }
    if (elementCount == null) {
      return sourceArray[0];
    }
    return this.getInitialElements(sourceArray, sourceArray.length - elementCount);
  }

  // Retrieves all but the last 'elementCount' elements from an array.
  getInitialElements(sourceArray, elementCount) {
    return sourceArray.slice.call(sourceArray, 0, Math.max(0, sourceArray.length - (elementCount == null ? 1 : elementCount)));
  }

  // Retrieves all but the first 'elementCount' elements from an array.
  getTailElements(sourceArray, elementCount) {
    return sourceArray.slice.call(sourceArray, elementCount == null ? 1 : elementCount);
  }

  // Retrieves the last 'elementCount' elements from an array.
  getLastElements(sourceArray, elementCount) {
    if (elementCount == null) {
      return sourceArray[sourceArray.length - 1];
    }
    return this.getTailElements(sourceArray, Math.max(0, sourceArray.length - elementCount));
  }

  // Computes the cumulative sum array (prefix sums).
  getCumulativeSumArray(inputArray) {
    return this.getTailElements(inputArray.reduce(((accumulator, currentValue, currentIndex) => {
      accumulator.push(currentValue + accumulator[currentIndex]);
      return accumulator;
    }), [0]));
  }

  // Computes the difference array (adjacent element differences).
  getDifferenceArray(inputArray) {
    const differenceArray = [];
    for (let loopIndex = 1; loopIndex < inputArray.length; ++loopIndex) {
      differenceArray.push(inputArray[loopIndex] - inputArray[loopIndex - 1]);
    }
    return differenceArray;
  }

  // Performs a binary search on a sorted array.
  // Can search for a key or a property of objects in the array.
  performBinarySearch(searchArray, targetKey, propertyAccessor) {
    const accessorFunction = (currentItem) => (typeof currentItem === 'object') ? currentItem[propertyAccessor] : currentItem;
    const keyTransformedValue = accessorFunction(targetKey);
    let lowerBound = 0,
      upperBound = searchArray.length;
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2);
      if (accessorFunction(searchArray[middleIndex]) < keyTransformedValue) {
        lowerBound = middleIndex + 1;
      } else {
        upperBound = middleIndex;
      }
    }
    return lowerBound;
  }
}
// Global instance for utility functions.
const util = new UtilityFunctions();

class DataIngestor {
  // Initializes the data reader, setting the cursor and loading all input.
  constructor() {
    this.readPosition = 0;
    this.loadAllData();
  }

  // Reads all input from stdin and splits it into lines.
  loadAllData() {
    this.rawInputLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawInputLines;
  }

  // Retrieves one or more lines from the input.
  retrieveNextLine(lineCount) {
    if (lineCount) {
      const extractedLines = this.rawInputLines.slice(this.readPosition, this.readPosition + lineCount);
      this.readPosition += lineCount;
      return extractedLines;
    }
    return this.rawInputLines[this.readPosition++];
  }

  // Retrieves the next integer from the input.
  retrieveNextInteger() {
    return parseInt(this.retrieveNextLine());
  }

  // Retrieves the next line as an array of strings.
  retrieveNextStringArray() {
    return this.retrieveNextLine().split(' ');
  }

  // Retrieves the next line as an array of integers.
  retrieveNextIntegerArray() {
    return this.retrieveNextStringArray().map((item) => parseInt(item));
  }

  // Retrieves the next line as an array of floating-point numbers.
  retrieveNextFloatArray() {
    return this.retrieveNextStringArray().map((item) => parseFloat(item));
  }

  // Retrieves multiple lines as an array of integers.
  retrieveNextIntegerLines(lineCount) {
    return this.retrieveNextLine(lineCount).map((item) => parseInt(item));
  }

  // Retrieves multiple lines as an array of floating-point numbers.
  retrieveNextFloatLines(lineCount) {
    return this.retrieveNextLine(lineCount).map((item) => parseFloat(item));
  }

  // Retrieves multiple lines as a 2D array of strings.
  retrieveNextStringMatrix(lineCount) {
    return this.retrieveNextLine(lineCount).map((inputLine) => inputLine.split(' '));
  }

  // Retrieves multiple lines as a 2D array of integers.
  retrieveNextIntegerMatrix(lineCount) {
    return this.retrieveNextLine(lineCount).map((inputLine) => inputLine.split(' ').map((item) => parseInt(item)));
  }

  // Retrieves multiple lines as a 2D array of floating-point numbers.
  retrieveNextFloatMatrix(lineCount) {
    return this.retrieveNextLine(lineCount).map((inputLine) => inputLine.split(' ').map((item) => parseFloat(item)));
  }
}
// Global instance for input data reading.
const dataReader = new DataIngestor();

// Function to display the final output.
const DisplayOutput = (dataToDisplay) => {
  let formattedOutput;
  if (dataToDisplay == null) {
    return;
  }
  if (dataToDisplay === true) {
    formattedOutput = 'Yes';
  } else if (dataToDisplay === false) {
    formattedOutput = 'No';
  } else {
    formattedOutput = dataToDisplay;
  }
  console.log(formattedOutput);
};

// Execute the main processing logic and display its result.
DisplayOutput(new Processor().execute());
