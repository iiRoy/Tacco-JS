'use strict';

// WA
class AntSimulation {
  // Main logic to solve the ant problem
  solve() {
    // Read N, L, T parameters from input
    const inputParameters = inputHandler.nextIntArr();
    const numAnts = inputParameters[0];
    const trackLength = inputParameters[1];
    const timeElapsed = inputParameters[2];

    // Parse initial ant positions and directions
    const antInitialStates = inputHandler.nextIntRange(numAnts).map(antDataEntry => {
      const initialPosition = antDataEntry[0];
      const movementDirection = antDataEntry[1] === 1 ? 1 : -1; // 1 for clockwise, -1 for counter-clockwise
      return { x: initialPosition, w: movementDirection };
    });

    // Pre-calculate time modulo track length for position updates, ensuring positive result
    const effectiveTimeModuloLength = (timeElapsed % trackLength + trackLength) % trackLength;

    // Calculate final positions assuming ants pass through each other
    const finalPositions = antInitialStates.map(currentAntState => {
      // (current_position + direction * effective_time + track_length) % track_length
      // Adding trackLength ensures the result of the sum is positive before modulo
      const calculatedFinalPos = (currentAntState.x + currentAntState.w * effectiveTimeModuloLength + trackLength);
      return calculatedFinalPos % trackLength;
    });

    // --- Collision calculation for the first ant to determine its effective final index ---
    let totalCollisionCount = 0;
    const firstAntInitialState = antInitialStates[0];

    // Helper function to calculate the number of times two ants virtually cross each other
    const calculateRelativeCrossings = (antA, antB, circuitLength, totalTime) => {
      // If ants move in the same direction, their relative order doesn't change due to crossings
      if (antA.w === antB.w) {
        return 0;
      }

      // Calculate initial distance between antA and antB, adjusted for antA's direction
      // This represents the distance antA needs to cover to "catch up" or "pass" antB
      const initialRelativeDistance = (antA.w * (antB.x - antA.x) + circuitLength) % circuitLength;

      // Ants effectively move at a relative speed of 2 when moving towards each other.
      // The formula `1 + floor((2 * T - d) / L)` gives the number of times antA
      // would cross antB if they were on an infinite line and passed through each other.
      const crossingFactor = 1 + Math.floor((2 * totalTime - initialRelativeDistance) / circuitLength);
      return crossingFactor;
    };

    for (let i = 1; i < numAnts; ++i) {
      const otherAntState = antInitialStates[i];
      const crossings = calculateRelativeCrossings(firstAntInitialState, otherAntState, trackLength, timeElapsed);
      totalCollisionCount = (totalCollisionCount + crossings) % numAnts;
    }

    // Determine the final logical index of the first ant in the sorted list
    // This index accounts for all virtual collisions.
    const firstAntEffectiveIndex = (firstAntInitialState.w * totalCollisionCount + numAnts) % numAnts;

    // Get the final position of the first ant (assuming no collisions)
    const firstAntActualFinalPosition = finalPositions[0];

    // Create a sorted copy of the final positions to find the rotation offset
    const sortedFinalPositions = [...finalPositions].sort((a, b) => a - b);

    // Determine the rotation offset needed to align the sorted positions with the actual final arrangement
    let arrayRotationOffset;
    if (firstAntInitialState.w === 1) { // Clockwise direction
      // For clockwise, the first ant's final position corresponds to the element
      // that would be at `firstAntActualFinalPosition` if the array was shifted by 1.
      // So, we search for `firstAntActualFinalPosition + 1` and subtract 1 from the found index.
      arrayRotationOffset = utilityFunctions.binarySearch(sortedFinalPositions, firstAntActualFinalPosition + 1) - 1;
    } else { // Counter-clockwise direction
      // For counter-clockwise, the first ant's final position directly corresponds
      // to its position in the sorted array.
      arrayRotationOffset = utilityFunctions.binarySearch(sortedFinalPositions, firstAntActualFinalPosition);
    }

    // Apply the rotation to the sorted final positions to get the final ant arrangement
    // The rotation amount is (index_in_sorted_array - effective_final_index_of_first_ant)
    const finalAntArrangement = utilityFunctions.rotate(sortedFinalPositions, arrayRotationOffset - firstAntEffectiveIndex);

    return finalAntArrangement.join('\n');
  }
}

// Class for performing modular arithmetic operations
class ModularArithmetic {
  constructor(modulus) {
    this.modulusValue = modulus == null ? ModularArithmetic.DefaultMod : modulus;
  }

  // Modular multiplication (a * b) % M using binary exponentiation method
  multiplyMod(valA, valB) {
    let resultAccumulator = 0;
    let currentA = valA % this.modulusValue;
    let currentB = valB % this.modulusValue;

    while (currentB > 0) {
      if (currentB & 1) { // If currentB is odd
        resultAccumulator += currentA;
        if (resultAccumulator >= this.modulusValue) { // Ensure result stays within modulus
          resultAccumulator -= this.modulusValue;
        }
      }
      currentA <<= 1; // currentA = currentA * 2
      if (currentA >= this.modulusValue) { // Ensure currentA stays within modulus
        currentA -= this.modulusValue;
      }
      currentB >>= 1; // currentB = currentB / 2
    }
    return resultAccumulator;
  }

  // Modular exponentiation (base^exponent) % M
  powerMod(base, exponent) {
    let result = 1;
    let currentBase = base;
    let currentExponent = exponent;

    while (currentExponent > 0) {
      if (currentExponent & 1) {
        result = this.multiplyMod(result, currentBase);
      }
      currentBase = this.multiplyMod(currentBase, currentBase);
      currentExponent >>= 1;
    }
    return result;
  }
}
ModularArithmetic.DefaultMod = 1e9 + 7; // Default modulus constant
const MOD_CALCULATOR = new ModularArithmetic(ModularArithmetic.DefaultMod);

// Collection of general utility functions
class UtilityFunctions {
  // Sums all elements in an array
  sum(dataArray) {
    return dataArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  // Sums all elements in an array modulo a given modulus
  modSum(dataArray, modulus = MOD_CALCULATOR.modulusValue) {
    return dataArray.reduce((accumulator, currentValue) => (accumulator + currentValue) % modulus, 0);
  }

  // Finds the minimum element in an array using an optional comparison function
  min(dataArray, comparisonFn = (a, b) => a - b) {
    if (dataArray.length === 0) return undefined;
    return dataArray.reduce((minVal, currentVal) => comparisonFn(minVal, currentVal) < 0 ? minVal : currentVal);
  }

  // Finds the maximum element in an array using an optional comparison function
  max(dataArray, comparisonFn = (a, b) => a - b) {
    if (dataArray.length === 0) return undefined;
    return dataArray.reduce((maxVal, currentVal) => comparisonFn(maxVal, currentVal) > 0 ? maxVal : currentVal);
  }

  // Sorts an array in place using an optional comparison function
  sort(dataArray, comparisonFn = (a, b) => a - b) {
    return dataArray.sort(comparisonFn);
  }

  // Generates a range of numbers
  range(rangeStart, rangeEnd, rangeStep) {
    if (rangeEnd == null) {
      rangeEnd = rangeStart || 0;
      rangeStart = 0;
    }
    if (!rangeStep) {
      rangeStep = rangeEnd < rangeStart ? -1 : 1;
    }
    const length = Math.max(Math.ceil((rangeEnd - rangeStart) / rangeStep), 0);
    const generatedRange = Array(length);
    for (let i = 0; i < length; i++, rangeStart += rangeStep) {
      generatedRange[i] = rangeStart;
    }
    return generatedRange;
  }

  // Returns the first 'count' elements of an array, or the first element if 'count' is null
  first(dataArray, count) {
    if (!dataArray || dataArray.length === 0) return count == null ? undefined : [];
    if (count == null) return dataArray[0];
    return this.initial(dataArray, dataArray.length - count);
  }

  // Returns all but the last 'count' elements of an array, or all but the last element if 'count' is null
  initial(dataArray, count) {
    const numToSlice = count == null ? 1 : count;
    return dataArray.slice(0, Math.max(0, dataArray.length - numToSlice));
  }

  // Returns all but the first 'count' elements of an array, or all but the first element if 'count' is null
  tail(dataArray, count) {
    const numToSlice = count == null ? 1 : count;
    return dataArray.slice(numToSlice);
  }

  // Returns the last 'count' elements of an array, or the last element if 'count' is null
  last(dataArray, count) {
    if (count == null) return dataArray[dataArray.length - 1];
    return this.tail(dataArray, Math.max(0, dataArray.length - count));
  }

  // Calculates cumulative sum of an array
  sumArray(dataArray) {
    const cumulativeSums = [0];
    for (let i = 0; i < dataArray.length; i++) {
      cumulativeSums.push(dataArray[i] + cumulativeSums[i]);
    }
    return cumulativeSums.slice(1); // Remove the initial 0
  }

  // Calculates differences between adjacent elements in an array
  diffArray(dataArray) {
    const differences = [];
    for (let i = 1; i < dataArray.length; ++i) {
      differences.push(dataArray[i] - dataArray[i - 1]);
    }
    return differences;
  }

  // Performs a binary search to find the index of the first element >= searchKey
  binarySearch(dataArray, searchKey, propertyName) {
    const getComparableValue = (obj) => (typeof obj === 'object' && propertyName) ? obj[propertyName] : obj;
    const targetValue = getComparableValue(searchKey);
    let lowIndex = 0;
    let highIndex = dataArray.length;
    while (lowIndex < highIndex) {
      let midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getComparableValue(dataArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex;
      }
    }
    return lowIndex;
  }

  // Rotates an array by 'rotationAmount' positions
  rotate(dataArray, rotationAmount) {
    let effectiveRotation = rotationAmount % dataArray.length;
    if (effectiveRotation < 0) {
      effectiveRotation += dataArray.length;
    }
    return dataArray.slice(effectiveRotation).concat(dataArray.slice(0, effectiveRotation));
  }
}
const utilityFunctions = new UtilityFunctions();

// Handles reading input from stdin
class InputHandler {
  constructor() {
    this.readCursor = 0;
    this.inputLines = this.readAllInput();
  }

  // Reads all lines from stdin
  readAllInput() {
    return require("fs").readFileSync("/dev/stdin", "utf8").split('\n');
  }

  // Reads 'count' lines or a single line
  nextLine(count) {
    if (count) {
      const lines = this.inputLines.slice(this.readCursor, this.readCursor + count);
      this.readCursor += count;
      return lines;
    }
    return this.inputLines[this.readCursor++];
  }

  // Reads a single integer from the next line
  nextInt() {
    return parseInt(this.nextLine(), 10);
  }

  // Reads a line of space-separated strings into an array
  nextStrArr() {
    return this.nextLine().split(' ');
  }

  // Reads a line of space-separated integers into an array
  nextIntArr() {
    return this.nextStrArr().map(element => parseInt(element, 10));
  }

  // Reads a line of space-separated floats into an array
  nextFloatArr() {
    return this.nextStrArr().map(element => parseFloat(element));
  }

  // Reads 'count' lines, each containing a single integer, into an array
  nextIntLine(count) {
    return this.nextLine(count).map(line => parseInt(line, 10));
  }

  // Reads 'count' lines, each containing a single float, into an array
  nextFloatLine(count) {
    return this.nextLine(count).map(line => parseFloat(line));
  }

  // Reads 'count' lines, each containing space-separated strings, into a 2D array
  nextStrRange(count) {
    return this.nextLine(count).map(line => line.split(' '));
  }

  // Reads 'count' lines, each containing space-separated integers, into a 2D array
  nextIntRange(count) {
    return this.nextLine(count).map(line => line.split(' ').map(element => parseInt(element, 10)));
  }

  // Reads 'count' lines, each containing space-separated floats, into a 2D array
  nextFloatRange(count) {
    return this.nextLine(count).map(line => line.split(' ').map(element => parseFloat(element)));
  }
}
const inputHandler = new InputHandler();

// Handles writing output to stdout
const OutputWriter = (outputValue) => {
  let formattedOutput;
  if (outputValue === null || outputValue === undefined) {
    return; // Do nothing if output is null or undefined
  } else if (outputValue === true) {
    formattedOutput = 'Yes';
  } else if (outputValue === false) {
    formattedOutput = 'No';
  } else {
    formattedOutput = outputValue;
  }
  console.log(formattedOutput);
};

OutputWriter(new AntSimulation().solve());
