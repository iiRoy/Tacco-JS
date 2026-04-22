(function() {
  "use strict";

  // --- Input Stream Management ---
  // Fetches the raw program input from standard input.
  let programInput = require("fs").readFileSync("/dev/stdin", "utf8");

  // Divides the entire input string into an array of tokens (numbers/strings).
  let inputTokens = programInput.split(/ |\n/);
  // Pointer to the current token being processed in the inputTokens array.
  let currentPosition = 0;

  /**
   * Extracts the next token from the input stream and converts it to an integer.
   * Advances the internal token pointer.
   * @returns {number} The parsed integer value.
   * @throws {Error} If attempting to read beyond the available input tokens.
   */
  function consumeNextInteger() {
    if (currentPosition >= inputTokens.length) {
      throw new Error("Input stream exhausted: No more tokens available to read.");
    }
    // The unary plus operator (+) is used for concise string-to-number conversion.
    return +inputTokens[currentPosition++];
  }

  /**
   * Reads a sequence of 'count' tokens from the input stream.
   * Each token is then converted to a number.
   * @param {number} count - The number of tokens to read.
   * @returns {Array<number>} An array containing the parsed numerical tokens.
   */
  function consumeIntegerSequence(count) {
    const startIdx = currentPosition;
    currentPosition += count; // Advance the pointer by 'count'
    // Extract the relevant slice and map each token to a number.
    return inputTokens.slice(startIdx, currentPosition).map(token => +token);
  }

  /**
   * Reads a 2D matrix of numerical tokens from the input stream.
   * @param {number} numRows - The number of rows in the matrix.
   * @param {number} numCols - The number of columns per row.
   * @returns {Array<Array<number>>} A 2D array representing the matrix.
   */
  function consumeIntegerMatrix(numRows, numCols) {
    let resultMatrix = [];
    for (let r = 0; r < numRows; r++) {
      const rowStartIdx = currentPosition;
      currentPosition += numCols; // Advance pointer for the current row's tokens.
      // Extract the row slice and convert tokens to numbers.
      resultMatrix.push(inputTokens.slice(rowStartIdx, currentPosition).map(token => +token));
    }
    return resultMatrix;
  }

  // The original 'xArray' utility function has been removed.
  // Its single use case (initializing a 1D array with zeros) is
  // now handled directly using `Array(size).fill(0)`, which is clearer
  // and avoids the use of `eval()`. This is a Type III modification (deletion and simplification).

  // --- Core Simulation Logic ---

  // Global variable to maintain the running total of satisfaction points.
  let cumulativeSatisfactionPoints = 0; // Renamed from 'score'

  // Initiates the main simulation process.
  let programOutput = executeDailySatisfactionSimulation(); // Renamed from 'main'
  if (programOutput !== undefined) {
    // If the simulation function returns an explicit value, print it.
    // (In this specific problem, it prints within the loop and doesn't return).
    console.log(String(programOutput));
  }

  /**
   * Executes the daily simulation to calculate and track satisfaction points.
   * This function orchestrates reading daily parameters, updating category satisfaction,
   * and accumulating total points.
   */
  function executeDailySatisfactionSimulation() { // Renamed from 'main'
    // Read the total number of days for which the simulation will run.
    const totalDaysInSimulation = consumeNextInteger(); // Renamed from 'd'

    // Define the fixed number of distinct contest categories.
    const numberOfCategories = 26; // Renamed from 'n'

    // Read the array detailing how much satisfaction decays for each category daily.
    const categoryDecayRates = consumeIntegerSequence(numberOfCategories); // Renamed from 'c'

    // Read the 2D matrix which stores immediate satisfaction rewards for
    // each category on each specific day.
    const dailyRewardValues = consumeIntegerMatrix(totalDaysInSimulation, numberOfCategories); // Renamed from 's'

    // Initialize an array to keep track of the current satisfaction level for every category.
    // Directly creating and filling the array, replacing the 'xArray' usage.
    let currentCategoryLevels = Array(numberOfCategories).fill(0); // Renamed from 'a'

    // Iterate through each day of the simulation, from day 0 up to `totalDaysInSimulation - 1`.
    for (let dayIndex = 0; dayIndex < totalDaysInSimulation; dayIndex++) { // Renamed from 'i'
      // Read the chosen contest category for the current day (1-indexed).
      const selectedCategoryOneBased = consumeNextInteger(); // Renamed from 't'

      // Type III addition: Input validation for the chosen category.
      // Although the original problem might imply valid input, adding a check
      // makes the code more robust. Here, we'll just log a warning.
      if (selectedCategoryOneBased < 1 || selectedCategoryOneBased > numberOfCategories) {
        console.error(`Validation Warning: Day ${dayIndex + 1} - Chosen category ` +
                      `'${selectedCategoryOneBased}' is out of expected range (1-${numberOfCategories}).`);
        // For the purpose of clone, we proceed, assuming the problem context.
      }

      // Convert the 1-based category index to a 0-based array index.
      const selectedCategoryZeroBased = selectedCategoryOneBased - 1;

      // Apply the daily decay to the satisfaction level of ALL categories.
      // This loop is rewritten for stylistic variation.
      for (let catIdx = 0; catIdx < numberOfCategories; catIdx++) { // Renamed from 'j'
        currentCategoryLevels[catIdx] -= categoryDecayRates[catIdx];
      }

      // Reset the satisfaction level for the category that hosted a contest today.
      currentCategoryLevels[selectedCategoryZeroBased] = 0;

      // Retrieve the immediate satisfaction gain from today's chosen contest.
      const immediateGainToday = dailyRewardValues[dayIndex][selectedCategoryZeroBased];
      // Add this immediate gain to the cumulative total.
      cumulativeSatisfactionPoints += immediateGainToday;

      // Calculate the sum of current satisfaction levels across all categories.
      // This sum also contributes to the total points for the day.
      let aggregatedDailyBonus = 0; // Type III addition: new intermediate variable.
      for (let catIdx = 0; catIdx < numberOfCategories; catIdx++) { // Renamed from 'j'
        aggregatedDailyBonus += currentCategoryLevels[catIdx];
      }
      // Add the aggregated satisfaction bonus to the cumulative total.
      cumulativeSatisfactionPoints += aggregatedDailyBonus;

      // Output the current cumulative satisfaction after all calculations for the day.
      console.log(cumulativeSatisfactionPoints);
    }
    // The original function did not return a value, so this clone maintains that behavior.
    // Therefore, `programOutput` will typically be `undefined`.
  }

})(); // End of IIFE (Immediately Invoked Function Expression) for encapsulation.