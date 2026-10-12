process.stdin.resume();

// Set the encoding for incoming data streams
process.stdin.setEncoding("utf8");

/*
 * This event listener processes data chunks received from standard input.
 * It splits the input by newline, then attempts to parse numbers from each line.
 */
process.stdin.on("data", function (inputSegment) {
  // Split the incoming data chunk into individual lines
  var linesArray = inputSegment.split("\n");

  // Define a regular expression to capture two sequences of digits
  var numberPattern = /([\d]+) ([\d]+)/;

  // Iterate through each line of the processed input
  for (var idx = 0; idx < linesArray.length; idx++) {
    // Attempt to execute the regex pattern on the current line
    var matchOutcome = numberPattern.exec(linesArray[idx]);

    // Check if a match was found and it contains two captured groups (plus the full match)
    if (matchOutcome && matchOutcome.length === 3) {
      // Parse the captured digit strings as integers and sum them
      var sumOfNumbers = parseInt(matchOutcome[1]) + parseInt(matchOutcome[2]);

      // Write the sum to standard output, converting it to a string
      process.stdout.write(sumOfNumbers.toString());

      // Add a newline character after each sum for proper formatting
      process.stdout.write("\n");
    }
  }
});
