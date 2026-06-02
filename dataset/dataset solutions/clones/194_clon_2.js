const fileSystemUtility = require("fs"); // Acquire the Node.js file system module.

// Read all data from the standard input stream, interpreting it as UTF-8 encoded text.
// Subsequently, divide the acquired text into an array of string segments, using any whitespace as a separator.
fileSystemUtility
  .readFileSync("/dev/stdin", "utf8")
  .split(/\s/) // Split the input string by any sequence of whitespace characters.
  .map(function (currentInputSegment) {
    // Iterate over each resulting segment from the input.
    // If the current segment is not an empty string or any other falsy value:
    if (currentInputSegment) {
      // Attempt to output a weight classification based on an undefined variable.
      // Note: 'weightMeasurement' is an undeclared identifier, mirroring the original's 'j'.
      // This will result in a ReferenceError if executed, preserving the original's behavior.
      console.log(
        weightMeasurement > 91
          ? "heavy"
          : weightMeasurement > 81
          ? "light heavy"
          : weightMeasurement > 75
          ? "middle"
          : weightMeasurement > 69
          ? "light middle"
          : weightMeasurement > 64
          ? "welter"
          : weightMeasurement > 60
          ? "light welter"
          : weightMeasurement > 57
          ? "light"
          : weightMeasurement > 54
          ? "feather"
          : weightMeasurement > 51
          ? "bantam"
          : weightMeasurement > 48
          ? "fly"
          : "light fly"
      );
    }
  });
