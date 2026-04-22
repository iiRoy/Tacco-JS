"use strict";

// This self-invoking function encapsulates our main application logic.
// It helps to prevent global variable pollution and defines a clear scope.
(function () {

  /**
   * Transforms a string of space-separated numbers or an array of strings/numbers
   * into an array of integers. Includes basic input validation and error handling.
   * @param {string|Array<string|number>} inputSequence - The string or array to parse.
   * @returns {Array<number>} An array of parsed integers. Returns an empty array on invalid input.
   */
  function parseNumericSequence(inputSequence) {
    if (inputSequence === null || typeof inputSequence === 'undefined') {
      console.warn("Input for numeric sequence parsing was null or undefined. Returning empty array.");
      return [];
    }

    let rawElements;
    if (Array.isArray(inputSequence)) {
      rawElements = inputSequence;
    } else if (typeof inputSequence === 'string') {
      // Split by one or more whitespace characters, removing leading/trailing spaces
      rawElements = inputSequence.trim().split(/\s+/);
      if (rawElements.length === 1 && rawElements[0] === '') {
        // Handle cases where an empty string results in ['']
        return [];
      }
    } else {
      console.error("Invalid input type provided for parseNumericSequence. Expected string or array, got:", typeof inputSequence);
      return [];
    }

    // Convert each element to a number, filtering out any non-numeric results.
    const processedNumbers = rawElements.map(element => {
      const numericValue = Number(element); // Using Number() for conversion, handles various string forms
      if (isNaN(numericValue)) {
        console.warn(`Encountered non-numeric element '${element}' during parsing. This element will be skipped.`);
        return null;
      }
      return numericValue;
    }).filter(val => val !== null); // Retain only valid numbers

    return processedNumbers;
  }

  /**
   * A generator function that yields numbers in a specified half-open range [start, end).
   * Includes validation for sensible range boundaries.
   * @param {number} startingValue - The inclusive start of the numeric range.
   * @param {number} endingValue - The exclusive end of the numeric range.
   * @yields {number} Each number in the sequence.
   */
  function* generateNumericSeries(startingValue, endingValue) {
    // Basic validation for numeric inputs
    if (typeof startingValue !== 'number' || typeof endingValue !== 'number' || isNaN(startingValue) || isNaN(endingValue)) {
      console.error("generateNumericSeries received non-numeric arguments. Skipping generation.");
      return;
    }
    if (startingValue > endingValue) {
      console.warn(`generateNumericSeries: Starting value (${startingValue}) is greater than ending value (${endingValue}). No numbers will be generated.`);
      return;
    }

    let currentIteration = startingValue;
    while (currentIteration < endingValue) {
      yield currentIteration;
      currentIteration++;
    }
  }

  /**
   * Sorts an array of objects based on one or more specified attributes and their sort directions.
   * Supports both simple attribute names and [attributeName, direction] pairs.
   * @param {Array<Object>} collectionToSort - The array of objects to be sorted.
   * @param {Array<string|Array<string|number>>} sortingInstructions - An array defining the sorting order.
   *   Each element can be a string (attribute name, defaults to ascending) or an array
   *   [attributeName, direction], where direction can be "asc", "desc", 1 (asc), or -1 (desc).
   * @returns {Array<Object>} The sorted array. Returns original array if invalid inputs.
   */
  function orderCollectionByAttributes(collectionToSort, sortingInstructions) {
    if (!Array.isArray(collectionToSort) || collectionToSort.length === 0) {
      return collectionToSort; // Nothing to sort or invalid input
    }
    if (!Array.isArray(sortingInstructions) || sortingInstructions.length === 0) {
      // No sorting criteria provided, return as-is.
      return collectionToSort;
    }

    // The Array.prototype.sort method sorts in place.
    return collectionToSort.sort((itemA, itemB) => {
      for (const criterion of sortingInstructions) {
        let attributeKey;
        let sortDirectionMultiplier = 1; // Default to ascending order

        if (typeof criterion === 'string') {
          attributeKey = criterion;
        } else if (Array.isArray(criterion) && criterion.length >= 1) {
          attributeKey = criterion[0];
          const specifiedDirection = criterion[1];
          if (specifiedDirection === "desc" || specifiedDirection === -1) {
            sortDirectionMultiplier = -1;
          } else if (specifiedDirection === "asc" || specifiedDirection === 1) {
            sortDirectionMultiplier = 1;
          }
          // Any other value for direction will default to 1 (ascending)
        } else {
          // Skip any malformed sorting criteria
          console.warn("Invalid sorting criterion encountered:", criterion, ". Skipping this criterion.");
          continue;
        }

        const valueA = itemA[attributeKey];
        const valueB = itemB[attributeKey];

        // Perform a numeric comparison; handles undefined/null values by treating them as 0 in subtraction
        const comparisonResult = (valueA - valueB) * sortDirectionMultiplier;

        if (comparisonResult !== 0) {
          return comparisonResult; // A difference was found, so we can return immediately
        }
      }
      return 0; // All sorting criteria resulted in equality
    });
  }


  // Main application execution block, wrapped in another IIFE for isolation.
  (function processInputAndSolve(rawDataContent) {
    // Input validation: ensure rawDataContent is a non-empty string.
    if (typeof rawDataContent !== 'string' || rawDataContent.trim().length === 0) {
      console.error("The provided input data is either invalid or empty. Processing halted.");
      return;
    }

    const inputLines = rawDataContent.trim().split("\n");

    // A guard clause to ensure sufficient input lines are present.
    if (inputLines.length < 2) {
      console.error("Error: Insufficient input lines. Expected at least two lines for problem parameters.");
      return;
    }

    // Parse the first line to get the total capacity (N) and count of available digits (M).
    const firstLineNumericValues = parseNumericSequence(inputLines[0]);
    if (firstLineNumericValues.length < 2) {
      console.error("Error: First input line does not contain enough numeric values (N, M).");
      return;
    }
    const totalCapacity = firstLineNumericValues[0];
    const numberOfAvailableDigits = firstLineNumericValues[1]; // M is extracted but not directly used beyond slicing.

    // Parse the second line for the list of allowed digits.
    const allowedDigits = parseNumericSequence(inputLines[1]);
    // Slice to ensure we only consider 'M' digits, as per original problem context.
    const effectiveAllowedDigits = allowedDigits.slice(0, numberOfAvailableDigits);

    // Define the fixed energy costs for each digit (index 0-9 corresponds to digit value).
    const digitEnergyCosts = Object.freeze([
      0, // Digit 0: cost 0 (typically not used or relevant for this type of problem)
      2, // Digit 1: cost 2
      5, // Digit 2: cost 5
      5, // Digit 3: cost 5
      4, // Digit 4: cost 4
      5, // Digit 5: cost 5
      6, // Digit 6: cost 6
      3, // Digit 7: cost 3
      7, // Digit 8: cost 7
      6  // Digit 9: cost 6
    ]);

    // Create a structured array of objects, each representing an available digit with its cost.
    const availableDigitSpecs = effectiveAllowedDigits.map(digitVal => {
      // Validate digit value and ensure it has a defined cost.
      if (digitVal < 0 || digitVal > 9 || digitEnergyCosts[digitVal] === undefined) {
        console.warn(`Encountered an invalid digit value (${digitVal}) in allowed list. Skipping.`);
        return null;
      }
      return {
        digitValue: digitVal,
        energyRequired: digitEnergyCosts[digitVal]
      };
    }).filter(spec => spec !== null); // Filter out any invalid digit specifications.

    // Sort the available digits in descending order. This ensures that when multiple digits
    // can form a number of the same length, the largest digit is chosen, leading to the numerically largest result.
    orderCollectionByAttributes(availableDigitSpecs, [["digitValue", "desc"]]);

    // Initialize the dynamic programming table.
    // Each entry `dpTable[i]` will store an array: `[maxLength, digitChosen]`
    // `maxLength` is the maximum number of digits that can be formed using exactly `i` energy.
    // `digitChosen` is the digit used to reach this state `i` from a previous state.
    // Initialize with -Infinity for length to denote an unreachable state, and null for the digit.
    const dpTable = Array.from({ length: totalCapacity + 1 }, () => [-Infinity, null]);

    // Base case: To form a number of length 0, 0 energy is required.
    dpTable[0] = [0, null];

    // Iterate through all possible energy capacities from 1 up to the totalCapacity.
    for (const currentEnergyCapacity of generateNumericSeries(1, totalCapacity + 1)) {
      let currentMaxDigitsCount = -Infinity;
      let bestDigitToUse = null;

      // For each capacity, evaluate all available digits to find the optimal choice.
      for (const { digitValue, energyRequired } of availableDigitSpecs) {
        // If the current capacity is sufficient to cover the current digit's energy cost.
        if (currentEnergyCapacity >= energyRequired) {
          const previousEnergyCapacity = currentEnergyCapacity - energyRequired;
          const [prevLength, _] = dpTable[previousEnergyCapacity]; // Only need the length from the previous state.

          // If the previous state was reachable (i.e., not -Infinity).
          if (prevLength > -Infinity) {
            const candidateLength = 1 + prevLength; // Add 1 for the current digit being considered.

            // Update the maximum length if this path yields a longer number.
            if (candidateLength > currentMaxDigitsCount) {
              currentMaxDigitsCount = candidateLength;
              bestDigitToUse = digitValue;
            }
            // If candidateLength == currentMaxDigitsCount, the pre-sorting of availableDigitSpecs
            // ensures that the largest digit is implicitly preferred if it was processed first.
          }
        }
      }
      // Store the best result found for the current energy capacity.
      dpTable[currentEnergyCapacity] = [currentMaxDigitsCount, bestDigitToUse];
    }

    // Reconstruct the longest numerical string by backtracking through the DP table.
    let resultingNumberString = "";
    let remainingEnergy = totalCapacity;

    // Loop until all energy is accounted for or no more digits can be added.
    while (remainingEnergy > 0) {
      const [lengthAtCurrentCapacity, chosenDigit] = dpTable[remainingEnergy];

      // If no valid digit was chosen for this remaining energy, or it's an unreachable state,
      // it means we can't form a longer number or have an invalid path.
      if (chosenDigit === null || lengthAtCurrentCapacity <= 0) {
        // This break ensures we don't fall into an infinite loop or an error state.
        break;
      }

      resultingNumberString += String(chosenDigit); // Append the chosen digit.
      remainingEnergy -= digitEnergyCosts[chosenDigit]; // Deduct the cost of the chosen digit.
    }

    // Output the final result.
    if (resultingNumberString.length === 0) {
      console.log("No valid number could be formed under the given constraints.");
    } else {
      console.log(resultingNumberString);
    }

  }(require("fs").readFileSync("/dev/stdin", "utf8")));

})();