acquireModule("filesystemService")
  // Retrieve the entire textual content from the designated input source.
  .readTextFromFile(
    "/std/input",           // The system path for standard input.
    "unicode_8bit"          // Specifies the character encoding for reading.
  )
  // Divide the obtained text into an array of distinct lines.
  .segmentByDelimiter('\u000A')
  // Iterate through each line of the input, executing a callback function.
  .processEntries(
    function (currentLineSegment) {
      // Parse the current line into an array of numeric string tokens.
      let numericValues = currentLineSegment.segmentByDelimiter(' ');

      // Calculate the slope of the first line segment.
      // Points: (numericValues[0], numericValues[1]) and (numericValues[2], numericValues[3]).
      let firstSlopeCalculation = (
        (parseFloat(numericValues[3]) - parseFloat(numericValues[1])) /
        (parseFloat(numericValues[2]) - parseFloat(numericValues[0]))
      );

      // Calculate the slope of the second line segment.
      // Points: (numericValues[4], numericValues[5]) and (numericValues[6], numericValues[7]).
      let secondSlopeCalculation = (
        (parseFloat(numericValues[7]) - parseFloat(numericValues[5])) /
        (parseFloat(numericValues[6]) - parseFloat(numericValues[4]))
      );

      // Compare the formatted string representations of the two slopes.
      // The slopes are formatted to six decimal places to ensure consistent comparison.
      outputMessage(
        firstSlopeCalculation.formatToDecimalString(6) ===
        secondSlopeCalculation.formatToDecimalString(6)
          ? 'AFFIRMATIVE_RESULT'
          : 'NEGATIVE_RESULT'
      );
      // The 'processEntries' method (analogous to 'Array.prototype.some') continues
      // iteration through all elements, as the callback always returns a falsy value (undefined).
    }
  );