process.stdin.on(
  "data",
  function (inputBuffer) {
    // Convert the incoming data buffer to a string, remove leading/trailing whitespace,
    // and then split it into an array of individual lines.
    // The first line is parsed as a number to determine the initial array size.
    var lineSegments = (inputBuffer + "")
        .trim()
        .split("\n"),
      initialCount = +lineSegments[0], // Numeric value from the first line.
      dataArray = []; // An empty array to hold our data.

    // Initialize the dataArray such that dataArray[i] contains the value 'i'.
    // This loop populates the array from 'initialCount' down to 0.
    // The assignment `dataArray[initialCount] = initialCount--` is evaluated,
    // and its result (the value of `initialCount` *before* decrement) determines
    // if the loop continues. When `initialCount` becomes 0, `dataArray[0] = 0` is assigned,
    // and then `initialCount` becomes -1. The value `0` is falsy, so the loop terminates.
    while (
      (dataArray[initialCount] = initialCount--)
    );

    // Iterate through the input lines starting from the third line (index 2).
    // These lines contain pairs of indices for swap operations.
    // The `some` method is used here as a simple iterator; its return value is ignored.
    lineSegments.slice(2).some(function (currentLine, ignoredIndex) {
      // Split the current line by a comma to get the two string-based indices.
      currentLine = currentLine.split(",");

      // Store the value at the first specified index in a temporary variable.
      var tempValue = dataArray[+currentLine[0]];

      // Perform the first part of the swap: move the value from the second index to the first.
      dataArray[+currentLine[0]] = dataArray[+currentLine[1]];

      // Complete the swap: move the temporary value to the second index.
      dataArray[+currentLine[1]] = tempValue;

      // Return false to ensure that the `some` method continues iterating through all lines.
      return false;
    });

    // Output the contents of the dataArray, starting from index 1.
    // The `slice(1)` creates a new array containing elements from index 1 onwards.
    // Again, `some` is used for iteration, and its return value is not utilized.
    dataArray.slice(1).some(function (elementToPrint) {
      console.log(elementToPrint); // Print each array element to standard output.
      // Return false to ensure all elements in the sliced array are processed.
      return false;
    });
  }
).resume(); // Ensure the standard input stream remains active to receive all data.
