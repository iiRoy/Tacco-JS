(function(inputSource) {
  // Helper function to ensure numbers are formatted with at least two digits, prepending a '0' if necessary.
  const ensureTwoDigits = (numericValue) => String(numericValue).padStart(2, '0');

  // Defines a factory-like function for managing and formatting time durations.
  function DurationCalculator(overallSeconds) {
    // A robust check for the input parameter's validity.
    if (typeof overallSeconds !== 'number' || overallSeconds < 0 || !Number.isInteger(overallSeconds)) {
      console.error("Input for DurationCalculator is not a valid non-negative integer. Defaulting to 0 seconds.");
      overallSeconds = 0; // Reset to a safe default to prevent further errors
    }

    // Constants for time unit conversions.
    const SECONDS_IN_AN_HOUR  = 3600; // Equivalent to 60 * 60
    const SECONDS_IN_A_MINUTE = 60;

    // Internal method to compute the hours component from total seconds.
    const obtainHours = () => {
      return Math.floor(overallSeconds / SECONDS_IN_AN_HOUR);
    };

    // Internal method to compute the minutes component after accounting for hours.
    const obtainMinutes = () => {
      const remainingSecondsAfterHours = overallSeconds % SECONDS_IN_AN_HOUR;
      return Math.floor(remainingSecondsAfterHours / SECONDS_IN_A_MINUTE);
    };

    // Internal method to compute the seconds component after accounting for minutes.
    const obtainSeconds = () => {
      return overallSeconds % SECONDS_IN_A_MINUTE;
    };

    // The public interface of the DurationCalculator object.
    return {
      // Exposes the method to get the hour part.
      getHoursComponent: obtainHours,
      // Exposes the method to get the minute part.
      getMinutesComponent: obtainMinutes,
      // Exposes the method to get the second part.
      getSecondsComponent: obtainSeconds,

      // Provides a formatted string representation of the duration.
      formatDisplay: function(customDelimiter) {
        // Establishes the delimiter, using ':' as default if none is provided.
        let activeDelimiter = customDelimiter || ':';

        // Retrieve each time component using the internal methods.
        const hoursPart   = this.getHoursComponent();
        const minutesPart = this.getMinutesComponent();
        const secondsPart = this.getSecondsComponent();

        // Apply the zero-padding utility to each component for consistent formatting.
        const formattedHours   = ensureTwoDigits(hoursPart);
        const formattedMinutes = ensureTwoDigits(minutesPart);
        const formattedSeconds = ensureTwoDigits(secondsPart);

        // Construct the final output string using a template literal.
        return `${formattedHours}${activeDelimiter}${formattedMinutes}${activeDelimiter}${formattedSeconds}`;
      }
    };
  }

  // --- Main execution flow for processing input and generating output ---

  // Reads the raw input data stream, converts it to a string, removes leading/trailing whitespace,
  // and splits it into an array of lines.
  const rawInputLines = inputSource.toString().trim().split('\n');

  let parsedNumericValue; // Variable to hold the integer representation of the input.

  // Safely attempts to parse the first line of input.
  try {
    const firstLineOfInput = rawInputLines[0];
    parsedNumericValue = parseInt(firstLineOfInput, 10); // Base 10 parsing.

    // Additional check: if parsing results in NaN or a negative number,
    // issue a warning and reset to a default value.
    if (isNaN(parsedNumericValue) || parsedNumericValue < 0) {
      console.warn("The input provided is not a valid non-negative integer. Proceeding with 0 seconds.");
      parsedNumericValue = 0;
    }
  } catch (parsingError) {
    // Catches any unexpected errors during the parsing process.
    console.error(`An error occurred while processing the input: ${parsingError.message}. Defaulting to 0 seconds.`);
    parsedNumericValue = 0;
  }

  // Creates an instance of our DurationCalculator with the validated input value.
  const myDurationProcessor = DurationCalculator(parsedNumericValue);

  // Calls the formatting method on the created instance to get the final display string.
  const generatedTimeString = myDurationProcessor.formatDisplay();

  // Prints the final formatted time string to the standard output.
  console.log(generatedTimeString);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));