// This program reads dates from standard input and outputs their corresponding day of the week for the year 2004.
require("fs")
  .readFileSync("/dev/stdin", "utf8") // Obtain file content from the standard input stream, encoded as UTF-8.
  .split('\n') // Divide the input text into a collection of individual line strings.
  .some(
    /*
     * Callback function executed for each line of input.
     * It parses month and day, then calculates and prints the weekday.
     * @param {string} currentInputLine - The textual data of the current line being processed.
     */
    function (currentInputLine) {
      // Split the line by space to extract two numeric values: month and day.
      let lineSegments = currentInputLine.split(' ');
      // Assign the first segment as the month identifier and the second as the day-of-month identifier.
      let monthValue = lineSegments[0], dayValue = lineSegments[1];

      // Proceed only if the month identifier is not zero (indicating a valid date entry).
      if (monthValue != 0)
        // Output the full day name by looking up the day index from a Date object.
        console.log(
          [ // Array of day name prefixes, indexed from Sunday (0) to Saturday (6).
            "Sun", "Mon", "Tues", "Wednes", "Thurs", "Fri", "Satur"
          ][new Date(2004, monthValue - 1, dayValue).getDay()] + 'day' // Append "day" to form the complete day name.
        );
      // The 'some' method continues iterating as long as this function implicitly returns a falsy value (undefined).
    }
  );