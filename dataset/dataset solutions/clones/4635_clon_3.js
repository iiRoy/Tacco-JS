'use strict';

// This module handles numerical operations within a specific modulus.
class ModularArithmetic {
  constructor(modulusValue) {
    // If no modulus is provided, use a common default large prime number for competitive programming.
    if (modulusValue == null) {
      modulusValue = 1_000_000_007;
    }
    // Validate that the modulus is a positive number.
    if (typeof modulusValue !== 'number' || modulusValue <= 0 || !Number.isInteger(modulusValue)) {
      throw new Error("Modulus must be a positive integer.");
    }
    this.modulus = modulusValue;
  }

  // Multiplies two numbers modulo the stored modulus.
  // This implementation assumes intermediate products (a*b) do not exceed JavaScript's safe integer limit (2^53 - 1).
  // For larger numbers, a more complex algorithm (like the original's bitwise multiplication) would be needed.
  multiply(factorA, factorB) {
    // Ensure inputs are numbers and take their modulo before multiplication
    const termA = Number(factorA) % this.modulus;
    const termB = Number(factorB) % this.modulus;
    // Perform multiplication and then the final modulo operation.
    return (termA * termB) % this.modulus;
  }

  // Calculates (base ^ exponent) modulo the stored modulus using the method of binary exponentiation.
  power(base, exponent) {
    let result = 1;
    let currentBase = Number(base) % this.modulus; // Normalize the base within the modulus
    let exp = Number(exponent);

    // Guard against negative exponents, which are not typically supported in modular exponentiation
    // without involving modular inverse.
    if (exp < 0) {
        throw new Error("Negative exponents are not supported in modular exponentiation directly.");
    }
    // If exponent is zero, the result is 1 (except for 0^0, which is context-dependent; here assume 1).
    if (exp === 0) {
        return 1;
    }

    // Loop while the exponent is greater than zero.
    while (exp > 0) {
      if (exp % 2 === 1) { // If the current bit of the exponent is 1 (exponent is odd)
        result = this.multiply(result, currentBase);
      }
      currentBase = this.multiply(currentBase, currentBase); // Square the base for the next iteration
      exp = Math.floor(exp / 2); // Halve the exponent (integer division)
    }
    return result;
  }
}
// Initialize a global instance of the modular arithmetic engine with a common prime modulus.
const MODULUS_ENGINE = new ModularArithmetic(1_000_000_007);

// A collection of general-purpose utility functions for array manipulation, searching, and numerical operations.
class UtilityToolkit {
  // Calculates the sum of all numeric elements in an array.
  // Returns 0 for non-array or empty inputs after logging a warning.
  calculateSum(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.some(val => typeof val !== 'number' || isNaN(val))) {
        console.warn("`calculateSum` received invalid input: expected an array of numbers.");
        return 0;
    }
    return numericArray.reduce((accumulator, value) => accumulator + value, 0);
  }

  // Calculates the sum of array elements, applying a modulo operation after each addition.
  // Uses the global MODULUS_ENGINE for modular operations by default.
  calculateModSum(numericArray, customMod = MODULUS_ENGINE.modulus) {
    if (!Array.isArray(numericArray) || numericArray.some(val => typeof val !== 'number' || isNaN(val))) {
        console.warn("`calculateModSum` received invalid input: expected an array of numbers.");
        return 0;
    }
    const currentModEngine = new ModularArithmetic(customMod); // Use a new instance for custom mod
    return numericArray.reduce((accumulator, currentValue) =>
      currentModEngine.multiply(accumulator + currentValue, 1), 0); // (a+b)%mod is equivalent to currentModEngine.multiply(a+b, 1)
  }

  // Finds the minimum element in an array based on an optional comparison function.
  // Returns `undefined` for empty arrays.
  findMinimum(dataArray, comparatorFunc = (a, b) => a - b) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return undefined;
    }
    return dataArray.reduce((minVal, currentVal) => comparatorFunc(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  // Finds the maximum element in an array based on an optional comparison function.
  // Returns `undefined` for empty arrays.
  findMaximum(dataArray, comparatorFunc = (a, b) => a - b) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return undefined;
    }
    return dataArray.reduce((maxVal, currentVal) => comparatorFunc(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  // Sorts an array in-place using an optional comparison function.
  // Returns the reference to the sorted array.
  sortArray(targetArray, comparisonFn = (a, b) => a - b) {
    if (!Array.isArray(targetArray)) {
        throw new Error("`sortArray` expects an array as its first argument.");
    }
    return targetArray.sort(comparisonFn); // Modifies the array directly
  }

  // Generates a sequence of numbers.
  // Supports `generateSequence(stop)`, `generateSequence(start, stop)`, and `generateSequence(start, stop, step)`.
  generateSequence(startValue, stopValue, stepSize) {
    let actualStart = 0;
    let actualStop = startValue;
    let actualStep = 1;

    if (stopValue === undefined) { // Case: generateSequence(stop)
      actualStop = startValue;
      actualStart = 0;
    } else { // Case: generateSequence(start, stop, step?)
      actualStart = startValue;
      actualStop = stopValue;
      if (stepSize !== undefined) {
        actualStep = stepSize;
      } else {
        actualStep = actualStop < actualStart ? -1 : 1; // Default step for ascending/descending
      }
    }

    // Prevent infinite loops if step is zero.
    if (actualStep === 0) {
        throw new Error("`step` cannot be zero in `generateSequence`.");
    }

    const sequenceLength = Math.max(0, Math.ceil((actualStop - actualStart) / actualStep));
    // Use `Array.from` with a mapping function for concise array creation.
    return Array.from({ length: sequenceLength }, (_, index) => actualStart + index * actualStep);
  }

  // Performs a binary search on a sorted array to find the appropriate insertion point for a given key.
  // Returns the index where the key *could* be inserted to maintain the sorted order.
  // `propertyAccessor` can be used for arrays of objects.
  findInsertionPoint(sortedArray, searchKey, propertyAccessor = obj => obj) {
    const keyVal = propertyAccessor(searchKey);
    let lowIndex = 0;
    let highIndex = sortedArray.length; // Upper bound is one past the last element

    while (lowIndex < highIndex) {
      // Calculate mid index safely to prevent potential overflow with very large `lowIndex` and `highIndex`.
      const midIndex = Math.floor(lowIndex + (highIndex - lowIndex) / 2);
      if (propertyAccessor(sortedArray[midIndex]) < keyVal) {
        lowIndex = midIndex + 1; // Search in the right half
      } else {
        highIndex = midIndex; // Search in the left half or current element
      }
    }
    return lowIndex; // `lowIndex` is the insertion point
  }

  // Performs a circular shift (rotation) on an array.
  // A positive `shiftAmount` moves elements from the end to the beginning (right shift).
  // A negative `shiftAmount` moves elements from the beginning to the end (left shift).
  // Returns a new array with the shifted elements.
  circularShift(dataArray, shiftAmount) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return []; // Return an empty array for invalid or empty input.
    }
    const arrayLength = dataArray.length;
    // Normalize the shift amount to be within the array's bounds and positive.
    let normalizedShift = shiftAmount % arrayLength;
    if (normalizedShift < 0) {
      normalizedShift += arrayLength; // Ensure `normalizedShift` is non-negative
    }

    // Use `slice` and `concat` to create the rotated array.
    return dataArray.slice(normalizedShift).concat(dataArray.slice(0, normalizedShift));
  }

  // Clamps a numerical `value` between a specified `min` and `max` boundary.
  clamp(value, min, max) {
      return Math.max(min, Math.min(value, max));
  }
}
// Instantiate the utility toolkit for global access.
const utils = new UtilityToolkit();

// Handles reading input data from standard input in various formats.
class DataFetcher {
  constructor() {
    this.currentLineIndex = 0;
    this.allInputLines = [];
    this.loadAllData(); // Load all input immediately upon instantiation.
  }

  // Reads all available input from `/dev/stdin` and splits it into an array of lines.
  // Filters out any empty lines that may result from trailing newlines.
  loadAllData() {
    try {
      this.allInputLines = (require("fs").readFileSync("/dev/stdin", "utf8"))
                             .split(/\r?\n/) // Handles both Windows (\r\n) and Unix (\n) newlines
                             .filter(line => line.length > 0); // Remove empty lines
    } catch (error) {
      console.error("Error reading input from /dev/stdin:", error);
      this.allInputLines = []; // Ensure an empty array on error to prevent further issues.
    }
    return this.allInputLines;
  }

  // Fetches one or a specified number of lines from the input data.
  // Increments the `currentLineIndex`. Returns `null` if no more lines are available.
  fetchLine(numberOfLines) {
    if (this.currentLineIndex >= this.allInputLines.length) {
        return null; // No more lines to fetch.
    }
    if (numberOfLines) {
      const fetchedBlock = this.allInputLines.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
      this.currentLineIndex += numberOfLines;
      return fetchedBlock;
    }
    // Fetch a single line if `numberOfLines` is not specified.
    return this.allInputLines[this.currentLineIndex++];
  }

  // Fetches the next line and attempts to parse it as an integer.
  // Returns `NaN` if the line is `null` or cannot be parsed.
  fetchInteger() {
      const line = this.fetchLine();
      return line !== null ? Number(line) : NaN;
  }

  // Fetches the next line, splits it by space, and returns an array of strings.
  // Returns an empty array if no line is available.
  fetchStringArray() {
      const line = this.fetchLine();
      return line !== null ? line.split(' ') : [];
  }

  // Fetches the next line, splits it, and parses each element into an array of integers.
  fetchIntegerArray() {
      return this.fetchStringArray().map(element => Number(element));
  }

  // Fetches the next line, splits it, and parses each element into an array of floating-point numbers.
  fetchFloatArray() {
      return this.fetchStringArray().map(element => parseFloat(element));
  }

  // Fetches a specified `count` of lines and parses each into an integer.
  fetchIntegerLines(count) {
      const lines = this.fetchLine(count);
      return lines !== null ? lines.map(line => Number(line)) : [];
  }

  // Fetches a specified `count` of lines and parses each into a float.
  fetchFloatLines(count) {
      const lines = this.fetchLine(count);
      return lines !== null ? lines.map(line => parseFloat(line)) : [];
  }

  // Fetches a specified `count` of lines and splits each line into an array of strings,
  // resulting in a 2D array (matrix) of strings.
  fetchStringMatrix(count) {
      const lines = this.fetchLine(count);
      return lines !== null ? lines.map(line => line.split(' ')) : [];
  }

  // Fetches a specified `count` of lines and parses each line into an array of integers,
  // resulting in a 2D array (matrix) of integers.
  fetchIntegerMatrix(count) {
    const lines = this.fetchLine(count);
    return lines !== null ? lines.map(line => line.split(' ').map(element => Number(element))) : [];
  }

  // Fetches a specified `count` of lines and parses each line into an array of floats,
  // resulting in a 2D array (matrix) of floats.
  fetchFloatMatrix(count) {
    const lines = this.fetchLine(count);
    return lines !== null ? lines.map(line => line.split(' ').map(element => parseFloat(element))) : [];
  }

  // Checks if there are more lines available to be read from the input.
  hasMoreLines() {
    return this.currentLineIndex < this.allInputLines.length;
  }
}
// Instantiate the data fetcher for global input access.
const dataInput = new DataFetcher();

// Core simulation logic for ant movement on a circular track.
class SimulationCore {
  executeSimulation() {
    // 1. Retrieve essential simulation parameters: Ant Count (N), Track Length (L), and Time Elapsed (T).
    const initialParameters = dataInput.fetchIntegerArray();
    const antCount = initialParameters[0];
    const trackLength = initialParameters[1];
    const timeElapsed = initialParameters[2];

    // 2. Perform basic validation for input parameters.
    if (antCount < 1 || trackLength < 1 || timeElapsed < 0) {
      // For invalid inputs, return an error message or an empty result.
      return "Error: Invalid input parameters provided. Ant count, track length must be positive, time elapsed non-negative.";
    }

    // 3. Populate a list of ant states (initial position and direction).
    const antStates = [];
    const rawAntData = dataInput.fetchIntegerMatrix(antCount);
    for (const antDatum of rawAntData) {
        const [initialPosition, rawDirection] = antDatum;
        // Ensure direction is strictly 1 (clockwise) or -1 (counter-clockwise).
        const directionValue = (rawDirection === 1) ? 1 : -1;
        antStates.push({
            position: initialPosition,
            direction: directionValue
        });
    }

    // 4. Calculate the final position of each ant assuming they pass through each other without collision.
    // The modulo operation handles wrapping around the circular track.
    // Only the remainder of T divided by L matters for the final position on the track.
    const effectiveTimeForPosition = timeElapsed % trackLength;
    const finalPositions = antStates.map(ant => {
      let projectedPosition = ant.position + ant.direction * effectiveTimeForPosition;
      // Use (val % L + L) % L to ensure a positive result for the modulo operation.
      return (projectedPosition % trackLength + trackLength) % trackLength;
    });

    // 5. Determine the number of times the first ant 'virtually' crosses other ants.
    // This `collisionCount` determines the overall rotational shift in the final ant ordering.
    let collisionCount = 0;
    const firstAntState = antStates[0];

    // Iterate through all ants starting from the second one (index 1).
    for (let i = 1; i < antCount; ++i) {
      const currentAntState = antStates[i];

      // If ants are moving in the same direction, they never 'virtually' cross each other
      // in a way that changes their relative order.
      if (currentAntState.direction === firstAntState.direction) {
        continue;
      }

      // Calculate the initial separation distance between the first ant and the current ant.
      // This distance is adjusted based on the first ant's direction for consistent calculation
      // on a circular track.
      let initialSeparation = (firstAntState.direction * (currentAntState.position - firstAntState.position) + trackLength) % trackLength;
      // Ensure initialSeparation is positive.
      if (initialSeparation < 0) {
          initialSeparation += trackLength;
      }

      // Calculate how many full laps the first ant 'virtually' gains or loses on the current ant.
      // When moving towards each other, their relative speed is 2 units/second.
      // The formula `1 + floor((2 * T - d) / L)` gives the number of times they cross.
      const lapsCrossed = 1 + Math.floor((2 * timeElapsed - initialSeparation) / trackLength);

      // Accumulate the lap crossings, taking modulo `antCount` to keep it within bounds.
      collisionCount = (collisionCount + lapsCrossed) % antCount;
      // Ensure `collisionCount` remains positive after the modulo.
      if (collisionCount < 0) {
          collisionCount += antCount;
      }
    }

    // 6. Calculate the final `relativeShiftIndex` for the first ant.
    // This index indicates its final position in the sorted order, considering all virtual collisions.
    const relativeShiftIndex = (firstAntState.direction * collisionCount + antCount) % antCount;
    if (relativeShiftIndex < 0) {
        relativeShiftIndex += antCount;
    }

    // 7. Store the final "pass-through" position of the original first ant.
    const firstAntFinalPosition = finalPositions[0];

    // 8. Create a sorted copy of all final positions to establish the final relative ordering.
    const sortedFinalPositions = utils.sortArray([...finalPositions]); // Use spread operator to create a shallow copy before sorting.

    // 9. Determine the `initialRotationOffset`. This is the index of where the original first ant's
    // final position would land in the sorted list, effectively establishing the "start" of the final order.
    let initialRotationOffset;
    if (firstAntState.direction === 1) { // If the first ant moved clockwise
      // We look for the position that would come *after* `firstAntFinalPosition` in a clockwise sense.
      // This is `(firstAntFinalPosition + 1) % trackLength` (handling wrap-around).
      // Then, we find its insertion point and subtract 1 to get the actual index of `firstAntFinalPosition`.
      const searchTargetForClockwise = (firstAntFinalPosition + 1) % trackLength;
      initialRotationOffset = utils.findInsertionPoint(sortedFinalPositions, searchTargetForClockwise) - 1;
      // Special handling: if `firstAntFinalPosition` is the largest value, `searchTargetForClockwise` wraps to 0,
      // and `findInsertionPoint` might return 0, leading to `initialRotationOffset` of -1.
      // In this case, the offset should be the last index.
      if (initialRotationOffset < 0) {
          initialRotationOffset = sortedFinalPositions.length - 1;
      }
    } else { // If the first ant moved counter-clockwise
      // We simply find the insertion point of `firstAntFinalPosition` itself.
      initialRotationOffset = utils.findInsertionPoint(sortedFinalPositions, firstAntFinalPosition);
    }

    // 10. The final ordered list of ant positions is obtained by circularly shifting the sorted list.
    // The shift amount is `initialRotationOffset - relativeShiftIndex`.
    // The `circularShift` utility automatically handles positive/negative shifts.
    const orderedFinalPositions = utils.circularShift(sortedFinalPositions, initialRotationOffset - relativeShiftIndex);

    // 11. Return the final positions, joined by newline characters.
    return orderedFinalPositions.join('\n');
  }
}

// Global function responsible for displaying the simulation's output.
const displayResult = (outputData) => {
  let formattedOutput;
  // Convert boolean results to specific strings.
  if (outputData === true) {
    formattedOutput = 'Yes';
  } else if (outputData === false) {
    formattedOutput = 'No';
  } else if (outputData == null) { // Handle null or undefined output gracefully.
    formattedOutput = ''; // Output an empty string for no data.
  }
  else {
    formattedOutput = String(outputData); // Ensure all other outputs are converted to string.
  }
  console.log(formattedOutput);
};

// Main execution block: Orchestrates the simulation and handles errors.
try {
  const simulationInstance = new SimulationCore();
  const simulationOutput = simulationInstance.executeSimulation();
  displayResult(simulationOutput);
} catch (mainExecutionError) {
  // Catch any unhandled errors during the simulation process.
  console.error("An unhandled error occurred during simulation execution:", mainExecutionError);
  displayResult("An unexpected error occurred: " + mainExecutionError.message); // Display error message to user.
}