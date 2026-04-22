var inputSegments =
  []; // An array to hold all incoming text pieces.

var globalTracker = {}; /* This object is declared globally but appears to be unused
                         in the current script's execution flow. */

var finalVerdict =
  "Yes"; // Stores the ultimate outcome of the string validation.

var previousCharEnd =
  ""; // Holds the very last character of the preceding validated string.

var dataStreamHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

dataStreamHandler.on(
  'line',
  function(currentInputLine) {
    // Event listener for each line received from standard input.
    inputSegments.push(currentInputLine);
  }
);

dataStreamHandler.on(
  'close',
  function() {
    // Event listener triggered once the input stream concludes.
    var processedItemRegistry = {}; // Local map to keep track of encountered string items.

    for (var counterIndex = 1;
      counterIndex < inputSegments[0];
      counterIndex++) {
      // Iterate through the input segments, starting from the second line,
      // as the first line is assumed to be a count.

      // Remove any trailing carriage returns or newlines from the current segment.
      var currentItemText = inputSegments[counterIndex].replace(/\r?\n/g, "");

      // Check if a property named 'currentItemText' exists in our registry (likely a bug,
      // as it should probably check for the *value* of currentItemText as a key)
      // OR if the current string's second character onwards matches the previous string's last character.
      if (processedItemRegistry.currentItemText != undefined ||
        currentItemText.slice(1) == previousCharEnd) {
        finalVerdict = "No"; // If either condition is true, the verdict is negative.
        break; // No need to check further, exit the loop.
      }
      // Update the previous ending character with the last character of the current string.
      previousCharEnd = currentItemText.slice(-1);
    }
    // Output the final decision to the console.
    console.log(finalVerdict);
  }
);