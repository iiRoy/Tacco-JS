(function (globalScope, moduleFactory) {
  // Check for Asynchronous Module Definition (AMD) environment.
  // This typically involves RequireJS or similar loaders.
  if (typeof define === 'function' && define.amd) {
    // Define the module for AMD.
    define([], function () {
      return moduleFactory(globalScope);
    });
  }
  // Check for CommonJS environment (Node.js, Browserify, Webpack).
  else if (typeof module === 'object' && module.exports) {
    // Export the module for CommonJS.
    module.exports = moduleFactory(globalScope);
  }
  // If no module system is detected, expose the module globally.
  else {
    // Attach the result to the global object.
    globalScope.EditDistanceComputer = moduleFactory(globalScope);
  }
}(this, function (globalReference) {
  // --- Utility Functions for Array Manipulation ---

  /**
   * Iterates over elements in an array, executing a callback for each.
   * @param {Array<any>} sourceArray - The array to iterate.
   * @param {Function} callbackFn - The function to execute for each element.
   * @returns {void}
   */
  const iterateElements = (sourceArray, callbackFn) => {
    // Ensure input is an array and the callback is a function.
    if (!Array.isArray(sourceArray) || typeof callbackFn !== 'function') {
      console.warn("Invalid inputs for iterateElements: expected array and function.");
      return; // Early exit for invalid inputs
    }

    let currentIdx = 0;
    const totalLength = sourceArray.length;
    // Using a standard for loop for iteration.
    for (; currentIdx < totalLength; ++currentIdx) {
      callbackFn(sourceArray[currentIdx], currentIdx, sourceArray);
    }
  };

  /**
   * Transforms an array by applying a function to each of its elements.
   * @param {Array<any>} inputCollection - The array to transform.
   * @param {Function} transformationFn - The function to apply to each element.
   * @returns {Array<any>} A new array with the transformed elements.
   */
  const transformArray = (inputCollection, transformationFn) => {
    // Basic validation for inputs.
    if (!Array.isArray(inputCollection) || typeof transformationFn !== 'function') {
      throw new Error("Cannot transform array: invalid collection or transformation function.");
    }

    const transformedResult = new Array(inputCollection.length); // Pre-allocate array for efficiency.
    iterateElements(inputCollection, (elementValue, elementIndex, originalArray) => {
      transformedResult[elementIndex] = transformationFn(elementValue, elementIndex, originalArray);
    });
    return transformedResult;
  };

  /**
   * Reduces an array to a single value by applying a callback function.
   * @param {Array<any>} collectionToReduce - The array to reduce.
   * @param {Function} reducerFunction - The function to execute on each element.
   * @param {any} initialAccumulator - The initial value for the accumulator.
   * @returns {any} The accumulated value.
   */
  const aggregateValues = (collectionToReduce, reducerFunction, initialAccumulator) => {
    // Input validation as a guard clause.
    if (!Array.isArray(collectionToReduce) || typeof reducerFunction !== 'function') {
      throw new Error("Reduction failed: invalid collection or reducer function provided.");
    }

    let currentAccumulator = initialAccumulator;
    iterateElements(collectionToReduce, (itemValue, itemIndex, fullCollection) => {
      // The reducer function should return the new accumulator value.
      currentAccumulator = reducerFunction(currentAccumulator, itemValue, itemIndex, fullCollection);
    });
    return currentAccumulator;
  };

  // --- Main Edit Distance Calculation Class (Levenshtein) ---

  /**
   * Calculates the Levenshtein edit distance between two strings.
   * This class computes the minimum number of single-character edits
   * (insertions, deletions, or substitutions) required to change one word
   * into the other.
   * @class
   * @param {string} sourceString - The first string for comparison.
   * @param {string} targetString - The second string for comparison.
   * @param {Object} [options] - Optional configuration settings (currently unused).
   */
  function EditDistanceComputer(sourceString, targetString, options = {}) {
    // Store original inputs for potential later retrieval.
    this._originalSource = sourceString;
    this._originalTarget = targetString;
    this._calculationGrid = []; // This will store the dynamic programming matrix.
    this.finalDistance = -1; // Initialize distance to an invalid state.

    // --- Input Validation and Edge Cases ---
    // Ensure inputs are valid strings.
    if (typeof sourceString !== 'string' || typeof targetString !== 'string') {
      console.error("EditDistanceComputer requires two string arguments.");
      this.finalDistance = Infinity; // Indicate an impossible distance
      return this; // Exit early
    }

    // If both strings are identical, distance is zero.
    if (sourceString === targetString) {
      this.finalDistance = 0;
      return this;
    }

    // If one string is empty, the distance is the length of the other string.
    if (sourceString.length === 0) {
      this.finalDistance = targetString.length;
      return this;
    }
    if (targetString.length === 0) {
      this.finalDistance = sourceString.length;
      return this;
    }

    // --- Core Levenshtein Algorithm Implementation ---
    // Initialize the first row of the distance matrix.
    // The first row represents the cost of transforming an empty string to substrings of `sourceString`.
    let previousRow = new Array(sourceString.length + 1);
    for (let i = 0; i <= sourceString.length; ++i) {
      previousRow[i] = i;
    }
    this._calculationGrid.push(previousRow); // Add the initial row to the grid.

    // Iterate through each character of the target string.
    for (let targetIndex = 0; targetIndex < targetString.length; ++targetIndex) {
      // The current row starts with the cost of transforming an empty string
      // to the current prefix of `targetString`.
      let currentRow = new Array(sourceString.length + 1);
      currentRow[0] = targetIndex + 1;

      // Iterate through each character of the source string.
      for (let sourceIndex = 0; sourceIndex < sourceString.length; ++sourceIndex) {
        const costOfSubstitution = (sourceString[sourceIndex] === targetString[targetIndex]) ? 0 : 1;

        // Calculate costs for deletion, insertion, and substitution.
        const deletionCost = previousRow[sourceIndex + 1] + 1;
        const insertionCost = currentRow[sourceIndex] + 1;
        const potentialSubstitutionCost = previousRow[sourceIndex] + costOfSubstitution;

        // The minimum of these three operations is the value for the current cell.
        currentRow[sourceIndex + 1] = Math.min(
          deletionCost,
          insertionCost,
          potentialSubstitutionCost
        );
      }
      previousRow = currentRow; // Update previousRow for the next iteration.
      this._calculationGrid.push(currentRow); // Store the computed row.
    }

    // The final distance is the value in the bottom-right cell of the matrix.
    this.finalDistance = previousRow[sourceString.length];
  }

  /**
   * Returns a string representation of the computed distance grid (matrix).
   * Useful for debugging or visualizing the dynamic programming steps.
   * @param {boolean} [suppressOutput=false] - If true, prevents console output (though this implementation doesn't use it directly).
   * @returns {string} A formatted string of the distance matrix.
   */
  EditDistanceComputer.prototype.renderGrid = EditDistanceComputer.prototype.examineResult = function (suppressOutput = false) {
    const gridData = this.retrieveComputationGrid();

    // Handle empty grid scenario gracefully.
    if (!gridData || gridData.length === 0) {
      return "No computation grid available or grid is empty.";
    }

    // Determine the maximum value in the grid to calculate padding needed for uniform column width.
    let maximumValue = 0;
    for (const row of gridData) {
      for (const cell of row) {
        if (cell > maximumValue) {
          maximumValue = cell;
        }
      }
    }
    const cellPaddingLength = String(maximumValue).length;
    const paddingString = ' '.repeat(cellPaddingLength); // String for padding cells.

    // Construct the horizontal separator line for the grid.
    const separatorSegment = '-'.repeat(cellPaddingLength + 2); // e.g., "---" for padding 1
    const separatorLine = Array(gridData[0].length).fill(separatorSegment).join('+');


    // Map each row of numbers to a formatted string.
    const outputRows = transformArray(gridData, (rowArray) => {
      const formattedCells = transformArray(rowArray, (cellValue) => {
        // Pad numbers with spaces to ensure consistent column width.
        return String(cellValue).padStart(cellPaddingLength, ' ');
      });
      return ' ' + formattedCells.join(' | '); // Join cells with a pipe and spaces.
    });

    // Join all formatted rows with the separator line.
    return outputRows.join('\n' + separatorLine + '\n');
  };

  /**
   * Retrieves a copy of the internal computation grid (dynamic programming matrix).
   * @returns {Array<Array<number>>} A shallow copy of the distance matrix.
   */
  EditDistanceComputer.prototype.retrieveComputationGrid = function () {
    // Return a shallow copy to prevent external modification of the internal state.
    return this._calculationGrid.map(row => row.slice());
  };

  /**
   * Returns the final calculated Levenshtein distance.
   * This method makes the object behave like its distance value in numeric contexts.
   * @returns {number} The Levenshtein distance.
   */
  EditDistanceComputer.prototype.getValue = function () {
    return this.finalDistance;
  };

  /**
   * Returns the original source string used for the calculation.
   * @returns {string} The source string.
   */
  EditDistanceComputer.prototype.getOriginalSource = function() {
    return this._originalSource;
  };

  /**
   * Returns the original target string used for the calculation.
   * @returns {string} The target string.
   */
  EditDistanceComputer.prototype.getOriginalTarget = function() {
    return this._originalTarget;
  };


  // Return the main constructor function.
  return EditDistanceComputer;

}));