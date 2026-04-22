// This subroutine processes an array of textual entries, computing the sum of individual
// numeric characters found within each entry until a specific termination marker is encountered.
function calculateSumsFromStrings (
  textualEntries
) {
  // Begin an indefinite iteration through the provided textual data.
  for (
    var entryCounter = 0;
    ;
    entryCounter++
  ) {
    // Check if the current textual entry is the designated termination signal.
    if (
      textualEntries[entryCounter] == '0'
    ) {
      // If the termination signal is found, exit the processing loop immediately.
      break;
    }

    // Transform the current textual entry: first, split it into an array of single characters,
    // then convert each character into its floating-point numeric representation.
    var parsedNumbers = textualEntries[entryCounter].split('').map(parseFloat);

    // Initialize a variable to accumulate the numeric sum for the present entry.
    var currentTotal = 0.0;

    // Iterate through each of the parsed numbers collected from the current entry.
    for (
      var numberIndex = 0;
      numberIndex < parsedNumbers.length;
      numberIndex++
    ) {
      // Add the value of the current number to the ongoing total.
      currentTotal += parsedNumbers[numberIndex];
    }

    // Display the computed total for the current textual entry to the standard output.
    console.log(currentTotal);
  }
}

// Declare an array to store incoming buffered data portions from the standard input.
var incomingDataSegments = [];

// Attach an event handler to the standard input stream that triggers when new data arrives.
process.stdin.on('data', function (dataPortion) {
  // Append each received data portion to our collective storage array.
  incomingDataSegments.push(dataPortion);
});

// Attach an event handler to the standard input stream that triggers when the input stream concludes.
process.stdin.on('end', function () {
  // Consolidate all stored data portions into a single string, then divide it into an array of lines
  // using newline characters as delimiters.
  var textualEntries = incomingDataSegments.join('').split('\n');

  // Invoke the primary processing function with the newly prepared array of textual entries.
  calculateSumsFromStrings(textualEntries);
});