'use strict';

// This module processes a single numerical input representing total seconds
// and converts it into a standard H:M:S format for display.
(function(fileSystemModule) {

  // Define essential time conversion constants within a dedicated object.
  const timeConversionFactors = {
    // Number of seconds in a single minute.
    SECONDS_IN_MINUTE: 60,
    // Number of minutes in a single hour.
    MINUTES_IN_HOUR: 60,
    // Derived constant: seconds in an hour.
    get SECONDS_IN_HOUR() {
      return this.SECONDS_IN_MINUTE * this.MINUTES_IN_HOUR;
    }
  };

  /**
   * Orchestrates the parsing of input and the calculation/display of time components.
   * @param {string} rawInputString - The complete string content read from the source.
   */
  function handleTimeInput(rawInputString) {
    // Split the raw input into individual lines.
    // Note: No trimming is performed on the raw string before splitting.
    const inputLines = rawInputString.split('\n');

    // Validate that at least one line of input is available.
    if (!inputLines || inputLines.length === 0 || inputLines[0].length === 0) {
      console.error("Error: Primary input line is missing or empty.");
      return; // Abort processing if no valid input.
    }

    // Extract the first line and attempt to convert it to an integer.
    const primaryInputLine = inputLines[0];
    const initialNumericValue = parseInt(primaryInputLine, 10); // Always specify radix.

    // Perform validation on the parsed numeric value.
    if (isNaN(initialNumericValue)) {
      console.error(`Error: Could not parse a valid number from "${primaryInputLine}".`);
      return;
    }

    // Ensure the input represents a non-negative duration.
    if (initialNumericValue < 0) {
      console.warn(`Warning: Negative duration (${initialNumericValue}) provided. Treating as 0.`);
      // Optionally, we could return here or throw an error. For this clone, we'll proceed with 0.
      calculateAndPrintHMS(0);
      return;
    }

    // Proceed with calculation and display using the validated input.
    calculateAndPrintHMS(initialNumericValue);
  }

  /**
   * Calculates hours, minutes, and seconds from a total number of seconds
   * and outputs them to the console.
   * @param {number} totalSecondsDuration - The total number of seconds to convert.
   */
  function calculateAndPrintHMS(totalSecondsDuration) {

    // Use a temporary variable to hold the remaining seconds as we extract components.
    let remainingSecondsForCalc = totalSecondsDuration;

    // Calculate the number of full hours.
    const calculatedHours = Math.floor(remainingSecondsForCalc / timeConversionFactors.SECONDS_IN_HOUR);
    // Update remaining seconds after extracting hours.
    remainingSecondsForCalc -= (calculatedHours * timeConversionFactors.SECONDS_IN_HOUR);

    // Calculate the number of full minutes from the remaining seconds.
    const calculatedMinutes = Math.floor(remainingSecondsForCalc / timeConversionFactors.SECONDS_IN_MINUTE);
    // Update remaining seconds after extracting minutes.
    remainingSecondsForCalc -= (calculatedMinutes * timeConversionFactors.SECONDS_IN_MINUTE);

    // The last remaining value is the seconds component.
    const finalSecondsComponent = remainingSecondsForCalc;

    // Output the computed time components, separated by spaces.
    console.log(calculatedHours, calculatedMinutes, finalSecondsComponent);
  }

  // --- Main execution block ---
  try {
    // Read the entire content of the standard input file.
    const systemInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    // Delegate to the handler function to process and display.
    handleTimeInput(systemInputContent);
  } catch (executionError) {
    // Catch and report any errors during file reading or initial processing.
    console.error("An operational error occurred:", executionError.message);
  }

}(require('fs'))); // Pass the entire 'fs' module for read access.