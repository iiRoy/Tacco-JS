/* This script processes a series of string manipulation commands from standard input. */

// A buffer to accumulate all incoming data from the standard input stream.
var dataStreamBuffer = "";

// Activate the standard input stream to begin receiving user input.
process.stdin.resume();

// Configure the standard input stream to interpret incoming bytes as UTF-8 characters.
process.stdin.setEncoding('utf-8');

// Attach an event listener for 'data' events on the standard input.
// Each time a chunk of data arrives, append it to our buffer.
process.stdin.on (
  'data',
  function ( dataPiece ) {
    dataStreamBuffer += dataPiece;
  }
);
 
// Attach an event listener for the 'end' event, which signifies that
// all input has been received. This is where the core logic executes.
process.stdin.on('end', function () {
  // Once all data is received, split the entire buffer into an array of lines.
  dataStreamBuffer = dataStreamBuffer.split("\n");

  // The first line contains the initial string that will be manipulated.
  var mainContentString = dataStreamBuffer[0];
  // The second line contains the total number of operations to perform, parsed as an integer.
  var totalOperations   = parseInt(dataStreamBuffer[1], 10);

  // Iterate through each operation command, starting from the third line of input.
  // The loop processes lines from index 2 up to totalOperations + 2, inclusive.
  // This means it processes (totalOperations + 1) command lines.
  for ( let currentOpIndex = 2; currentOpIndex <= totalOperations + 2; currentOpIndex++ ) {
    // Each command line is split by spaces to get the command type and its arguments.
    var commandArray = dataStreamBuffer[currentOpIndex].split(" ");
    
    // Parse the start and end positions for the current operation.
    var startPosition = parseInt(commandArray[1], 10);
    var endPosition   = parseInt(commandArray[2], 10);

    // Determine which string operation to perform based on the first part of the command.
    switch ( commandArray[0] ) {
      case "output": // If the command is to print a substring.
        // Log the segment of the string from startPosition to endPosition (inclusive).
        console.log( mainContentString.slice(startPosition, endPosition + 1) );
        break;

      case "invert": // If the command is to reverse a substring.
        // Reconstruct the main string:
        // 1. Part before the segment to be reversed.
        // 2. The reversed segment itself.
        // 3. Part after the segment to be reversed.
        mainContentString = mainContentString.slice(0, startPosition) +
                            mainContentString.slice(startPosition, endPosition + 1).split("").reverse().join("") +
                            mainContentString.slice(endPosition + 1);
        break;

      case "substitute": // If the command is to replace a substring.
        // Reconstruct the main string:
        // 1. Part before the segment to be replaced.
        // 2. The new string to insert (from commandArray[3]).
        // 3. Part after the segment to be replaced.
        mainContentString = mainContentString.slice(0, startPosition) +
                            commandArray[3] +
                            mainContentString.slice(endPosition + 1);
        break;
    }
  }
});