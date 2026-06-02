var receivedData = ""; // Accumulates all incoming data from stdin

// Resume stdin to start receiving data
process.stdin.resume();

// Set the encoding for incoming data to UTF-8
process.stdin.setEncoding('utf-8');

// Event listener for 'data' chunks from stdin
process.stdin.on('data', function(dataSegment) {
  receivedData += dataSegment; // Append each data chunk to the accumulated string
});

// Event listener for 'end' of stdin input
process.stdin.on('end', function() {
  // Once all input is received, split it into an array of lines
  var inputLines = receivedData.split("\n");

  // The first line is the initial string to be manipulated
  var currentString = inputLines[0];
  // The second line contains the number of queries (parsed as an integer)
  var queryCount = parseInt(inputLines[1], 10);

  // Loop through each query, starting from the third line (index 2)
  // The loop runs for 'queryCount' iterations, so it goes up to queryCount + 2
  for (let queryIndex = 2; queryIndex <= queryCount + 1; queryIndex++) {
    // Split the current query line into parts based on spaces
    var commandParts = inputLines[queryIndex].split(" ");
    // Parse the first index 'a' from the command parts
    var startIndex = parseInt(commandParts[1], 10);
    // Parse the second index 'b' from the command parts
    var endIndex = parseInt(commandParts[2], 10);

    // Determine the action based on the first part of the command
    switch (commandParts[0]) {
      case "print":
        // If the command is "print", output the substring from startIndex to endIndex (inclusive)
        console.log(currentString.slice(startIndex, endIndex + 1));
        break;
      case "reverse":
        // If the command is "reverse", reverse the substring from startIndex to endIndex (inclusive)
        // and reconstruct the main string
        currentString = currentString.slice(0, startIndex) +
                        currentString.slice(startIndex, endIndex + 1).split("").reverse().join("") +
                        currentString.slice(endIndex + 1);
        break;
      case "replace":
        // If the command is "replace", replace the substring from startIndex to endIndex (inclusive)
        // with the new string provided in commandParts[3]
        currentString = currentString.slice(0, startIndex) +
                        commandParts[3] +
                        currentString.slice(endIndex + 1);
        break;
    }
  }
});
