/* This module facilitates the reading of input data and its subsequent processing to render graphical patterns. */
function getStreamContent() {
  // Define a function to acquire raw content from the standard input stream.

  // Utilizing Node.js's built-in 'fs' (file system) module to synchronously read
  // the entire content of '/dev/stdin', interpreting it as UTF-8 encoded text.
  var rawFileContents = require("fs").readFileSync("/dev/stdin", "utf8");

  // The acquired string content is then split into an array of individual lines.
  // The regular expression `/\n\r?/` handles both Unix-style (`\n`) and
  // Windows-style (`\r\n`) line endings for robust parsing.
  return rawFileContents.split(/\n\r?/);
}


// Invoke the input acquisition function and then iterate over each resulting line.
// The 'every' array method will continue processing lines as long as its callback
// function returns a truthy value, stopping if a falsy value is encountered.
getStreamContent()
  .every(
    function( currentInputLine )
    {
      // Each 'currentInputLine' string is split by a space character (' ')
      // to separate the two dimension values provided on that line.
      var parsedSegments = currentInputLine.split(' ');

      // The first segment is parsed as a number and assigned to represent the grid's vertical dimension.
      var gridHeight = +parsedSegments[0];
      // The second segment is similarly parsed as a number for the grid's horizontal dimension.
      var gridWidth  = +parsedSegments[1];

      // This is a conditional return statement (ternary operator).
      // If both 'gridHeight' and 'gridWidth' are zero (indicating an end condition),
      // the function returns 'false', which terminates the 'every' loop.
      // Otherwise, it proceeds to draw the grid pattern.
      return ( !gridHeight && !gridWidth )
               ? false
               : !console.log( // The '!' negates the return of console.log (which is undefined),
                               // ensuring a truthy value for 'every' to continue.
                   new Array(gridHeight + 1).join( // This creates a string containing 'gridHeight' repetitions
                                                   // of the row pattern, effectively forming the vertical structure.
                     new Array(gridWidth + 1).join('#') + "\n" // This inner part creates a single row string,
                                                               // repeating '#' 'gridWidth' times, followed by a newline.
                   )
                 );
    }
  );