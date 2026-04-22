'use strict';

/**
 * Defines the main class responsible for processing input and finding the optimal configuration
 * based on a sliding window approach over a coordinate grid.
 */
class SolutionProcessor {
  /**
   * Executes the core logic to determine the maximum number of points with a specific parity
   * within a dynamically shifting KxK window on a 2Kx2K grid.
   * @returns {number} The maximum count of zero-parity points found across all configurations.
   */
  processAndDetermineOptimalValue() {
    // Read initial configuration parameters: total points (N) and segment length (K).
    const configurationParameters = dataReader.fetchIntegerArray();
    
    // --- Type III: Add guard clauses for input validation ---
    if (!configurationParameters || configurationParameters.length < 2) {
      console.error("Input Error: Insufficient configuration parameters (N and K) provided. Expected at least two numbers.");
      return 0; // Return a default or error value in case of invalid input.
    }

    const totalPointCount = configurationParameters[0];
    const unitSegmentLength = configurationParameters[1];
    
    // Another guard clause: K must be a positive integer.
    if (unitSegmentLength <= 0) {
      console.error("Input Error: Segment length (K) must be a positive integer.");
      return 0;
    }

    // Calculate double the segment length, which defines the full grid cycle (2K).
    const doubleSegmentLength = 2 * unitSegmentLength;

    // Fetch raw point data and transform it into a structured format suitable for indexing.
    // Each raw point `pointRawData` is expected to be an array like `[x_str, y_str, color_char]`.
    const inputPointList = dataReader.fetchStringMatrix(totalPointCount).map(pointRawData => {
      // --- Type III: Break down complex calculations into intermediate steps ---
      const initialXCoordinate = Number(pointRawData[0]);
      const initialYCoordinate = Number(pointRawData[1]);
      const pointColorIdentifier = pointRawData[2]; // 'B' for black, otherwise implicitly 'W' (white).

      // Adjust X coordinate based on the point's color and apply modular arithmetic.
      // If the point is 'Black', its effective X coordinate is shifted by K.
      // This transformation effectively "flips" the parity zone for black points.
      const adjustedXCoordinate = (initialXCoordinate + (pointColorIdentifier === 'B' ? unitSegmentLength : 0)) % doubleSegmentLength;
      // Adjust Y coordinate with modular arithmetic to fit within the 2K grid.
      const adjustedYCoordinate = initialYCoordinate % doubleSegmentLength;
      
      // Return a processed point object with standardized property names.
      return {
        xCoord: adjustedXCoordinate,
        yCoord: adjustedYCoordinate,
      };
    });

    // --- Type III: Add a quick exit for empty point lists ---
    if (inputPointList.length === 0) {
      return 0;
    }

    // Initialize a specialized grid structure for efficient point querying by coordinates.
    // This structure allows for fast counting of points within vertical or horizontal strips.
    const spatialIndexer = CoordinateIndexer.createInstance(inputPointList);

    // Define a helper function to determine the 'parity color' of a coordinate pair.
    // This function effectively divides the 2Kx2K grid into four KxK quadrants,
    // where adjacent quadrants have alternating 'parity' (0 or 1).
    // Parity 0: (x < K && y < K) || (x >= K && y >= K)
    // Parity 1: (x < K && y >= K) || (x >= K && y < K)
    const determineParityZone = (xValue, yValue) => {
      const xIsBeyondSegment = (xValue >= unitSegmentLength) ? 1 : 0;
      const yIsBeyondSegment = (yValue >= unitSegmentLength) ? 1 : 0;
      // The XOR operation determines if x and y fall into the "same type" or "different type" quadrants.
      return xIsBeyondSegment ^ yIsBeyondSegment;
    };

    // Calculate the initial count of points that fall into 'zero-parity' zones
    // given the default (0,0) offset for the KxK window.
    let currentZeroParityCount = inputPointList.filter(pt => determineParityZone(pt.xCoord, pt.yCoord) === 0).length;
    
    // Initialize the maximum count found so far with the initial configuration's count.
    let maximumAchievedCount = currentZeroParityCount;

    // --- Main Loop: Sliding window approach ---
    // Iterate through all possible vertical shifts (dy) for the KxK window.
    // The window shifts one unit at a time, from dy=0 up to dy=K-1.
    for (let verticalShiftIndex = 0; verticalShiftIndex < unitSegmentLength; ++verticalShiftIndex) {
      // For each vertical shift, iterate through all possible horizontal shifts (dx).
      // The horizontal shifts cover the entire 2K width of the grid, ensuring all relative
      // positions of the KxK window are considered.
      for (let horizontalShiftIndex = 0; horizontalShiftIndex < doubleSegmentLength; ++horizontalShiftIndex) {
        // --- Type III: Update max inside the loop for more frequent tracking ---
        if (currentZeroParityCount > maximumAchievedCount) {
          maximumAchievedCount = currentZeroParityCount;
        }

        // Calculate the horizontally shifted coordinate for the 'right' boundary of the window.
        // This ensures proper wrapping around the 2K grid (e.g., if dx+K goes past 2K-1, it wraps back to 0).
        const rightBoundaryX = horizontalShiftIndex + unitSegmentLength;
        const wrappedRightXCoord = rightBoundaryX % doubleSegmentLength;
        
        // --- Type III: Introduce helper variables for clarity in calculations ---
        // These counts represent points whose parity changes as the window slides horizontally.
        // `queryPointCount(x1, y1, x2, y2)` counts points in the rectangle [x1, y1] to [x2, y2)
        // (inclusive x1, y1; exclusive x2, y2).

        // Points in the vertical strip at `horizontalShiftIndex` (left edge of window).
        const pointsInLeftStrip_ZeroParity = spatialIndexer.queryPointCount(
          horizontalShiftIndex, verticalShiftIndex, horizontalShiftIndex, verticalShiftIndex + unitSegmentLength
        );
        const totalPointsInLeftStrip = spatialIndexer.getCellCount('xCoord', horizontalShiftIndex);
        const pointsInLeftStrip_OneParity = totalPointsInLeftStrip - pointsInLeftStrip_ZeroParity;

        // Points in the vertical strip at `wrappedRightXCoord` (right edge of window, K units away).
        const pointsInRightStrip_ZeroParity = spatialIndexer.queryPointCount(
          wrappedRightXCoord, verticalShiftIndex, wrappedRightXCoord, verticalShiftIndex + unitSegmentLength
        );
        const totalPointsInRightStrip = spatialIndexer.getCellCount('xCoord', wrappedRightXCoord);
        const pointsInRightStrip_OneParity = totalPointsInRightStrip - pointsInRightStrip_ZeroParity;

        // --- Type III: Rephrase the update logic for `currentZeroParityCount` ---
        // When the window slides horizontally:
        // Points leaving the left edge:
        //   - If they were zero-parity, they are now one-parity (count decreases).
        //   - If they were one-parity, they are now zero-parity (count increases).
        // Points entering the right edge:
        //   - If they were zero-parity, they are now one-parity (count decreases).
        //   - If they were one-parity, they are now zero-parity (count increases).
        // This effectively means a point's parity flips when it crosses a K-boundary.
        const horizontalChange = (pointsInLeftStrip_OneParity - pointsInLeftStrip_ZeroParity) +
                                 (pointsInRightStrip_ZeroParity - pointsInRightStrip_OneParity);
        currentZeroParityCount += horizontalChange;
      }
      
      // After completing all horizontal shifts for the current vertical position,
      // ensure the maximum count is updated before potentially changing `verticalShiftIndex`.
      if (currentZeroParityCount > maximumAchievedCount) {
        maximumAchievedCount = currentZeroParityCount;
      }

      // --- Type III: Optimization - Skip empty rows ---
      // If the current row (verticalShiftIndex) and the row K units below it (verticalShiftIndex + K)
      // are both empty (contain no points), we can safely skip ahead multiple vertical shifts.
      // This is a performance optimization and a structural update.
      while (verticalShiftIndex < unitSegmentLength &&
             spatialIndexer.getCellCount('yCoord', verticalShiftIndex) === 0 &&
             spatialIndexer.getCellCount('yCoord', verticalShiftIndex + unitSegmentLength) === 0) {
        verticalShiftIndex++;
      }

      // If the `verticalShiftIndex` has advanced past `unitSegmentLength` due to skipping,
      // it means we've processed all relevant vertical shifts, so we can break the outer loop.
      if (verticalShiftIndex === unitSegmentLength) {
        break;
      }

      // --- Calculate changes due to vertical window shift ---
      // This section prepares `currentZeroParityCount` for the *next* iteration of the outer loop.
      // It accounts for points leaving the top row and entering the bottom row of the KxK window.
      // The logic mirrors the horizontal shift, but applied to horizontal strips.

      // Points in the horizontal strip at `verticalShiftIndex` (top edge of window).
      // We only consider the first K units horizontally (0 to K-1) for this calculation.
      const pointsInTopStrip_ZeroParity = spatialIndexer.queryPointCount(
        0, verticalShiftIndex, unitSegmentLength, verticalShiftIndex
      );
      const totalPointsInTopStrip = spatialIndexer.getCellCount('yCoord', verticalShiftIndex);
      const pointsInTopStrip_OneParity = totalPointsInTopStrip - pointsInTopStrip_ZeroParity;

      // Points in the horizontal strip at `verticalShiftIndex + unitSegmentLength` (bottom edge of window).
      const pointsInBottomStrip_ZeroParity = spatialIndexer.queryPointCount(
        0, verticalShiftIndex + unitSegmentLength, unitSegmentLength, verticalShiftIndex + unitSegmentLength
      );
      const totalPointsInBottomStrip = spatialIndexer.getCellCount('yCoord', verticalShiftIndex + unitSegmentLength);
      const pointsInBottomStrip_OneParity = totalPointsInBottomStrip - pointsInBottomStrip_ZeroParity;

      // Calculate the change in zero-parity count from a vertical window shift.
      const verticalChange = (pointsInTopStrip_OneParity - pointsInTopStrip_ZeroParity) +
                             (pointsInBottomStrip_ZeroParity - pointsInBottomStrip_OneParity);
      currentZeroParityCount += verticalChange;
    }
    
    // --- Type III: Final check to ensure maximumAchievedCount is truly the max ---
    // In case the last iteration's `currentZeroParityCount` was the maximum.
    maximumAchievedCount = Math.max(maximumAchievedCount, currentZeroParityCount);

    return maximumAchievedCount;
  }
}

/**
 * Represents a specialized data structure for indexing and querying points
 * based on their coordinates, optimized for range counts on axis-aligned segments.
 * It stores points grouped by their X and Y coordinates respectively,
 * with each group sorted by the other coordinate.
 */
class CoordinateIndexer {
  // Define the default coordinate dimensions to index.
  static get StandardDimensions() {
    return ['xCoord', 'yCoord'];
  }

  // Define default sorting rules for points within each dimension's list.
  static get DefaultSortingRules() {
    return {
      'xCoord': (ptA, ptB) => ptA.yCoord - ptB.yCoord, // When grouped by xCoord, sort points by yCoord.
      'yCoord': (ptA, ptB) => ptA.xCoord - ptB.xCoord  // When grouped by yCoord, sort points by xCoord.
    };
  }

  /**
   * Factory method to create and initialize a new CoordinateIndexer instance.
   * This provides a clean interface for instantiation and setup.
   * @param {Array<Object>} pointObjects - The list of point objects to index. Each object must have 'xCoord' and 'yCoord'.
   * @param {Array<string>} [additionalDimensions=[]] - Optional additional dimensions (e.g., 'zCoord') to index.
   * @param {Object} [customSortingRules={}] - Optional custom sorting functions for specified dimensions.
   * @returns {CoordinateIndexer} A fully initialized CoordinateIndexer.
   */
  static createInstance(pointObjects, additionalDimensions = [], customSortingRules = {}) {
    const newIndexer = new CoordinateIndexer();
    newIndexer.initializeIndexer(pointObjects, additionalDimensions, customSortingRules);
    return newIndexer;
  }

  /**
   * Constructor for the CoordinateIndexer. Initializes internal storage properties.
   */
  constructor() {
    /**
     * @private
     * @type {Object<string, Object<number, Array<Object>>>}
     * Stores points indexed by dimension name and then by coordinate value.
     * e.g., `indexedCoordinateLists.xCoord[10]` would be an array of points where xCoord is 10.
     */
    this.indexedCoordinateLists = {};
    
    /**
     * @private
     * @type {Array<string>} The list of dimensions (e.g., 'xCoord', 'yCoord') that this indexer is actively managing.
     */
    this.activeDimensions = [];
    
    /**
     * @private
     * @type {Object<string, Function>} A mapping of dimension names to their specific sorting functions.
     * These functions are used to sort the arrays of points within each coordinate group.
     */
    this.dimensionSortComparators = {};
  }

  /**
   * Retrieves the number of points located at a specific coordinate value for a given dimension.
   * This is useful for quickly checking the density of points along an axis.
   * @param {string} dimensionName - The name of the dimension ('xCoord', 'yCoord', etc.).
   * @param {number} coordinateValue - The specific coordinate value to query.
   * @returns {number} The count of points found at that coordinate, or 0 if no points exist.
   */
  getCellCount(dimensionName, coordinateValue) {
    const targetList = this.indexedCoordinateLists[dimensionName]?.[coordinateValue];
    return targetList ? targetList.length : 0;
  }

  /**
   * Initializes or re-initializes the indexer with a new list of points.
   * This method builds the internal data structures for efficient querying.
   * @param {Array<Object>} pointsToIndex - An array of point objects. Each object should contain the properties defined in `activeDimensions`.
   * @param {Array<string>} [extraDimensions=[]] - Optional array of additional dimension names to include in indexing.
   * @param {Object} [supplementarySortRules={}] - Optional object with custom sorting functions for dimensions.
   * @returns {CoordinateIndexer} The initialized instance, allowing for method chaining.
   */
  initializeIndexer(pointsToIndex, extraDimensions = [], supplementarySortRules = {}) {
    // --- Type III: Add input validation for robustness ---
    if (!Array.isArray(pointsToIndex)) {
      console.warn("CoordinateIndexer: Input for initialization is not an array. Indexer will be empty.");
      this.indexedCoordinateLists = {};
      this.activeDimensions = [];
      return this;
    }

    // Combine default and any additional dimensions.
    this.activeDimensions = CoordinateIndexer.StandardDimensions.concat(extraDimensions);
    // Merge default and any supplementary sorting rules.
    this.dimensionSortComparators = { ...CoordinateIndexer.DefaultSortingRules, ...supplementarySortRules };
    
    // Reset any previously indexed data to ensure a fresh start.
    this.indexedCoordinateLists = {};

    // First pass: Initialize empty containers for each dimension and coordinate value.
    this.activeDimensions.forEach(dim => {
      this.indexedCoordinateLists[dim] = {};
    });

    // Second pass: Populate the indexed lists with points.
    for (const singlePoint of pointsToIndex) {
      for (const dim of this.activeDimensions) {
        const coordValue = singlePoint[dim];
        if (coordValue === undefined || coordValue === null) {
          // --- Type III: Add a warning for missing dimension data ---
          // This indicates a malformed point object for the current dimension.
          console.warn(`CoordinateIndexer: Point object missing dimension '${dim}' data. Skipping for this dimension.`);
          continue;
        }
        // If this coordinate value hasn't been seen for this dimension, create its list.
        if (!this.indexedCoordinateLists[dim][coordValue]) {
          this.indexedCoordinateLists[dim][coordValue] = [];
        }
        this.indexedCoordinateLists[dim][coordValue].push(singlePoint);
      }
    }

    // Third pass: Sort each list of points within each coordinate group.
    this.activeDimensions.forEach(dim => {
      const coordinateGroups = this.indexedCoordinateLists[dim];
      const sortFunction = this.dimensionSortComparators[dim];
      
      if (!sortFunction) {
        // --- Type III: Add a warning if a sorting function is missing ---
        console.warn(`CoordinateIndexer: No sorting function defined for dimension '${dim}'. Skipping sort for this dimension.`);
        return;
      }

      // Iterate through each specific coordinate value (e.g., all points where xCoord = 5).
      for (const coordValue in coordinateGroups) {
        // Ensure we're only processing own properties, not inherited ones.
        if (Object.prototype.hasOwnProperty.call(coordinateGroups, coordValue)) {
          coordinateGroups[coordValue].sort(sortFunction);
        }
      }
    });

    return this; // Return `this` for fluent API chaining.
  }

  /**
   * Retrieves a specific point by its exact x and y coordinates.
   * This method is intended for single point lookups. For range queries, use `queryPointCount`.
   * @param {number} xVal - The x-coordinate of the point to retrieve.
   * @param {number} yVal - The y-coordinate of the point to retrieve.
   * @returns {Object | null} The point object if an exact match is found, otherwise null.
   */
  retrievePoint(xVal, yVal) {
    const xIndexedList = this.indexedCoordinateLists.xCoord?.[xVal];
    if (!xIndexedList || xIndexedList.length === 0) {
      return null; // No points at this x-coordinate.
    }
    // Use the global utility binary search to find the potential index for yVal within the x-list.
    const searchIndex = utilityFunctions.findInsertionPoint(xIndexedList, yVal, 'yCoord');
    
    // Validate if the point at `searchIndex` actually matches the target y-coordinate.
    if (searchIndex < xIndexedList.length && xIndexedList[searchIndex].yCoord === yVal) {
      return xIndexedList[searchIndex];
    }
    return null; // Point not found.
  }

  /**
   * Counts the number of points within a specified axis-aligned rectangular range.
   * This method currently supports only vertical (x1=x2) or horizontal (y1=y2) segments.
   * The range definition is inclusive for the starting coordinate and exclusive for the ending coordinate.
   * E.g., `queryPointCount(x1, y1, x1, y2)` counts points where `x` is `x1` and `y` is in `[y1, y2)`.
   * @param {number} xStart - The starting x-coordinate of the query range.
   * @param {number} yStart - The starting y-coordinate of the query range.
   * @param {number} xEnd - The ending x-coordinate of the query range (exclusive for range).
   * @param {number} yEnd - The ending y-coordinate of the query range (exclusive for range).
   * @returns {number} The count of points in the specified range. Returns -1 for unsupported diagonal queries.
   */
  queryPointCount(xStart, yStart, xEnd, yEnd) {
    // --- Type III: Normalize range coordinates for consistent binary search behavior ---
    const effectiveX1 = Math.min(xStart, xEnd);
    const effectiveX2 = Math.max(xStart, xEnd);
    const effectiveY1 = Math.min(yStart, yEnd);
    const effectiveY2 = Math.max(yStart, yEnd);

    // Case 1: Vertical segment query (x-coordinates are identical).
    if (xStart === xEnd) {
      const columnPoints = this.indexedCoordinateLists.xCoord?.[xStart];
      if (!columnPoints) {
        return 0; // No points exist at this x-coordinate.
      }
      // Find the insertion points for the lower and upper bounds of the y-range.
      const lowerBoundIndex = utilityFunctions.findInsertionPoint(columnPoints, effectiveY1, 'yCoord');
      const upperBoundIndex = utilityFunctions.findInsertionPoint(columnPoints, effectiveY2, 'yCoord');
      return upperBoundIndex - lowerBoundIndex; // Count is the difference between indices.
    }

    // Case 2: Horizontal segment query (y-coordinates are identical).
    if (yStart === yEnd) {
      const rowPoints = this.indexedCoordinateLists.yCoord?.[yStart];
      if (!rowPoints) {
        return 0; // No points exist at this y-coordinate.
      }
      // Find the insertion points for the lower and upper bounds of the x-range.
      const lowerBoundIndex = utilityFunctions.findInsertionPoint(rowPoints, effectiveX1, 'xCoord');
      const upperBoundIndex = utilityFunctions.findInsertionPoint(rowPoints, effectiveX2, 'xCoord');
      return upperBoundIndex - lowerBoundIndex;
    }

    // --- Type III: Add a warning for unsupported query types ---
    console.warn(`CoordinateIndexer: Query for range [${xStart},${yStart}) to [${xEnd},${yEnd}) is not supported as an axis-aligned segment count. Returning -1.`);
    return -1; // Indicate an unsupported query (e.g., non-axis-aligned rectangle or single point).
  }

  /**
   * Fetches an array of point objects that fall within a specified axis-aligned segment.
   * Similar to `queryPointCount` but returns the actual point objects instead of just a count.
   * @param {number} x1 - Starting x-coordinate.
   * @param {number} y1 - Starting y-coordinate.
   * @param {number} x2 - Ending x-coordinate (exclusive for range).
   * @param {number} y2 - Ending y-coordinate (exclusive for range).
   * @returns {Array<Object>} An array of point objects found within the segment. Returns an empty array for unsupported queries.
   */
  fetchPointsInRegion(x1, y1, x2, y2) {
    const collectedPoints = [];
    
    // Normalize coordinates to ensure start <= end for range iteration logic.
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);

    if (x1 === x2) { // Query for a vertical segment.
      const columnPoints = this.indexedCoordinateLists.xCoord?.[x1];
      if (!columnPoints) {
        return collectedPoints; // No points in this column.
      }
      // Find the range of points in the column that fall within [startY, endY).
      const lowerIndex = utilityFunctions.findInsertionPoint(columnPoints, startY, 'yCoord');
      const upperIndex = utilityFunctions.findInsertionPoint(columnPoints, endY, 'yCoord');
      for (let idx = lowerIndex; idx < upperIndex; ++idx) {
        collectedPoints.push(columnPoints[idx]);
      }
      return collectedPoints;
    }
    
    if (y1 === y2) { // Query for a horizontal segment.
      const rowPoints = this.indexedCoordinateLists.yCoord?.[y1];
      if (!rowPoints) {
        return collectedPoints; // No points in this row.
      }
      // Find the range of points in the row that fall within [startX, endX).
      const lowerIndex = utilityFunctions.findInsertionPoint(rowPoints, startX, 'xCoord');
      const upperIndex = utilityFunctions.findInsertionPoint(rowPoints, endX, 'xCoord');
      for (let idx = lowerIndex; idx < upperIndex; ++idx) {
        collectedPoints.push(rowPoints[idx]);
      }
      return collectedPoints;
    }
    
    // --- Type III: Add a warning for unsupported query types ---
    console.warn(`CoordinateIndexer: Attempted to fetch points for a non-axis-aligned region: [${x1},${y1}] to [${x2},${y2}]. Returning empty array.`);
    return []; // Return empty for unsupported query type.
  }
}

/**
 * A utility class for performing modular arithmetic operations (addition, multiplication, power, division, combinations).
 * It encapsulates a specific modulus value to ensure all results remain within the modular field.
 */
class ModularArithmeticHelper {
  // Define a sensible default modulus value if none is provided.
  static get DEFAULT_MODULUS() {
    return 1_000_000_007; // A common prime modulus (10^9 + 7) used in competitive programming.
  }

  /**
   * Constructs a new ModularArithmeticHelper instance with a specified modulus.
   * @param {number} modulusValue - The positive integer modulus to use for all operations.
   *                                If null, undefined, or invalid, the `DEFAULT_MODULUS` will be used.
   */
  constructor(modulusValue) {
    // --- Type III: Add input validation for the modulus value ---
    if (typeof modulusValue !== 'number' || modulusValue <= 0 || !Number.isInteger(modulusValue)) {
      console.warn(`ModularArithmeticHelper: Invalid modulus value '${modulusValue}' provided. Using default modulus: ${ModularArithmeticHelper.DEFAULT_MODULUS}`);
      this.currentModulus = ModularArithmeticHelper.DEFAULT_MODULUS;
    } else {
      this.currentModulus = modulusValue;
    }
  }

  /**
   * Performs modular addition of two numbers.
   * @param {number} operandA - The first number.
   * @param {number} operandB - The second number.
   * @returns {number} The result of `(operandA + operandB) % currentModulus`.
   */
  addModulo(operandA, operandB) {
    // Ensure operands are within the modulus range before addition to prevent overflow.
    return (Number(operandA) % this.currentModulus + Number(operandB) % this.currentModulus) % this.currentModulus;
  }

  /**
   * Performs modular multiplication of two numbers using a method similar to binary exponentiation
   * to prevent overflow for very large intermediate products before the modulo operation.
   * @param {number} factorA - The first factor.
   * @param {number} factorB - The second factor.
   * @returns {number} The result of `(factorA * factorB) % currentModulus`.
   */
  multiplyModulo(factorA, factorB) {
    let resultAccumulator = 0;
    // Ensure factors are reduced modulo `currentModulus` at the start.
    let aReduced = factorA % this.currentModulus;
    let bReduced = factorB % this.currentModulus;

    // Use a loop that mimics binary multiplication.
    while (bReduced > 0) {
      // If the last bit of `bReduced` is 1, add `aReduced` to the result.
      if (bReduced & 1) {
        resultAccumulator = this.addModulo(resultAccumulator, aReduced);
      }
      // Double `aReduced`, keeping it within modulus.
      aReduced = this.addModulo(aReduced, aReduced);
      // Right shift `bReduced` (equivalent to integer division by 2).
      bReduced >>= 1;
    }
    return resultAccumulator;
  }

  /**
   * Calculates `(baseValue ^ exponentValue) % currentModulus` using binary exponentiation (exponentiation by squaring).
   * This method is efficient for large exponents.
   * @param {number} baseValue - The base number.
   * @param {number} exponentValue - The non-negative integer exponent.
   * @returns {number} The result of `(baseValue ^ exponentValue) % currentModulus`.
   */
  powerModulo(baseValue, exponentValue) {
    let result = 1;
    let currentBase = baseValue % this.currentModulus; // Reduce base initially.

    while (exponentValue > 0) {
      // If the exponent is odd, multiply the current result by the current base.
      if (exponentValue & 1) {
        result = this.multiplyModulo(result, currentBase);
      }
      // Square the current base for the next iteration.
      currentBase = this.multiplyModulo(currentBase, currentBase);
      // Halve the exponent.
      exponentValue >>= 1;
    }
    return result;
  }

  /**
   * Performs modular division `(numeratorValue / denominatorValue) % currentModulus`.
   * This is computed as `numeratorValue * (denominatorValue ^ (modulus - 2)) % currentModulus`,
   * using Fermat's Little Theorem for modular inverse (valid when `currentModulus` is prime).
   * @param {number} numeratorValue - The numerator.
   * @param {number} denominatorValue - The denominator.
   * @returns {number} The result of the modular division.
   * @throws {Error} If `denominatorValue` is 0, as modular division by zero is undefined.
   */
  divideModulo(numeratorValue, denominatorValue) {
    if (denominatorValue === 0) {
      // --- Type III: Add error handling for division by zero ---
      throw new Error("ModularArithmeticHelper: Modular division by zero is not allowed.");
    }
    // Calculate the modular multiplicative inverse of the denominator.
    const inverseDenominator = this.powerModulo(denominatorValue, this.currentModulus - 2);
    return this.multiplyModulo(numeratorValue, inverseDenominator);
  }

  /**
   * Calculates combinations (n choose k) modulo `currentModulus`.
   * This method assumes that pre-computed factorial and inverse factorial tables (`factTable` and `invFactTable`)
   * are available in the global scope or passed as context.
   * @param {number} totalItems - `n`, the total number of items.
   * @param {number} chosenItems - `k`, the number of items to choose.
   * @returns {number} `(nCk) % currentModulus`. Returns 0 for invalid inputs (k < 0 or k > n).
   */
  combinationsModulo(totalItems, chosenItems) {
    // --- Type III: Add guard clauses for invalid inputs ---
    if (chosenItems < 0 || chosenItems > totalItems) {
      return 0;
    }
    // This method implicitly depends on globally accessible `factTable` and `invFactTable`.
    // In a more robust Type III clone, these might be properties of the class or passed as arguments.
    if (!factTable || !invFactTable || factTable.length <= totalItems || invFactTable.length <= totalItems) {
      console.error("ModularArithmeticHelper: Factorial tables (factTable, invFactTable) are required for combinationsModulo but are not sufficiently pre-computed or available.");
      return 0; // Return 0 or throw an error if tables are missing.
    }
    
    const numeratorFactorial = factTable[totalItems];
    const inverseFactorialK = invFactTable[chosenItems];
    const inverseFactorialNMinusK = invFactTable[totalItems - chosenItems];

    const tempProduct = this.multiplyModulo(numeratorFactorial, inverseFactorialK);
    return this.multiplyModulo(tempProduct, inverseFactorialNMinusK);
  }
}

// Instantiate the modular arithmetic helper with the common default modulus.
const MOD_ARITHMETIC_UTILITY = new ModularArithmeticHelper(ModularArithmeticHelper.DEFAULT_MODULUS);

// --- Type III: Add placeholder declarations for factorial tables ---
// In a full solution, these would be populated based on the maximum 'n' expected.
let factTable = [];
let invFactTable = [];

/**
 * A collection of common utility functions for array manipulation,
 * mathematical operations, and searching. Designed for general-purpose use.
 */
class UtilityFunctions {
  /**
   * Calculates the sum of all numeric elements in an array.
   * @param {Array<number>} numericArray - The array of numbers to sum.
   * @returns {number} The total sum. Returns 0 for an empty or invalid array.
   */
  calculateSum(numericArray) {
    // --- Type III: Add input validation ---
    if (!Array.isArray(numericArray) || numericArray.length === 0) {
      return 0;
    }
    return numericArray.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  }

  /**
   * Calculates the sum of all numeric elements in an array, applying a modulus.
   * @param {Array<number>} numericArray - The array of numbers to sum.
   * @param {number} [modulus=MOD_ARITHMETIC_UTILITY.currentModulus] - The modulus to apply.
   * @returns {number} The modular sum. Returns 0 for an empty or invalid array.
   */
  calculateModularSum(numericArray, modulus = MOD_ARITHMETIC_UTILITY.currentModulus) {
    if (!Array.isArray(numericArray) || numericArray.length === 0) {
      return 0;
    }
    let currentSum = 0;
    for (const val of numericArray) {
      currentSum = MOD_ARITHMETIC_UTILITY.addModulo(currentSum, val);
    }
    return currentSum;
  }

  /**
   * Finds the minimum element in an array based on a provided comparison function.
   * @param {Array<any>} dataArray - The array to search.
   * @param {Function} [comparisonFn=(a, b) => a - b] - A function that returns <0 if a<b, >0 if a>b, 0 if a==b.
   * @returns {any | undefined} The minimum element, or `undefined` if the array is empty or invalid.
   */
  findMinimum(dataArray, comparisonFn = (a, b) => a - b) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return undefined;
    }
    return dataArray.reduce((currentMin, element) => comparisonFn(currentMin, element) < 0 ? currentMin : element);
  }

  /**
   * Finds the maximum element in an array based on a provided comparison function.
   * @param {Array<any>} dataArray - The array to search.
   * @param {Function} [comparisonFn=(a, b) => a - b] - A function that returns <0 if a<b, >0 if a>b, 0 if a==b.
   * @returns {any | undefined} The maximum element, or `undefined` if the array is empty or invalid.
   */
  findMaximum(dataArray, comparisonFn = (a, b) => a - b) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return undefined;
    }
    return dataArray.reduce((currentMax, element) => comparisonFn(currentMax, element) > 0 ? currentMax : element);
  }

  /**
   * Sorts an array in place using an optional comparison function.
   * Returns a reference to the sorted array.
   * @param {Array<any>} dataArray - The array to sort.
   * @param {Function} [comparisonFn=(a, b) => a - b] - A function that defines the sort order.
   * @returns {Array<any>} The sorted array (same reference as input). Returns empty array for invalid input.
   */
  sortArrayInPlace(dataArray, comparisonFn = (a, b) => a - b) {
    if (!Array.isArray(dataArray)) {
      console.warn("UtilityFunctions: Input for sortArrayInPlace is not an array. Returning empty array.");
      return [];
    }
    dataArray.sort(comparisonFn);
    return dataArray;
  }

  /**
   * Returns a new array containing only the unique elements from the input array.
   * The original array is not modified. This method is efficient and preserves order of first appearance.
   * @param {Array<any>} dataArray - The array to process.
   * @returns {Array<any>} A new array with unique elements. Returns empty array for invalid input.
   */
  getUniqueElements(dataArray) {
    if (!Array.isArray(dataArray)) {
      console.warn("UtilityFunctions: Input for getUniqueElements is not an array. Returning empty array.");
      return [];
    }
    // --- Type III: Update to use modern Set for uniqueness ---
    return Array.from(new Set(dataArray));
  }

  /**
   * Generates a sequence of numbers within a specified range.
   * @param {number} [start=0] - The starting number of the sequence (inclusive).
   * @param {number} [end] - The ending number of the sequence (exclusive). If omitted, `start` becomes `end` and `start` is 0.
   * @param {number} [step] - The increment or decrement between numbers. Defaults to 1 or -1 based on `start` and `end`.
   * @returns {Array<number>} An array containing the generated number sequence. Returns empty array for invalid steps.
   */
  generateNumberRange(start = 0, end, step) {
    if (end === undefined) { // If only one argument, it's the `end`.
      end = start;
      start = 0;
    }
    if (step === undefined) {
      step = end < start ? -1 : 1; // Default step based on direction.
    }

    const outputRange = [];
    if (step === 0) {
      console.warn("UtilityFunctions: Step cannot be zero for generateNumberRange. Returning empty array.");
      return outputRange;
    }

    // --- Type III: Rephrase loop for clarity based on step direction ---
    if (step > 0) {
      for (let i = start; i < end; i += step) {
        outputRange.push(i);
      }
    } else { // step < 0
      for (let i = start; i > end; i += step) {
        outputRange.push(i);
      }
    }
    return outputRange;
  }

  /**
   * Retrieves the first `numElements` elements from an array.
   * @param {Array<any>} sourceArray - The array to extract from.
   * @param {number} [numElements=1] - The number of elements to retrieve. Defaults to 1.
   * @returns {any | Array<any> | undefined} The first element if `numElements` is 1 (or omitted),
   *                                            an array of the first `n` elements, or `undefined`/empty array for invalid input.
   */
  getFirstElements(sourceArray, numElements = 1) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return numElements === 1 ? undefined : []; // Consistent return for empty array.
    }
    if (numElements === 1) {
      return sourceArray[0];
    }
    return sourceArray.slice(0, Math.max(0, numElements));
  }

  /**
   * Retrieves all elements of an array except the last `numToExclude` elements.
   * @param {Array<any>} sourceArray - The array to process.
   * @param {number} [numToExclude=1] - The number of elements to exclude from the end. Defaults to 1.
   * @returns {Array<any>} A new array containing the initial segment. Returns empty array for invalid input.
   */
  getInitialSegment(sourceArray, numToExclude = 1) {
    if (!Array.isArray(sourceArray)) return [];
    return sourceArray.slice(0, Math.max(0, sourceArray.length - numToExclude));
  }

  /**
   * Retrieves all elements of an array except the first `numToExclude` elements.
   * @param {Array<any>} sourceArray - The array to process.
   * @param {number} [numToExclude=1] - The number of elements to exclude from the beginning. Defaults to 1.
   * @returns {Array<any>} A new array containing the tail segment. Returns empty array for invalid input.
   */
  getTailSegment(sourceArray, numToExclude = 1) {
    if (!Array.isArray(sourceArray)) return [];
    return sourceArray.slice(Math.max(0, numToExclude));
  }

  /**
   * Retrieves the last `numElements` elements from an array.
   * @param {Array<any>} sourceArray - The array to extract from.
   * @param {number} [numElements=1] - The number of elements to retrieve. Defaults to 1.
   * @returns {any | Array<any> | undefined} The last element if `numElements` is 1 (or omitted),
   *                                            an array of the last `n` elements, or `undefined`/empty array for invalid input.
   */
  getLastElements(sourceArray, numElements = 1) {
    if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
      return numElements === 1 ? undefined : []; // Consistent return for empty array.
    }
    if (numElements === 1) {
      return sourceArray[sourceArray.length - 1];
    }
    return sourceArray.slice(Math.max(0, sourceArray.length - numElements));
  }

  /**
   * Computes the prefix sums (cumulative sums) of a numeric array.
   * The result array will have the same length as the input, where `result[i]` is the sum of `array[0]` to `array[i]`.
   * @param {Array<number>} numericArray - The input array.
   * @returns {Array<number>} An array of prefix sums. Returns empty array for invalid input.
   */
  calculatePrefixSums(numericArray) {
    if (!Array.isArray(numericArray)) return [];
    const sums = [];
    let currentTotal = 0;
    // --- Type III: Rewrite `reduce` to simple loop for clarity ---
    for (const val of numericArray) {
      currentTotal += val;
      sums.push(currentTotal);
    }
    return sums;
  }

  /**
   * Computes the differences between adjacent elements in a numeric array.
   * `result[i] = array[i+1] - array[i]`.
   * @param {Array<number>} numericArray - The input array.
   * @returns {Array<number>} An array of differences. Returns empty array if input has less than 2 elements.
   */
  calculateDifferences(numericArray) {
    if (!Array.isArray(numericArray) || numericArray.length < 2) return [];
    const differences = [];
    for (let i = 0; i < numericArray.length - 1; ++i) {
      differences.push(numericArray[i + 1] - numericArray[i]);
    }
    return differences;
  }

  /**
   * Performs a binary search on a sorted array to find the insertion point
   * for a given key. The returned index represents the first position where
   * the `searchKey` could be inserted without violating the sorted order.
   * This is equivalent to `std::lower_bound` in C++.
   * @param {Array<any>} sortedArray - The array to search, which must be sorted according to the `propertyAccessor` or value.
   * @param {any} searchKey - The value or object representing the key to search for.
   * @param {string} [propertyAccessor] - If `sortedArray` contains objects, this is the property name to compare.
   * @returns {number} The index (0-based) where the `searchKey` should be inserted.
   */
  findInsertionPoint(sortedArray, searchKey, propertyAccessor) {
    // --- Type III: Add input validation ---
    if (!Array.isArray(sortedArray)) {
      console.warn("UtilityFunctions: Input for findInsertionPoint is not an array. Returning 0.");
      return 0;
    }
    
    // --- Type III: Introduce a helper function for accessing values ---
    const getValueForComparison = (element) => {
      return propertyAccessor && typeof element === 'object' && element !== null ? element[propertyAccessor] : element;
    };

    const targetValue = getValueForComparison(searchKey);
    let lowIndex = 0;
    let highIndex = sortedArray.length; // Exclusive upper bound for binary search.

    while (lowIndex < highIndex) {
      const midIndex = Math.floor((lowIndex + highIndex) / 2);
      if (getValueForComparison(sortedArray[midIndex]) < targetValue) {
        lowIndex = midIndex + 1;
      } else {
        highIndex = midIndex; // Potential insertion point.
      }
    }
    return lowIndex;
  }
}
const utilityFunctions = new UtilityFunctions();

/**
 * A class designed to read input data from stdin, parse it, and provide it
 * in various structured formats (lines, integers, arrays, matrices).
 */
class DataStreamReader {
  /**
   * Initializes the DataStreamReader, loads all input data from stdin, and sets the cursor.
   */
  constructor() {
    /** @type {number} The current position (index) in the `rawInputLines` array. */
    this.readCursor = 0;
    /** @type {Array<string>} All lines of input data read from stdin. */
    this.rawInputLines = [];
    this.loadAllInputData();
  }

  /**
   * Reads all available input from stdin using Node.js `fs` module and stores it as an array of strings.
   * Handles potential file read errors and normalizes line endings.
   * --- Type III: Added error handling and line ending normalization. ---
   */
  loadAllInputData() {
    try {
      const fileSystem = require("fs");
      const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
      // Split the content into lines, handling both LF and CRLF line endings.
      this.rawInputLines = inputContent.split(/\r?\n/);
      // Remove any trailing empty line that might result if the input file ends with a newline.
      if (this.rawInputLines.length > 0 && this.rawInputLines[this.rawInputLines.length - 1] === '') {
        this.rawInputLines.pop();
      }
    } catch (error) {
      console.error("DataStreamReader Error: Failed to read input from /dev/stdin:", error);
      this.rawInputLines = []; // Ensure it's an empty array on error to prevent further issues.
    }
  }

  /**
   * Checks if there are more lines available to read in the input stream.
   * --- Type III: New helper method for better control flow. ---
   * @returns {boolean} True if more lines exist, false otherwise.
   */
  hasMoreLines() {
    return this.readCursor < this.rawInputLines.length;
  }

  /**
   * Fetches one or more lines from the input stream, advancing the cursor.
   * @param {number} [numberOfLines] - The number of lines to fetch. If omitted or 1, fetches a single line.
   * @returns {string | Array<string> | undefined} A single line string, an array of strings, or `undefined` if no more lines.
   */
  fetchLine(numberOfLines) {
    if (!this.hasMoreLines()) {
      console.warn("DataStreamReader: Attempted to read beyond end of input stream.");
      return numberOfLines ? [] : undefined; // Return appropriate empty value.
    }

    if (numberOfLines === undefined || numberOfLines === 1) {
      return this.rawInputLines[this.readCursor++]; // Fetch a single line and advance cursor.
    } else if (numberOfLines > 1) {
      // Fetch multiple lines.
      const endIndex = Math.min(this.readCursor + numberOfLines, this.rawInputLines.length);
      const lines = this.rawInputLines.slice(this.readCursor, endIndex);
      this.readCursor = endIndex; // Advance cursor by the number of lines read.
      return lines;
    } else {
      console.warn(`DataStreamReader: Invalid number of lines requested: ${numberOfLines}. Returning empty array.`);
      return [];
    }
  }

  /**
   * Fetches the next line and parses it as a single integer.
   * @returns {number | NaN} The parsed integer, or `NaN` if parsing fails or no line is available.
   */
  fetchInteger() {
    const line = this.fetchLine();
    return line !== undefined ? Number(line) : NaN; // Use Number() for explicit type conversion.
  }

  /**
   * Fetches the next line, splits it by space, and returns an array of strings.
   * @returns {Array<string>} An array of strings. Returns an empty array if no line is available.
   */
  fetchStringArray() {
    const line = this.fetchLine();
    return line !== undefined ? line.split(' ') : [];
  }

  /**
   * Fetches the next line, splits it by space, and parses each element as an integer.
   * @returns {Array<number>} An array of integers. Returns an empty array if no line is available.
   */
  fetchIntegerArray() {
    return this.fetchStringArray().map(Number); // Efficiently convert all to numbers.
  }

  /**
   * Fetches the next line, splits it by space, and parses each element as a floating-point number.
   * @returns {Array<number>} An array of floats. Returns an empty array if no line is available.
   */
  fetchFloatArray() {
    return this.fetchStringArray().map(parseFloat);
  }

  /**
   * Fetches multiple lines and parses each as a single integer.
   * @param {number} numLines - The number of lines to fetch.
   * @returns {Array<number>} An array of integers. Returns an empty array for invalid input or if no lines are available.
   */
  fetchIntegerLines(numLines) {
    const lines = this.fetchLine(numLines);
    if (!Array.isArray(lines)) { // Handle case where fetchLine returns a single string (if numLines was 1).
      return lines !== undefined ? [Number(lines)] : [];
    }
    return lines.map(Number);
  }

  /**
   * Fetches multiple lines and parses each as a single floating-point number.
   * @param {number} numLines - The number of lines to fetch.
   * @returns {Array<number>} An array of floats. Returns an empty array for invalid input or if no lines are available.
   */
  fetchFloatLines(numLines) {
    const lines = this.fetchLine(numLines);
    if (!Array.isArray(lines)) {
      return lines !== undefined ? [parseFloat(lines)] : [];
    }
    return lines.map(parseFloat);
  }

  /**
   * Fetches multiple lines and splits each line into an array of strings, forming a 2D array (matrix).
   * @param {number} numRows - The number of rows (lines) to fetch.
   * @returns {Array<Array<string>>} A 2D array of strings. Returns an empty array for invalid input or if no lines are available.
   */
  fetchStringMatrix(numRows) {
    const lines = this.fetchLine(numRows);
    if (!Array.isArray(lines)) {
      return lines !== undefined ? [lines.split(' ')] : [];
    }
    return lines.map(line => line.split(' '));
  }

  /**
   * Fetches multiple lines and splits each line into an array of integers, forming a 2D array (matrix).
   * @param {number} numRows - The number of rows (lines) to fetch.
   * @returns {Array<Array<number>>} A 2D array of integers. Returns an empty array for invalid input or if no lines are available.
   */
  fetchIntegerMatrix(numRows) {
    const lines = this.fetchLine(numRows);
    if (!Array.isArray(lines)) {
      return lines !== undefined ? [lines.split(' ').map(Number)] : [];
    }
    return lines.map(line => line.split(' ').map(Number));
  }

  /**
   * Fetches multiple lines and splits each line into an array of floating-point numbers, forming a 2D array (matrix).
   * @param {number} numRows - The number of rows (lines) to fetch.
   * @returns {Array<Array<number>>} A 2D array of floats. Returns an empty array for invalid input or if no lines are available.
   */
  fetchFloatMatrix(numRows) {
    const lines = this.fetchLine(numRows);
    if (!Array.isArray(lines)) {
      return lines !== undefined ? [lines.split(' ').map(parseFloat)] : [];
    }
    return lines.map(line => line.split(' ').map(parseFloat));
  }
}
const dataReader = new DataStreamReader();

/**
 * A utility class for formatting and printing output to the console.
 * Provides options for customizing boolean output strings and handles various data types.
 */
class OutputFormatter {
  /**
   * Initializes the OutputFormatter with default boolean string representations.
   */
  constructor() {
    /**
     * @private
     * @type {Map<boolean, string>} Stores custom string representations for boolean `true` and `false`.
     */
    this.booleanOutputMap = new Map([
      [true, 'Yes'],
      [false, 'No']
    ]);
  }

  /**
   * Displays a given value to the console.
   * Handles special formatting for boolean values based on configured options,
   * and provides enhanced output for arrays and objects.
   * If the input is `null` or `undefined`, it logs a default warning message.
   * @param {any} valueToDisplay - The value to be written to the console.
   */
  displayResult(valueToDisplay) {
    let formattedOutput;

    // --- Type III: Explicitly handle null/undefined values with a warning ---
    if (valueToDisplay === null || valueToDisplay === undefined) {
      formattedOutput = "OutputManager Warning: The value to display is null or undefined.";
      console.warn(formattedOutput);
      return; // Do not proceed to log `null` or `undefined` directly.
    }

    // Check if the value is a boolean and has a custom mapping.
    if (typeof valueToDisplay === 'boolean' && this.booleanOutputMap.has(valueToDisplay)) {
      formattedOutput = this.booleanOutputMap.get(valueToDisplay);
    }
    // --- Type III: Enhance output for arrays and objects for better readability ---
    else if (Array.isArray(valueToDisplay)) {
      formattedOutput = `[${valueToDisplay.join(', ')}]`; // Format arrays nicely.
    }
    else if (typeof valueToDisplay === 'object') {
      try {
        formattedOutput = JSON.stringify(valueToDisplay, null, 2); // Pretty-print objects.
      } catch (e) {
        formattedOutput = `[Object] (Error stringifying: ${e.message})`;
        console.warn(`OutputManager: Could not stringify object: ${e.message}`);
      }
    }
    // For all other types (numbers, strings, etc.), use their default string representation.
    else {
      formattedOutput = String(valueToDisplay);
    }
    
    console.log(formattedOutput);
  }

  /**
   * Configures the strings to be used for boolean `true` and `false` output.
   * @param {Array<string>} customBooleanStrings - An array where `customBooleanStrings[0]` is for false, and `customBooleanStrings[1]` is for true.
   * @returns {OutputFormatter} The current instance, allowing for method chaining.
   */
  configureBooleanOutput(customBooleanStrings) {
    // --- Type III: Add input validation for custom boolean strings ---
    if (!Array.isArray(customBooleanStrings) || customBooleanStrings.length < 2) {
      console.error("OutputManager Error: Invalid input for configureBooleanOutput. Expected an array of two strings.");
      return this;
    }
    this.booleanOutputMap.set(false, customBooleanStrings[0]);
    this.booleanOutputMap.set(true, customBooleanStrings[1]);
    return this;
  }

  /**
   * Logs an error message to the console, prefixed for clarity.
   * --- Type III: New helper method for consistent error logging. ---
   * @param {string} errorMessage - The error message to log.
   */
  logError(errorMessage) {
    console.error(`OUTPUT ERROR: ${errorMessage}`);
  }
}

const consoleOutputManager = new OutputFormatter();

// Execute the main solution logic and display its result.
consoleOutputManager.displayResult(new SolutionProcessor().processAndDetermineOptimalValue());