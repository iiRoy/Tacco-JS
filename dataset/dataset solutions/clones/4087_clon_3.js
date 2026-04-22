'use strict';

/**
 * @class SolutionProcessor
 * @description Main class responsible for orchestrating the problem-solving logic.
 *              It reads input, processes spatial data, and computes the maximum
 *              black tile count based on a sliding window approach.
 */
class SolutionProcessor {
  /**
   * @method processInputAndCompute
   * @description Reads input parameters, constructs a spatial data structure,
   *              and calculates the optimal configuration to maximize a specific
   *              count within a given grid.
   * @returns {number} The maximum achievable count.
   */
  processInputAndCompute() {
    // Retrieve initial problem dimensions from input
    const problemDimensions = inputScanner.getIntegerArrayLine();
    const numPoints = problemDimensions[0]; // N: Total number of points
    const segmentLength = problemDimensions[1]; // K: Length of the segment for color determination

    // Calculate double the segment length for modulo operations,
    // ensuring coordinates wrap around correctly within a 2K x 2K conceptual grid.
    const twoKSegment = segmentLength * 2; // Rewritten from k+k

    // Process raw input strings into structured point objects.
    // Each point has an original (x,y) and a color modifier 'B' or 'W'.
    // Coordinates are adjusted and then normalized using modulo arithmetic
    // to fit within the 2K x 2K conceptual grid.
    const rawPointEntries = inputScanner.readStringMatrix(numPoints);
    const processedPoints = rawPointEntries.map(entry => {
      const initialX = Number.parseInt(entry[0], 10);
      const initialY = Number.parseInt(entry[1], 10);
      const colorChar = entry[2]; // 'B' for black, 'W' for white

      // Apply K offset if the point is initially 'B' (black)
      // This effectively shifts black points for easier calculation later.
      const xOffsetForBlack = (colorChar === 'B') ? segmentLength : 0;
      const adjustedX = initialX + xOffsetForBlack;

      return {
        xCoord: adjustedX % twoKSegment, // Normalized X coordinate
        yCoord: initialY % twoKSegment, // Normalized Y coordinate
      };
    });

    // Initialize a spatial locator (compressed grid) with the processed points.
    // This structure allows efficient querying of points within specific ranges.
    const spatialLocator = SpatialLocator.createFromData(processedPoints);

    /**
     * @function determineTileColor
     * @description Determines the conceptual color of a tile based on its
     *              normalized coordinates (x, y) relative to the segment length K.
     *              This function simulates a checkerboard pattern.
     * @param {number} currentX - The x-coordinate.
     * @param {number} currentY - The y-coordinate.
     * @returns {number} 0 for 'white' tile, 1 for 'black' tile.
     */
    const determineTileColor = (currentX, currentY) => {
      // Check if x is in the first half of a 2K segment (0 to K-1)
      const isXLowerHalf = currentX < segmentLength;
      // Check if y is in the first half of a 2K segment (0 to K-1)
      const isYLowerHalf = currentY < segmentLength;

      // XOR operation simulates a checkerboard pattern.
      // (0,0) is white, (0,1) is black, (1,0) is black, (1,1) is white.
      // Representing white as 0 and black as 1.
      return (isXLowerHalf ? 0 : 1) ^ (isYLowerHalf ? 0 : 1);
    };

    // Calculate the initial count of points that fall on 'white' (0) tiles.
    // This is our starting point for the sliding window.
    let currentWhiteTilePoints = 0;
    for (let pIdx = 0; pIdx < processedPoints.length; pIdx++) { // Changed to traditional for loop
      const pt = processedPoints[pIdx];
      if (determineTileColor(pt.xCoord, pt.yCoord) === 0) {
        currentWhiteTilePoints++;
      }
    }

    // Initialize the maximum count found so far with the initial count.
    let maximumAchievedCount = currentWhiteTilePoints;

    // --- Sliding Window Algorithm ---
    // The algorithm iterates through all possible top-left corners (dx, dy)
    // of a K x K window within the 2K x 2K conceptual grid.
    // It efficiently updates the count of points within the 'white' tiles
    // as the window slides, avoiding re-counting all points each time.

    // Iterate through possible Y-offsets for the window's top-left corner
    for (let currentYOffset = 0; currentYOffset < segmentLength; ++currentYOffset) {
      // Iterate through possible X-offsets for the window's top-left corner
      for (let currentXOffset = 0; currentXOffset < twoKSegment; ++currentXOffset) {
        // Optimization: Skip columns if there are no points in the current or shifted column.
        // This avoids unnecessary calculations for empty vertical strips.
        // The original condition `dx < k` here is crucial. Let's make it more explicit.
        while (currentXOffset < segmentLength &&
               spatialLocator.getItemCount('xCoord', currentXOffset) === 0 &&
               spatialLocator.getItemCount('xCoord', currentXOffset + segmentLength) === 0) {
          currentXOffset++;
        }
        // If the inner loop incremented currentXOffset past a certain point, it might be out of bounds
        if (currentXOffset >= twoKSegment) {
            break; // No more X-columns to check for this Y-offset
        }

        // Update the maximum count if the current window configuration yields a higher count.
        if (currentWhiteTilePoints > maximumAchievedCount) {
          maximumAchievedCount = currentWhiteTilePoints;
        }

        // Calculate points in the current KxK window's relevant quadrants for the horizontal slide.
        // When sliding horizontally (dx increases), points move from the left KxK region
        // to the right KxK region, effectively flipping their 'color' contribution.

        // Points in the current left KxK column (dx) that are on 'white' tiles.
        const leftWindowWhitePoints = spatialLocator.queryRangeCount(currentXOffset, currentYOffset, currentXOffset, currentYOffset + segmentLength);
        // Points in the current left KxK column (dx) that are on 'black' tiles.
        const leftWindowBlackPoints = spatialLocator.getItemCount('xCoord', currentXOffset) - leftWindowWhitePoints;

        // Points in the next KxK column ((dx+k)%2k) that are on 'white' tiles.
        // This is the column that slides *into* the 'active' region.
        const shiftedXCoord = (currentXOffset + segmentLength) % twoKSegment;
        const rightWindowWhitePoints = spatialLocator.queryRangeCount(shiftedXCoord, currentYOffset, shiftedXCoord, currentYOffset + segmentLength);
        // Points in the next KxK column ((dx+k)%2k) that are on 'black' tiles.
        const rightWindowBlackPoints = spatialLocator.getItemCount('xCoord', shiftedXCoord) - rightWindowWhitePoints;

        // Update the current count.
        // When sliding right:
        // - Points leaving the left column (dx) that were 'white' now become 'black' (lose 1 from count).
        // - Points leaving the left column (dx) that were 'black' now become 'white' (gain 1 to count).
        // - Points entering the right column ((dx+k)%2k) that were 'white' now become 'black' (lose 1 from count).
        // - Points entering the right column ((dx+k)%2k) that were 'black' now become 'white' (gain 1 to count).
        // The effective change is: (+leftBlackPoints - leftWhitePoints) + (+rightBlackPoints - rightWhitePoints)
        const horizontalChange = (leftWindowBlackPoints - leftWindowWhitePoints) + (rightWindowBlackPoints - rightWindowWhitePoints);
        currentWhiteTilePoints += horizontalChange;
      }

      // Optimization: Skip rows if there are no points in the current or shifted row.
      // This avoids unnecessary calculations for empty horizontal strips.
      // The original `while(dy < k && ...)` implies `dy` can be incremented up to `k`.
      // If `currentYOffset` is `segmentLength - 1`, the loop continues.
      // If `currentYOffset` becomes `segmentLength`, the outer loop condition `currentYOffset < segmentLength` handles the break.
      // The `if (dy == k) break;` in the original was for cases where the while loop directly bumped `dy` to `k`.
      while (currentYOffset < segmentLength &&
             spatialLocator.getItemCount('yCoord', currentYOffset) === 0 &&
             spatialLocator.getItemCount('yCoord', currentYOffset + segmentLength) === 0) {
        currentYOffset++;
      }
      // If after the while loop, currentYOffset has reached or exceeded segmentLength,
      // it means we've processed all relevant rows or jumped beyond them.
      // This ensures we don't try to process currentYOffset = K
      if (currentYOffset >= segmentLength) {
        break; // Exit the outer loop
      }
      // Note: The loop increment `++currentYOffset` will happen *after* this block.
      // So, if currentYOffset is `segmentLength-1` and the while loop doesn't increment it,
      // the following calculations are for `segmentLength-1`, and then it will exit.

      // Calculate points in the current KxK window's relevant quadrants for the vertical slide.
      // When sliding vertically (dy increases), points move from the top KxK region
      // to the bottom KxK region, effectively flipping their 'color' contribution.

      // Points in the current top KxK row (dy) that are on 'white' tiles.
      const topRowWhitePoints = spatialLocator.queryRangeCount(0, currentYOffset, segmentLength, currentYOffset);
      // Points in the current top KxK row (dy) that are on 'black' tiles.
      const topRowBlackPoints = spatialLocator.getItemCount('yCoord', currentYOffset) - topRowWhitePoints;

      // Points in the next KxK row ((dy+k)%2k) that are on 'white' tiles.
      // This is the row that slides *into* the 'active' region.
      const shiftedYCoord = currentYOffset + segmentLength; // Modulo not needed here as we only care about this specific K-length shift for the next row
      const bottomRowWhitePoints = spatialLocator.queryRangeCount(0, shiftedYCoord, segmentLength, shiftedYCoord);
      // Points in the next KxK row ((dy+k)%2k) that are on 'black' tiles.
      const bottomRowBlackPoints = spatialLocator.getItemCount('yCoord', shiftedYCoord) - bottomRowWhitePoints;

      // Update the current count for the vertical slide.
      // Similar logic to horizontal slide.
      const verticalChange = (topRowBlackPoints - topRowWhitePoints) + (bottomRowBlackPoints - bottomRowWhitePoints);
      currentWhiteTilePoints += verticalChange;
    }
    // Ensure the final count is also checked against the maximum.
    // This handles cases where the last iteration might yield the max.
    if (currentWhiteTilePoints > maximumAchievedCount) {
        maximumAchievedCount = currentWhiteTilePoints;
    }

    return maximumAchievedCount;
  }
}

/**
 * @class SpatialLocator
 * @description A specialized data structure for efficiently storing and querying
 *              2D points. It indexes points by their coordinates (x and y)
 *              and provides methods to count points within specific ranges.
 *              It's essentially a compressed grid or a set of indexed lists.
 */
class SpatialLocator {
  /**
   * @static
   * @property {string[]} StandardAxes - Default coordinate axes used for indexing.
   */
  static StandardAxes = ['xCoord', 'yCoord'];

  /**
   * @static
   * @property {object} DefaultSortingCriteria - Default comparison functions
   *           for sorting points within each indexed list.
   */
  static DefaultSortingCriteria = {
    'xCoord': (ptA, ptB) => ptA.yCoord - ptB.yCoord, // When indexed by x, sort by y
    'yCoord': (ptA, ptB) => ptA.xCoord - ptB.xCoord, // When indexed by y, sort by x
  };

  /**
   * @static
   * @method createFromData
   * @description Factory method to create and initialize a SpatialLocator instance.
   * @param {Array<object>} inputElements - An array of point objects.
   * @param {string[]} [extraAxes=[]] - Additional properties to use as axes for indexing.
   * @param {object} [additionalSortRules={}] - Custom sorting rules for additional axes.
   * @returns {SpatialLocator} A newly initialized SpatialLocator instance.
   */
  static createFromData(inputElements, extraAxes = [], additionalSortRules = {}) {
    const newLocator = new SpatialLocator();
    newLocator.initializeWithData(inputElements, extraAxes, additionalSortRules);
    return newLocator;
  }

  /**
   * @private
   * @property {string[]} dimensionAxes - All axes (e.g., 'xCoord', 'yCoord', plus any custom) used for indexing.
   */
  dimensionAxes = [];
  /**
   * @private
   * @property {object} sortingRules - Mapping of axis name to its sorting function.
   */
  sortingRules = {};
  /**
   * @private
   * @property {object} indexedCollections - Object containing sub-objects, where keys are axis names,
   *           and values are objects mapping coordinate values to arrays of points.
   *           Example: `{ xCoord: { 5: [point1, point2], 10: [point3] }, ... }`
   */
  indexedCollections = {};
  /**
   * @private
   * @property {object} indexedValues - Object containing sub-objects, where keys are axis names,
   *           and values are arrays of unique sorted coordinate values for that axis.
   *           Example: `{ xCoord: [5, 10], yCoord: [3, 7] }`
   */
  indexedValues = {};

  /**
   * @method getItemCount
   * @description Returns the number of points located at a specific coordinate along a given axis.
   * @param {string} axis - The axis name (e.g., 'xCoord', 'yCoord').
   * @param {number} coordinateValue - The specific coordinate value on that axis.
   * @returns {number} The count of points, or 0 if no points exist at that coordinate.
   */
  getItemCount(axis, coordinateValue) {
    const collection = this.indexedCollections[axis][coordinateValue];
    return collection ? collection.length : 0;
  }

  /**
   * @method initializeWithData
   * @description Initializes the SpatialLocator with a list of points, setting up
   *              its internal indexed collections and sorting them.
   * @param {Array<object>} inputElements - An array of point objects.
   * @param {string[]} [extraAxes=[]] - Additional properties to use as axes for indexing.
   * @param {object} [additionalSortRules={}] - Custom sorting rules for additional axes.
   * @returns {SpatialLocator} The initialized instance (for chaining).
   */
  initializeWithData(inputElements, extraAxes = [], additionalSortRules = {}) {
    this.dimensionAxes = SpatialLocator.StandardAxes.concat(extraAxes);
    // Merge default and additional sorting rules
    this.sortingRules = { ...SpatialLocator.DefaultSortingCriteria, ...additionalSortRules };

    // Initialize collections for each axis
    for (const axis of this.dimensionAxes) {
      this.indexedCollections[axis] = {};
    }

    // Populate indexed collections
    for (const element of inputElements) {
      for (const axis of this.dimensionAxes) {
        const axisValue = element[axis];
        // Ensure the array for this axis value exists
        if (!this.indexedCollections[axis][axisValue]) {
          this.indexedCollections[axis][axisValue] = [];
        }
        this.indexedCollections[axis][axisValue].push(element);
      }
    }

    // Sort points within each coordinate's list and store sorted keys
    for (const axis of this.dimensionAxes) {
      const axisData = this.indexedCollections[axis];
      for (const coordinateValue in axisData) {
        if (Object.prototype.hasOwnProperty.call(axisData, coordinateValue)) {
          axisData[coordinateValue].sort(this.sortingRules[axis]);
        }
      }
      this.indexedValues[axis] = Object.keys(this.indexedCollections[axis]).map(Number).sort((a,b) => a-b); // Ensure keys are numbers and sorted
    }
    return this;
  }

  /**
   * @method retrieveElement
   * @description Attempts to retrieve a specific point by its exact (x,y) coordinates.
   *              Note: This method is less efficient for range queries and might be simplified/removed
   *              if only range counts are needed.
   * @param {number} targetX - The x-coordinate to search for.
   * @param {number} targetY - The y-coordinate to search for.
   * @returns {object|null} The point object if found, otherwise null.
   */
  retrieveElement(targetX, targetY) {
    const xList = this.indexedCollections.xCoord[targetX];
    if (!xList) { return null; } // No points at this x-coordinate

    // Perform a binary search on the y-sorted list for this x-coordinate
    const searchResultIndex = UTIL.performBinarySearch(xList, targetY, 'yCoord');

    // Check if the found element at searchResultIndex actually matches the targetY
    const foundPoint = xList[searchResultIndex];
    if (foundPoint && foundPoint.yCoord === targetY) {
      return foundPoint;
    }
    return null;
  }

  /**
   * @method queryRangeCount
   * @description Counts the number of points within a specified (half-open) range
   *              along a single axis. This method is optimized for counting points
   *              in vertical (x1=x2) or horizontal (y1=y2) strips.
   * @param {number} start_x - The starting x-coordinate of the query rectangle.
   * @param {number} start_y - The starting y-coordinate of the query rectangle.
   * @param {number} end_x - The ending x-coordinate (exclusive) of the query rectangle.
   * @param {number} end_y - The ending y-coordinate (exclusive) of the query rectangle.
   * @returns {number} The count of points within the specified range.
   *                   Returns 0 if the range is invalid or no points are found.
   */
  queryRangeCount(start_x, start_y, end_x, end_y) {
    // Only supports queries along a single axis (vertical or horizontal lines/strips)
    if (start_x === end_x) { // Vertical strip query: x-coordinates are fixed
      const xCollection = this.indexedCollections.xCoord[start_x];
      if (!xCollection) return 0; // No points at this specific x-coordinate

      const lowerBoundIndex = UTIL.performBinarySearch(xCollection, start_y, 'yCoord');
      const upperBoundIndex = UTIL.performBinarySearch(xCollection, end_y, 'yCoord');
      return upperBoundIndex - lowerBoundIndex;
    } else if (start_y === end_y) { // Horizontal strip query: y-coordinates are fixed
      const yCollection = this.indexedCollections.yCoord[start_y];
      if (!yCollection) return 0; // No points at this specific y-coordinate

      const lowerBoundIndex = UTIL.performBinarySearch(yCollection, start_x, 'xCoord');
      const upperBoundIndex = UTIL.performBinarySearch(yCollection, end_x, 'xCoord');
      return upperBoundIndex - lowerBoundIndex;
    }
    // For general rectangle queries, a different approach (e.g., 2D segment tree) would be needed.
    // The Main class only uses this for vertical/horizontal strips.
    // Added a warning for unsupported query types as a new fragment.
    console.warn(`SpatialLocator.queryRangeCount: General rectangular query from (${start_x},${start_y}) to (${end_x},${end_y}) is not supported. Returning 0.`);
    return 0;
  }

  // The original `getSome` method was similar to `count` but returned elements.
  // It also only supported vertical/horizontal strips and had a bug in the loop (`this.lists.y[x]` instead of `this.lists.x[x][x]` or similar).
  // Given that `SolutionProcessor` doesn't use it, and it's redundant with `queryRangeCount`'s purpose,
  // it has been deleted for Type III cloning.
}

/**
 * @class ModularArithmetic
 * @description Provides utilities for performing arithmetic operations
 *              within a finite field (modulo a given number).
 *              Useful for problems involving large numbers or combinatorics.
 *              Note: This class is not used by SolutionProcessor in this specific problem.
 */
class ModularArithmetic {
  /**
   * @private
   * @property {number} modulusValue - The modulus for all arithmetic operations.
   */
  modulusValue;

  /**
   * @constructor
   * @param {number} [mod=1e9+7] - The modulus to use. Defaults to 10^9 + 7.
   */
  constructor(mod = 1_000_000_007) { // Using numeric separators for readability
    if (typeof mod !== 'number' || mod <= 0 || !Number.isInteger(mod)) {
      console.warn(`Invalid modulus value provided: ${mod}. Defaulting to 1e9+7.`);
      this.modulusValue = 1_000_000_007;
    } else {
      this.modulusValue = mod;
    }
  }

  /**
   * @method multiply
   * @description Computes (a * b) % modulusValue.
   * @param {number} factorA - The first operand.
   * @param {number} factorB - The second operand.
   * @returns {number} The product modulo modulusValue.
   */
  multiply(factorA, factorB) {
    let result = 0;
    // Ensure operands are within the modulus range
    factorA = factorA % this.modulusValue;
    factorB = factorB % this.modulusValue;

    // Use binary multiplication (Russian peasant algorithm) to prevent overflow
    // Rewritten `while (b)` to `while (factorB > 0)` and `b&1` to `factorB % 2 === 1`
    while (factorB > 0) {
      if (factorB % 2 === 1) { // If factorB is odd
        result = (result + factorA) % this.modulusValue;
      }
      factorA = (factorA * 2) % this.modulusValue; // Double factorA
      factorB = Math.floor(factorB / 2); // Halve factorB
    }
    return result;
  }

  /**
   * @method power
   * @description Computes (base ^ exponent) % modulusValue using modular exponentiation.
   * @param {number} baseVal - The base.
   * @param {number} expVal - The exponent.
   * @returns {number} The result of baseVal raised to expVal modulo modulusValue.
   */
  power(baseVal, expVal) {
    let result = 1;
    baseVal %= this.modulusValue; // Ensure base is within modulus range

    while (expVal > 0) {
      if (expVal % 2 === 1) { // If exponent is odd
        result = this.multiply(result, baseVal);
      }
      baseVal = this.multiply(baseVal, baseVal); // Square the base
      expVal = Math.floor(expVal / 2); // Halve the exponent
    }
    return result;
  }

  /**
   * @method divide
   * @description Computes (numerator / denominator) % modulusValue using modular inverse.
   *              Requires denominator to be coprime with modulusValue (typically prime modulus).
   * @param {number} numerator - The numerator.
   * @param {number} denominator - The denominator.
   * @returns {number} The result of numerator divided by denominator modulo modulusValue.
   */
  divide(numerator, denominator) {
    // Modular inverse of denominator using Fermat's Little Theorem (denominator^(mod-2))
    const invDenominator = this.power(denominator, this.modulusValue - 2);
    return this.multiply(numerator, invDenominator);
  }

  // Removed the `comb` method as `factTable` and `invFactTable` are external
  // and not defined in this context, and `SolutionProcessor` does not use `Mod`.
}
const MOD_CALCULATOR = new ModularArithmetic(1_000_000_007); // Instantiate the modular calculator

/**
 * @class UtilityFunctions
 * @description A collection of common utility functions for array manipulation,
 *              mathematical operations, and searching.
 */
class UtilityFunctions {
  /**
   * @method calculateSum
   * @description Computes the sum of all numbers in an array.
   * @param {number[]} numericArray - The array of numbers.
   * @returns {number} The total sum.
   */
  calculateSum(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.length === 0) return 0; // Guard clause
    let total = 0;
    for (const val of numericArray) {
      total += val;
    }
    return total;
  }

  /**
   * @method calculateModularSum
   * @description Computes the sum of numbers in an array, applying a modulus at each step.
   * @param {number[]} numericArray - The array of numbers.
   * @param {number} [modulus=MOD_CALCULATOR.modulusValue] - The modulus to apply.
   * @returns {number} The modular sum.
   */
  calculateModularSum(numericArray, modulus = MOD_CALCULATOR.modulusValue) {
    if (!Array.isArray(numericArray) || numericArray.length === 0) return 0; // Guard clause
    let total = 0;
    for (const val of numericArray) {
      total = (total + val) % modulus;
    }
    return total;
  }

  /**
   * @method findMinimum
   * @description Finds the minimum element in an array, optionally using a custom comparator.
   * @param {Array} collection - The array to search.
   * @param {Function} [comparisonFn=(a,b) => a - b] - A function that compares two elements.
   * @returns {*} The minimum element.
   */
  findMinimum(collection, comparisonFn = (valA, valB) => valA - valB) {
    if (!Array.isArray(collection) || collection.length === 0) return undefined;
    let minVal = collection[0];
    for (let i = 1; i < collection.length; i++) {
      if (comparisonFn(collection[i], minVal) < 0) {
        minVal = collection[i];
      }
    }
    return minVal;
  }

  /**
   * @method findMaximum
   * @description Finds the maximum element in an array, optionally using a custom comparator.
   * @param {Array} collection - The array to search.
   * @param {Function} [comparisonFn=(a,b) => a - b] - A function that compares two elements.
   * @returns {*} The maximum element.
   */
  findMaximum(collection, comparisonFn = (valA, valB) => valA - valB) {
    if (!Array.isArray(collection) || collection.length === 0) return undefined;
    let maxVal = collection[0];
    for (let i = 1; i < collection.length; i++) {
      if (comparisonFn(collection[i], maxVal) > 0) {
        maxVal = collection[i];
      }
    }
    return maxVal;
  }

  /**
   * @method sortArray
   * @description Sorts an array in place, optionally using a custom comparator.
   * @param {Array} collection - The array to sort.
   * @param {Function} [comparisonFn=(a,b) => a - b] - A function that compares two elements.
   * @returns {Array} The sorted array.
   */
  sortArray(collection, comparisonFn = (valA, valB) => valA - valB) {
    if (!Array.isArray(collection)) return []; // Guard clause
    return collection.sort(comparisonFn);
  }

  /**
   * @method getUniqueElements
   * @description Returns a new array containing only the unique elements from the input array.
   *              The order of unique elements is preserved.
   * @param {Array} collection - The input array.
   * @returns {Array} An array of unique elements.
   */
  getUniqueElements(collection) {
    if (!Array.isArray(collection)) return [];
    // Rewritten logic from sorting and nulling to using a Set for simplicity and performance.
    return Array.from(new Set(collection));
  }

  /**
   * @method generateRange
   * @description Generates an array of numbers in a specified range.
   * @param {number} start - The starting value (inclusive).
   * @param {number} [stop] - The stopping value (exclusive). If omitted, `start` becomes `stop` and `start` is 0.
   * @param {number} [step] - The increment/decrement step. Defaults to 1 or -1.
   * @returns {number[]} An array of numbers.
   */
  generateRange(start, stop, step) {
    let actualStart = start;
    let actualStop = stop;
    let actualStep = step;

    if (actualStop === undefined) {
      actualStop = actualStart;
      actualStart = 0;
    }
    if (actualStep === undefined) {
      actualStep = actualStop < actualStart ? -1 : 1;
    }

    const resultRange = [];
    if (actualStep === 0) {
      console.warn("generateRange: Step cannot be zero. Returning empty array.");
      return resultRange;
    }

    // Rewritten loop structure to be more explicit with direction
    if (actualStep > 0) {
      for (let i = actualStart; i < actualStop; i += actualStep) {
        resultRange.push(i);
      }
    } else { // actualStep < 0
      for (let i = actualStart; i > actualStop; i += actualStep) {
        resultRange.push(i);
      }
    }
    return resultRange;
  }

  /**
   * @method getFirstElements
   * @description Retrieves the first N elements from an array.
   * @param {Array} sourceArray - The array to extract from.
   * @param {number} [count=1] - The number of elements to retrieve.
   * @returns {Array|*} The first element if count is 1 (or omitted), otherwise an array.
   */
  getFirstElements(sourceArray, count = 1) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return count === 1 ? undefined : [];
    }
    const numToTake = Math.max(0, count);
    const result = sourceArray.slice(0, numToTake);
    return count === 1 ? result[0] : result;
  }

  /**
   * @method getInitialElements
   * @description Retrieves all but the last N elements from an array.
   * @param {Array} sourceArray - The array to extract from.
   * @param {number} [count=1] - The number of elements to exclude from the end.
   * @returns {Array} An array containing the initial elements.
   */
  getInitialElements(sourceArray, count = 1) {
    if (!Array.isArray(sourceArray)) return [];
    const numToExclude = Math.max(0, count);
    return sourceArray.slice(0, Math.max(0, sourceArray.length - numToExclude));
  }

  /**
   * @method getTailElements
   * @description Retrieves elements from the Nth position to the end of an array.
   * @param {Array} sourceArray - The array to extract from.
   * @param {number} [startIndex=1] - The starting index (0-based) from which to retrieve elements.
   *                                   If 1, it returns all but the first element.
   * @returns {Array} An array containing the tail elements.
   */
  getTailElements(sourceArray, startIndex = 1) {
    if (!Array.isArray(sourceArray)) return [];
    return sourceArray.slice(Math.max(0, startIndex));
  }

  /**
   * @method getLastElements
   * @description Retrieves the last N elements from an array.
   * @param {Array} sourceArray - The array to extract from.
   * @param {number} [count=1] - The number of elements to retrieve from the end.
   * @returns {Array|*} The last element if count is 1 (or omitted), otherwise an array.
   */
  getLastElements(sourceArray, count = 1) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return count === 1 ? undefined : [];
    }
    const numToTake = Math.max(0, count);
    const result = sourceArray.slice(Math.max(0, sourceArray.length - numToTake));
    return count === 1 ? result[0] : result;
  }

  /**
   * @method calculatePrefixSums
   * @description Computes the prefix sums (cumulative sums) of an array.
   *              The result array will have one more element than the input,
   *              with the first element being 0.
   * @param {number[]} numericArray - The input array of numbers.
   * @returns {number[]} An array of prefix sums.
   */
  calculatePrefixSums(numericArray) {
    if (!Array.isArray(numericArray)) return [0];
    const prefixSums = [0];
    let currentSum = 0;
    for (const num of numericArray) {
      currentSum += num;
      prefixSums.push(currentSum);
    }
    return prefixSums;
  }

  /**
   * @method calculateDifferences
   * @description Computes the differences between adjacent elements in an array.
   *              Returns an array of `arr[i] - arr[i-1]`.
   * @param {number[]} numericArray - The input array of numbers.
   * @returns {number[]} An array of differences.
   */
  calculateDifferences(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.length < 2) return [];
    const differences = [];
    for (let i = 1; i < numericArray.length; ++i) {
      differences.push(numericArray[i] - numericArray[i - 1]);
    }
    return differences;
  }

  /**
   * @method performBinarySearch
   * @description Performs a binary search on a sorted array to find the index
   *              where a given key (or value extracted by an iteratee) would be inserted
   *              to maintain sorted order. It returns the index of the first element
   *              greater than or equal to the key.
   * @param {Array} sortedArray - The array to search, assumed to be sorted.
   * @param {*} searchKey - The value to search for.
   * @param {string|Function} [iteratee] - If a string, it's a property name to access on array elements.
   *                                       If a function, it's used to transform array elements for comparison.
   * @returns {number} The insertion index.
   */
  performBinarySearch(sortedArray, searchKey, iteratee) {
    if (!Array.isArray(sortedArray) || sortedArray.length === 0) return 0;

    // Helper function to get the comparable value from an item
    const getValue = (item) => {
      if (typeof iteratee === 'string') {
        // Added a check for property existence for robustness
        if (typeof item === 'object' && item !== null && iteratee in item) {
          return item[iteratee];
        } else {
          // If iteratee is a string but item is not an object or lacks property, return item itself or a default
          console.warn(`Binary search: Iteratee property '${iteratee}' not found on item. Comparing item directly.`);
          return item;
        }
      }
      if (typeof iteratee === 'function') {
        return iteratee(item);
      }
      return item; // If no iteratee, compare item directly
    };

    const targetValue = getValue(searchKey);
    let lowBound = 0;
    let highBound = sortedArray.length; // Use length for upper bound for insertion point logic

    while (lowBound < highBound) {
      const mid = Math.floor((lowBound + highBound) / 2);
      if (getValue(sortedArray[mid]) < targetValue) {
        lowBound = mid + 1;
      } else {
        highBound = mid;
      }
    }
    return lowBound;
  }
}
const UTIL = new UtilityFunctions(); // Instantiate the utility collection

/**
 * @class InputReader
 * @description Handles reading input from standard input, parsing it into
 *              various data types (integers, strings, arrays, matrices).
 */
class InputReader {
  /**
   * @private
   * @property {number} currentLineIndex - The index of the next line to be read.
   */
  currentLineIndex = 0;
  /**
   * @private
   * @property {string[]} inputLines - An array of all input lines read from stdin.
   */
  inputLines = [];

  /**
   * @constructor
   * @description Initializes the InputReader by reading all available input.
   */
  constructor() {
    this.readAllInput();
  }

  /**
   * @method readAllInput
   * @description Reads all data from `/dev/stdin` (standard input) and splits
   *              it into an array of lines. Handles potential errors during file read.
   * @returns {string[]} The array of input lines.
   */
  readAllInput() {
    try {
      // Use `fs.readFileSync` for synchronous reading, suitable for competitive programming environments.
      // `process.stdin.fd` is the file descriptor for stdin.
      // `split(/\r?\n/)` handles both Windows (`\r\n`) and Unix (`\n`) newlines.
      this.inputLines = require('fs').readFileSync(process.stdin.fd, 'utf8').split(/\r?\n/);
      // Remove any trailing empty line that might result from splitting.
      if (this.inputLines.length > 0 && this.inputLines[this.inputLines.length - 1] === '') {
        this.inputLines.pop();
      }
    } catch (error) {
      console.error("Error reading input from stdin:", error);
      this.inputLines = []; // Ensure it's an empty array on error
    }
    return this.inputLines;
  }

  /**
   * @method getNextLines
   * @description Retrieves one or more lines from the input.
   * @param {number} [lineCount=1] - The number of lines to read.
   * @returns {string|string[]} A single string if `lineCount` is 1, otherwise an array of strings.
   */
  getNextLines(lineCount = 1) {
    if (lineCount <= 0) {
      console.warn("getNextLines: lineCount must be positive. Returning empty array.");
      return [];
    }
    const startIndex = this.currentLineIndex;
    const endIndex = startIndex + lineCount;

    if (startIndex >= this.inputLines.length) { // Guard clause for reading past end
        console.warn("Attempted to read from an empty or exhausted input stream. Returning empty data.");
        return lineCount === 1 ? undefined : [];
    }

    if (endIndex > this.inputLines.length) {
      console.warn(`Attempted to read beyond end of input. Requested ${lineCount} lines from index ${startIndex}, but only ${this.inputLines.length - startIndex} available.`);
      // Return available lines or an empty array if none are left
      const availableLines = this.inputLines.slice(startIndex);
      this.currentLineIndex = this.inputLines.length; // Move cursor to end
      return lineCount === 1 ? availableLines[0] : availableLines;
    }

    const lines = this.inputLines.slice(startIndex, endIndex);
    this.currentLineIndex = endIndex;
    return lineCount === 1 ? lines[0] : lines;
  }

  /**
   * @method readInteger
   * @description Reads the next line and parses it as an integer.
   * @returns {number} The parsed integer.
   */
  readInteger() {
    return Number.parseInt(this.getNextLines(), 10);
  }

  /**
   * @method readStringArray
   * @description Reads the next line and splits it into an array of strings by space.
   * @returns {string[]} An array of strings.
   */
  readStringArray() {
    const line = this.getNextLines();
    return typeof line === 'string' ? line.split(' ') : []; // Handle case where getNextLines returns undefined/array
  }

  /**
   * @method getIntegerArrayLine
   * @description Reads the next line, splits it by space, and parses each part as an integer.
   * @returns {number[]} An array of integers.
   */
  getIntegerArrayLine() {
    return this.readStringArray().map(Number); // `Number` is a concise way to parse to number
  }

  /**
   * @method readFloatArray
   * @description Reads the next line, splits it by space, and parses each part as a float.
   * @returns {number[]} An array of floating-point numbers.
   */
  readFloatArray() {
    return this.readStringArray().map(Number.parseFloat);
  }

  /**
   * @method readIntegerLines
   * @description Reads multiple lines and parses each as an integer.
   * @param {number} count - The number of lines to read.
   * @returns {number[]} An array of integers.
   */
  readIntegerLines(count) {
    const lines = this.getNextLines(count);
    return Array.isArray(lines) ? lines.map(Number.parseInt) : [Number.parseInt(lines)];
  }

  /**
   * @method readFloatLines
   * @description Reads multiple lines and parses each as a float.
   * @param {number} count - The number of lines to read.
   * @returns {number[]} An array of floating-point numbers.
   */
  readFloatLines(count) {
    const lines = this.getNextLines(count);
    return Array.isArray(lines) ? lines.map(Number.parseFloat) : [Number.parseFloat(lines)];
  }

  /**
   * @method readStringMatrix
   * @description Reads multiple lines, splitting each line into an array of strings.
   * @param {number} rowCount - The number of rows (lines) to read.
   * @returns {string[][]} A 2D array of strings.
   */
  readStringMatrix(rowCount) {
    const lines = this.getNextLines(rowCount);
    return Array.isArray(lines) ? lines.map(line => line.split(' ')) : [lines.split(' ')];
  }

  /**
   * @method readIntegerMatrix
   * @description Reads multiple lines, splitting each line into an array of integers.
   * @param {number} rowCount - The number of rows (lines) to read.
   * @returns {number[][]} A 2D array of integers.
   */
  readIntegerMatrix(rowCount) {
    const lines = this.getNextLines(rowCount);
    return Array.isArray(lines) ? lines.map(line => line.split(' ').map(Number)) : [lines.split(' ').map(Number)];
  }

  /**
   * @method readFloatMatrix
   * @description Reads multiple lines, splitting each line into an array of floats.
   * @param {number} rowCount - The number of rows (lines) to read.
   * @returns {number[][]} A 2D array of floating-point numbers.
   */
  readFloatMatrix(rowCount) {
    const lines = this.getNextLines(rowCount);
    return Array.isArray(lines) ? lines.map(line => line.split(' ').map(Number.parseFloat)) : [lines.split(' ').map(Number.parseFloat)];
  }
}
const inputScanner = new InputReader(); // Global instance for input reading

/**
 * @class OutputWriter
 * @description Manages writing output to standard output, with options for
 *              customizing boolean representations.
 */
class OutputWriter {
  /**
   * @private
   * @property {object} booleanOutputMap - Maps boolean values to custom string representations.
   */
  booleanOutputMap = {
    'true': 'Yes',
    'false': 'No',
  };

  /**
   * @method displayResult
   * @description Prints the given output to the console. Handles `null`/`undefined`
   *              and custom boolean representations.
   * @param {*} outputData - The data to be displayed.
   */
  displayResult(outputData) {
    let finalOutput;
    // Added explicit check for null/undefined and a specific message
    if (outputData === null || outputData === undefined) {
      finalOutput = '[No Output Data]'; // New fragment: specific message for no output
    } else if (outputData === true) {
      finalOutput = this.booleanOutputMap['true'];
    } else if (outputData === false) {
      finalOutput = this.booleanOutputMap['false'];
    } else {
      finalOutput = String(outputData); // Ensure output is always a string for console.log
    }
    console.log(finalOutput);
  }

  /**
   * @method configureBooleanOutput
   * @description Sets custom string representations for true and false.
   * @param {string[]} options - An array where `options[0]` is for false, `options[1]` for true.
   * @returns {OutputWriter} The instance (for chaining).
   */
  configureBooleanOutput(options) {
    // Added validation for the input 'options' array
    if (Array.isArray(options) && options.length >= 2 && typeof options[0] === 'string' && typeof options[1] === 'string') {
      this.booleanOutputMap['false'] = options[0];
      this.booleanOutputMap['true'] = options[1];
    } else {
      console.warn("configureBooleanOutput: Invalid options provided. Expected an array of two strings.");
    }
    return this;
  }

  /**
   * @method resetBooleanOutput
   * @description Resets boolean output to default 'Yes'/'No'.
   */
  resetBooleanOutput() {
    this.booleanOutputMap = {
      'true': 'Yes',
      'false': 'No',
    };
  }
}
const resultPrinter = new OutputWriter(); // Global instance for output writing

// Execute the main solution logic and display the result.
resultPrinter.displayResult(new SolutionProcessor().processInputAndCompute());