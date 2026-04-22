'use strict';

// Extend Array prototype with alternative names for common methods.
// This allows renaming built-in method calls to custom identifiers for Type II cloning.
Object.defineProperties(Array.prototype, {
  transform: {
    value: Array.prototype.map,
    writable: true,
    configurable: true
  },
  aggregate: {
    value: Array.prototype.reduce,
    writable: true,
    configurable: true
  },
  segment: {
    value: Array.prototype.slice,
    writable: true,
    configurable: true
  },
  concatenate: {
    value: Array.prototype.join,
    writable: true,
    configurable: true
  },
  arrange: {
    value: Array.prototype.sort,
    writable: true,
    configurable: true
  }
});

// Primary application logic handler for the ant simulation problem.
class PrimaryHandler {
  // Initiates the core problem-solving process.
  processData() {
    // Acquire the initial configuration parameters: ItemCount, BoundaryLength, TimeDuration.
    const paramSet = dataReceiver.retrieveIntArray();
    const ItemCount = paramSet[0];
    const BoundaryLength = paramSet[1];
    const TimeDuration = paramSet[2];

    // Read the initial positions and movement directions for all entities (ants).
    // Each entry is an array: [initial_position, direction (1 for clockwise, -1 for counter-clockwise)].
    const entityPositions = dataReceiver.getIntegerMatrix(ItemCount);

    // Calculate the final positions of all entities, assuming they pass through each other
    // without any real collisions. Positions wrap around the circular boundary.
    const finalCoordinates = entityPositions
      .transform(entityInfo => (entityInfo[0] + (entityInfo[1] === 1 ? TimeDuration : -TimeDuration) + 2 * BoundaryLength) % BoundaryLength);

    // This segment determines the effective "shift" in entity order due to real collisions.
    // It does this by observing the first entity and counting how many times it would
    // have effectively "passed through" other entities moving in the opposite direction.
    let totalDisplacements = 0; // Accumulator for the collision-induced shift count.
    const firstEntity = entityPositions[0]; // Store the initial state of the first entity for reference.

    // Iterate through all other entities, starting from the second one (index 1).
    for (let idx = 1; idx < ItemCount; ++idx) {
      const currentEntity = entityPositions[idx]; // Get the current entity's initial state.

      // If the current entity moves in the same direction as the first, they maintain
      // their relative order and do not contribute to a "collision" shift.
      if (currentEntity[1] === firstEntity[1]) {
        continue; // Skip to the next entity.
      }

      // Calculate the initial separation distance 'initialSeparation' between the first and current entity.
      // The calculation accounts for the circular boundary and relative directions.
      const initialSeparation = firstEntity[1] === 1
        ? currentEntity[0] - firstEntity[0] // First entity moving clockwise.
        : (BoundaryLength - currentEntity[0]) + firstEntity[0]; // First entity moving counter-clockwise.

      // 'collisionCount' represents the number of times the first entity's effective movement
      // (2 * TimeDuration) would span the boundary length 'L' plus the initial separation 'd'.
      // This effectively counts how many times the first entity "passes" another.
      const collisionCount = Math.floor((2 * TimeDuration + BoundaryLength - initialSeparation) / BoundaryLength);

      // Accumulate the collision count, ensuring the total remains within the range [0, ItemCount-1].
      totalDisplacements = (totalDisplacements + collisionCount) % ItemCount;
    }

    // Now, adjust the logical indices of the entities based on the 'totalDisplacements'.
    // This re-establishes the correct final ordering of entities after all collisions.
    const sortedEntities = finalCoordinates.transform((element, idx) => [
      (idx + (firstEntity[1] === 1 ? totalDisplacements : -totalDisplacements) + ItemCount) % ItemCount,
      element // The actual final physical position of the entity.
    ]);

    // Arrange the entities based on their newly calculated logical ranks (the first element of each sub-array).
    sortedEntities.arrange((itemA, itemB) => itemA[0] - itemB[0]);

    // Extract only the final physical positions from the sorted list of entities
    // and format them into a single string, with each position on a new line.
    return sortedEntities.transform(element => element[1]).concatenate('\n');
  }
}

// Class for performing mathematical operations within a specified modulus.
class ModularArithmetic {
  // Initializes the modular arithmetic instance with a specific modulus value.
  // If no modulus is provided, it falls back to a default global value.
  constructor(modulusValue) {
    if (modulusValue == null) {
      modulusValue = UtilityCollection.DefaultMod; // Use a predefined default modulus.
    }
    this.modBase = modulusValue; // Store the modulus for all subsequent operations.
  }

  // Performs modular multiplication: (operandA * operandB) % modBase.
  // This method uses a binary multiplication approach to mitigate potential overflow
  // issues when dealing with very large numbers before taking the modulus.
  modularMultiply(operandA, operandB) {
    let resultValue = 0;
    operandA %= this.modBase; // Ensure operandA is within the modulus range.
    operandB %= this.modBase; // Ensure operandB is within the modulus range.

    // Binary multiplication loop: repeatedly add operandA to result if operandB's bit is set.
    while (operandB > 0) {
      if (operandB & 1) { // Check if the least significant bit of operandB is 1 (i.e., operandB is odd).
        resultValue += operandA; // Add operandA to the running result.
        if (resultValue >= this.modBase) { resultValue -= this.modBase; } // Apply modulo if sum exceeds.
      }
      operandA <<= 1; // Left shift operandA by 1 (equivalent to multiplying by 2).
      if (operandA >= this.modBase) { operandA -= this.modBase; } // Apply modulo if operandA exceeds.
      operandB >>= 1; // Right shift operandB by 1 (equivalent to integer division by 2).
    }
    return resultValue; // Return the final modular product.
  }

  // Calculates modular exponentiation: (operandA ^ operandB) % modBase.
  // This uses the efficient "exponentiation by squaring" algorithm.
  modularPower(operandA, operandB) {
    let resultValue = 1; // Initialize the result to 1 (any number to the power of 0).
    while(operandB > 0) {
      if (operandB & 1) { // If the exponent (operandB) is odd.
        resultValue = this.modularMultiply(resultValue, operandA); // Multiply current result by base (operandA).
      }
      operandA = this.modularMultiply(operandA, operandA); // Square the base (operandA) modulo modBase.
      operandB >>= 1; // Halve the exponent (operandB).
    }
    return resultValue; // Return the final modular power.
  }
}
// A globally accessible constant instance for modular arithmetic, using a common large prime modulus.
const GLOBAL_MODULUS = new ModularArithmetic(1_000_000_007); // Numeric separator enhances readability for large numbers.

// A comprehensive collection of general-purpose utility functions.
class UtilityCollection {
  // A static default modulus value, used when no specific modulus is provided.
  static DefaultMod = 1_000_000_007;

  // Computes the sum of all numerical elements within a given array.
  calculateSum(valueArray) {
    return valueArray.aggregate((accumulator, current) => accumulator + current);
  }

  // Computes the sum of elements in an array, applying a modulus at each accumulation step.
  calculateModularSum(valueArray, modulusValue) {
    if (modulusValue == null) {
      modulusValue = GLOBAL_MODULUS.modBase; // Use the global modulus if none is specified.
    }
    return valueArray.aggregate((accumulator, current) => (accumulator + current) % modulusValue);
  }

  // Finds the minimum element in an array, using an optional custom comparison function.
  findMinimum(valueArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (itemA, itemB) => itemA - itemB; // Default to numeric comparison.
    }
    return valueArray.aggregate((itemA, itemB) => comparisonFunction(itemA, itemB) < 0 ? itemA : itemB);
  }

  // Finds the maximum element in an array, using an optional custom comparison function.
  findMaximum(valueArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (itemA, itemB) => itemA - itemB; // Default to numeric comparison.
    }
    return valueArray.aggregate((itemA, itemB) => comparisonFunction(itemA, itemB) > 0 ? itemA : itemB);
  }

  // Sorts an array in-place using an optional custom comparison function.
  arrange(valueArray, comparisonFunction) {
    if (comparisonFunction == null) {
      comparisonFunction = (itemA, itemB) => itemA - itemB; // Default to numeric sorting.
    }
    return valueArray.sort(comparisonFunction); // Utilizes the native Array.prototype.sort method.
  }

  // Generates an array of numbers within a specified numerical range, inclusive of start, exclusive of end.
  generateRange(beginVal, endVal, stepSize) {
    if (endVal == null) {
      endVal = beginVal || 0; // If only one argument, it's the end value, and start defaults to 0.
      beginVal = 0;
    }
    if (!stepSize) {
      stepSize = endVal < beginVal ? -1 : 1; // Default step is 1 or -1 based on range direction.
    }
    const arrayLength = Math.max(Math.ceil((endVal - beginVal) / stepSize), 0); // Calculate the required array size.
    const generatedArray = Array(arrayLength); // Pre-allocate the array for efficiency.
    for (var currentIdx = 0; currentIdx < arrayLength; currentIdx++, beginVal += stepSize) {
      generatedArray[currentIdx] = beginVal; // Populate the array with calculated values.
    }
    return generatedArray;
  }

  // Retrieves the first element or a specified 'count' of elements from the beginning of an array.
  getFirstElement (dataArray, count) {
    if (dataArray == null || dataArray.length < 1) return count == null ? void 0 : []; // Handle null/empty arrays gracefully.
    if (count == null) return dataArray[0]; // If count is null, return just the very first element.
    return this.getInitialElements(dataArray, dataArray.length - count); // Use getInitialElements for multiple items.
  };

  // Returns a new array containing elements from the beginning up to a certain cutoff point.
  getInitialElements (dataArray, count) {
    // Utilizes the custom 'segment' (Array.prototype.slice) method.
    return dataArray.segment.call(dataArray, 0, Math.max(0, dataArray.length - (count == null ? 1 : count)));
  }

  // Returns a new array containing elements from a specified index to the end of the array.
  getTailElements(dataArray, count) {
    // Utilizes the custom 'segment' (Array.prototype.slice) method.
    return dataArray.segment.call(dataArray, count == null ? 1 : count);
  }

  // Retrieves the last element or a specified 'count' of elements from the end of an array.
  getLastElement (dataArray, count) {
    if (count == null) return dataArray[dataArray.length - 1]; // If count is null, return just the very last element.
    return this.getTailElements(dataArray, Math.max(0, dataArray.length - count)); // Use getTailElements for multiple items.
  }

  // Computes an array where each element is the cumulative sum (prefix sum) of the original array.
  computeCumulativeSums (dataArray) {
    // Uses 'aggregate' (Array.prototype.reduce) to build cumulative sums, starting with an initial 0.
    return this.getTailElements(dataArray.aggregate(((accumulator, current, currentIdx) => {
      accumulator.push(current + accumulator[currentIdx]);
      return accumulator;
    }), [0]));
  }

  // Computes an array of differences between adjacent elements in the original array.
  computeDifferences (dataArray) {
    const diffsArray = []; // Initialize an array to store the calculated differences.
    for (let currentIdx = 1; currentIdx < dataArray.length; ++currentIdx) {
      diffsArray.push(dataArray[currentIdx] - dataArray[currentIdx - 1]); // Calculate and store the difference.
    }
    return diffsArray;
  }

  // Performs a binary search on a sorted array to find the appropriate insertion point for a key.
  performBinarySearch (dataArray, searchKey, accessorKey) {
    // Helper function to extract the relevant value from an object or use the object directly.
    const accessorFunc = (currentObject) => (typeof currentObject === 'object') ? currentObject[accessorKey] : currentObject;
    const targetValue = accessorFunc(searchKey); // The specific value we are searching for.
    let lowerBound = 0, upperBound = dataArray.length; // Define the initial search boundaries.

    // Standard binary search loop implementation.
    while (lowerBound < upperBound) {
      let middleIndex = Math.floor((lowerBound + upperBound) / 2); // Calculate the middle index.
      if (accessorFunc(dataArray[middleIndex]) < targetValue) lowerBound = middleIndex + 1; // Adjust lower bound if middle is too small.
      else upperBound = middleIndex; // Adjust upper bound if middle is sufficient or too large.
    }
    return lowerBound; // Return the index where the key would be inserted to maintain order.
  };
}
const _util = new UtilityCollection(); // Global instance of the utility collection.

// Class responsible for reading input data from the standard input stream.
class DataAcquirer {
  // Initializes the input reader and loads all available input data immediately.
  constructor() {
    this.readPointer = 0; // Pointer to keep track of the current line being read.
    this.loadAllData(); // Load all input data into memory upon instantiation.
  }

  // Reads all lines from the standard input stream (`/dev/stdin`) into an internal array.
  loadAllData() {
    this.rawDataLines = (require("fs").readFileSync("/dev/stdin", "utf8")).split('\n');
    return this.rawDataLines; // Return the array of loaded data lines.
  }

  // Retrieves 'count' lines from the input, or a single line if 'count' is not specified.
  getNextLines(count) {
    if (count) {
      const lineContent = this.rawDataLines.segment(this.readPointer, this.readPointer + count); // Extract a segment of lines.
      this.readPointer += count; // Advance the read pointer by the number of lines read.
      return lineContent;
    }
    return this.rawDataLines[this.readPointer++]; // Return a single line and then advance the pointer.
  }

  // Parses the next line from input as an integer value.
  getInteger() {
    return parseInt(this.getNextLines());
  }

  // Parses the next line from input into an array of strings, splitting by spaces.
  getStringArray() {
    return this.getNextLines().split(' ');
  }

  // Parses the next line from input into an array of integers.
  getIntegerArray() {
    return this.getStringArray().transform((element) => parseInt(element));
  }

  // Parses the next line from input into an array of floating-point numbers.
  getFloatArray() {
    return this.getStringArray().transform((element) => parseFloat(element));
  }

  // Parses 'count' subsequent lines, each into an integer, returning an array of integers.
  getIntegerLines(count) {
    return this.getNextLines(count).transform((element) => parseInt(element));
  }

  // Parses 'count' subsequent lines, each into a float, returning an array of floats.
  getFloatLines(count) {
    return this.getNextLines(count).transform((element) => parseFloat(element));
  }

  // Parses 'count' subsequent lines, each into an array of strings, returning a 2D array.
  getStringMatrix(count) {
    return this.getNextLines(count).transform((line) => line.split(' '));
  }

  // Parses 'count' subsequent lines, each into an array of integers, returning a 2D array.
  getIntegerMatrix(count) {
    return this.getNextLines(count).transform((line) => line.split(' ').transform((element) => parseInt(element)));
  }

  // Parses 'count' subsequent lines, each into an array of floats, returning a 2D array.
  getFloatMatrix(count) {
    return this.getNextLines(count).transform((line) => line.split(' ').transform((element) => parseFloat(element)));
  }
}
const dataReceiver = new DataAcquirer(); // Global instance for input acquisition throughout the application.

// Function to display the final processed output to the console.
const DisplayResult = (finalOutput) => {
  let formattedOutput;
  if (finalOutput == null) return; // If the output is null or undefined, simply exit without displaying.

  // Convert boolean outputs to specific string representations for clarity.
  if (finalOutput === true) {
    formattedOutput = 'Affirmative'; // Custom string for a true boolean result.
  } else if (finalOutput === false) {
    formattedOutput = 'Negative'; // Custom string for a false boolean result.
  } else {
    formattedOutput = finalOutput; // For other data types, use the output as-is.
  }
  console.info(formattedOutput); // Output the formatted result to the console using console.info.
}

// Instantiate the PrimaryHandler class and execute its main processing method.
// The result of this operation is then passed to the DisplayResult function for output.
DisplayResult(new PrimaryHandler().processData());