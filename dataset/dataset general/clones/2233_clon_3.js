(function (dataGridModule, $utility) {
  // This self-executing anonymous function serves as a module wrapper,
  // preventing global scope pollution and ensuring dependencies are clearly passed.

  /**
   * Utility function to verify if a given value is truly present and not merely absent.
   * A value is considered "present" if it is neither 'undefined' nor 'null'.
   *
   * @param {*} candidateValue The item to inspect for presence.
   * @returns {boolean} True if the value exists and is not null; otherwise, false.
   */
  const valueIsPresent = function (candidateValue) {
    // Using the '!=' (loose inequality) operator with null checks for both undefined and null.
    // This is a common and concise idiom in JavaScript for this specific check.
    return candidateValue != null;
  };

  /**
   * A collection of specialized comparison routines, designed to facilitate sorting
   * operations across various data types within the data grid component.
   * Each routine returns a negative, zero, or positive value indicating the sort order.
   */
  const comparisonHandlers = {

    /**
     * Compares two values as strings, accounting for locale-specific ordering.
     * It gracefully handles cases where one or both values might be null or undefined.
     *
     * @param {*} firstTextValue - The first value for comparison.
     * @param {*} secondTextValue - The second value for comparison.
     * @returns {number} A standard comparison result (-1, 0, or 1).
     */
    textual: function (firstTextValue, secondTextValue) {
      const isFirstDefined = valueIsPresent(firstTextValue);
      const isSecondDefined = valueIsPresent(secondTextValue);

      // Scenario 1: Both values are absent (null or undefined).
      // They are considered equal in terms of sort order.
      if (!isFirstDefined && !isSecondDefined) {
        return 0;
      }

      // Scenario 2: Only the first value is absent.
      // The second (present) value should come before the absent first value.
      if (!isFirstDefined) {
        return -1;
      }

      // Scenario 3: Only the second value is absent.
      // The first (present) value should come before the absent second value.
      if (!isSecondDefined) {
        return 1;
      }

      // Scenario 4: Both values are present.
      // Coerce them to strings and perform a locale-sensitive comparison.
      const stringifiedA = String(firstTextValue);
      const stringifiedB = String(secondTextValue);

      return stringifiedA.localeCompare(stringifiedB);
    },

    /**
     * Compares two values as numbers. Handles non-numeric inputs by attempting conversion
     * and includes specific logic for NaN (Not-a-Number) results.
     *
     * @param {*} numValA - The first value to compare numerically.
     * @param {*} numValB - The second value to compare numerically.
     * @returns {number} A standard comparison result.
     */
    numeric: (numValA, numValB) => {
      // Explicitly convert inputs to numbers. This can result in NaN if conversion fails.
      const parsedNumA = Number(numValA);
      const parsedNumB = Number(numValB);

      // Handle cases where one or both values are NaN.
      // NaN values are typically sorted to the end, or treated as equal if both are NaN.
      if (Number.isNaN(parsedNumA) || Number.isNaN(parsedNumB)) {
        if (Number.isNaN(parsedNumA) && Number.isNaN(parsedNumB)) {
          return 0; // Both are NaN, consider them equal.
        }
        if (Number.isNaN(parsedNumA)) {
          return 1; // If A is NaN, it's 'greater' than a valid number B.
        }
        return -1; // If B is NaN, it's 'greater' than a valid number A.
      }

      // For valid numbers, the difference directly indicates sort order.
      return parsedNumA - parsedNumB;
    },

    /**
     * Compares two date-like values. Attempts to convert them into Date objects
     * and then compares their millisecond timestamps.
     *
     * @param {*} dateItemA - The first date value (can be Date object, string, or number).
     * @param {*} dateItemB - The second date value.
     * @returns {number} A standard comparison result.
     */
    temporal: (dateItemA, dateItemB) => {
      // Convert inputs into Date objects and then get their millisecond representation.
      // This allows flexible input types (e.g., ISO strings, timestamps).
      const timeMsA = (dateItemA instanceof Date) ? dateItemA.getTime() : new Date(dateItemA).getTime();
      const timeMsB = (dateItemB instanceof Date) ? dateItemB.getTime() : new Date(dateItemB).getTime();

      // Similar NaN handling as with numeric comparisons, as invalid dates yield NaN.
      if (Number.isNaN(timeMsA) || Number.isNaN(timeMsB)) {
        if (Number.isNaN(timeMsA) && Number.isNaN(timeMsB)) {
          return 0;
        }
        if (Number.isNaN(timeMsA)) {
          return 1;
        }
        return -1;
      }

      return timeMsA - timeMsB;
    },

    /**
     * Compares two string values that are expected to represent numbers.
     * It parses them into numbers before performing the comparison.
     *
     * @param {string} strNumA - The first numeric string.
     * @param {string} strNumB - The second numeric string.
     * @returns {number} A standard comparison result.
     */
    parsedNumericString: function (strNumA, strNumB) {
      // Use Number() for parsing, which is generally stricter than parseFloat().
      // e.g., Number("10px") yields NaN, while parseFloat("10px") yields 10.
      const valFromStrA = Number(strNumA);
      const valFromStrB = Number(strNumB);

      // Leverage the NaN handling logic from the general numeric comparator.
      if (Number.isNaN(valFromStrA) || Number.isNaN(valFromStrB)) {
        if (Number.isNaN(valFromStrA) && Number.isNaN(valFromStrB)) {
          return 0;
        }
        if (Number.isNaN(valFromStrA)) {
          return 1;
        }
        return -1;
      }

      return valFromStrA - valFromStrB;
    },

    /**
     * Compares two boolean values or values that can be coerced into booleans.
     * The sorting order is typically 'false' before 'true'.
     *
     * @param {*} boolInputA - The first value, coerced to boolean.
     * @param {*} boolInputB - The second value, coerced to boolean.
     * @returns {number} A standard comparison result.
     */
    boolean: (boolInputA, boolInputB) => {
      const boolValA = Boolean(boolInputA);
      const boolValB = Boolean(boolInputB);

      if (boolValA === boolValB) {
        return 0; // If both are true or both are false, they are equal.
      }

      // If they are not equal, one must be true and the other false.
      // True is considered "greater" than false.
      return boolValA ? 1 : -1; // If A is true, it comes after B (which must be false).
    }
  };

  // Attach the comprehensive set of comparison handlers to the main data grid module.
  // This makes these sorting algorithms available for use throughout the data grid's functionality.
  dataGridModule.orderingRoutines = comparisonHandlers;

}(jsGrid, jQuery)); // Pass the global jsGrid and jQuery objects into the module.