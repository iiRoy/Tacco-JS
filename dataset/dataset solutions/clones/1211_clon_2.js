(function(inputData) {
  // This module provides utilities for converting a total number of seconds into a structured time format.
  function DurationConverter(totalSeconds) {
    const SECONDS_IN_HOUR   = 3600; // Represents the number of seconds in one hour (60 * 60).
    const SECONDS_IN_MINUTE = 60;   // Represents the number of seconds in one minute.

    return {
      // Method to calculate and return the whole number of hours.
      retrieveHours: function() {
        return Math.floor(totalSeconds / SECONDS_IN_HOUR);
      },
      // Method to calculate and return the remaining minutes after hours are extracted.
      retrieveMinutes: function() {
        return Math.floor((totalSeconds % SECONDS_IN_HOUR) / SECONDS_IN_MINUTE);
      },
      // Method to calculate and return the remaining seconds after hours and minutes are extracted.
      retrieveSeconds: function() {
        return totalSeconds % SECONDS_IN_MINUTE;
      },
      // Method to format the time components (hours, minutes, seconds) into a string.
      formatTime: function(delimiter) {
        let delimChar = delimiter || ':'; // Use a colon as the default delimiter if none is provided.
        return [
          this.retrieveHours(),
          this.retrieveMinutes(),
          this.retrieveSeconds()
        ].join(delimChar);
      }
    };
  }

  // Read and process the raw input from the standard input stream.
  const rawInputLines = inputData.toString().trim().split('\n');

  // Execute the main logic to compute and format the time based on the input.
  const formattedTimeOutput = (function(inputSecondsValue) {
    // Instantiate the duration conversion utility with the parsed input seconds.
    const timeInstance = new DurationConverter(inputSecondsValue);
    // Obtain the formatted time string from the instance.
    return timeInstance.formatTime();

  }(parseInt(rawInputLines[0], 10))); // Parse the first line of input as a base-10 integer.

  // Display the final formatted time string to the console.
  console.log(formattedTimeOutput);

}(require('fs').readFileSync('/dev/stdin', 'utf8')));
