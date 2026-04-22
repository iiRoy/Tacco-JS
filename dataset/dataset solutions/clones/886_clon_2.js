var ioManager = require('fs'),
    // Retrieve the total size in bytes of the standard input stream
    streamLength = ioManager.fstatSync(process.stdin.fd).size,
    // Instantiate a new buffer to hold the incoming data
    inputBlob = new Buffer(streamLength),
    // Perform a synchronous read operation from stdin into the buffer
    readCount = ioManager.readSync(process.stdin.fd, inputBlob, 0, streamLength, 0),
    // Convert the buffer's contents to a UTF-8 string and then split it into an array of lines
    processedInput = inputBlob.toString('utf8', 0, readCount).split('\n');

// Call the primary function to begin processing the parsed input
processData();

/**
 * @function processData
 * @description This routine manages the core logic of the application.
 *              It parses configuration values and then iterates through
 *              subsequent data entries to determine a final designated label.
 */
function processData ( ) {
  // Establish a local reference to the globally parsed input records
  var inputRecords = processedInput,
      // Extract the first numerical parameter (total items) from the initial line
      itemCount = parseInt( inputRecords[0].split(' ')[0] ),
      // Extract the second numerical parameter (comparison threshold) from the initial line
      comparisonLimit = parseInt( inputRecords[0].split(' ')[1] ),
      // Variable to temporarily store parsed segments of a line
      lineParts,
      // Initialize the default identifier string
      resultIdentifier = 'kogakubu10gokan' ;

  // Begin iterating through the input records, starting from the second line (index 1)
  for ( var idx = 1 ; idx <= itemCount ; idx++ ) {
    // Split the current record line into its individual components
    lineParts = inputRecords[idx].split(' ') ;

    // Evaluate if the comparison threshold surpasses the numeric value of the first component
    if ( comparisonLimit > parseInt( lineParts[0] ) ) {
      // If the condition is met, exit the loop prematurely
      break ;
    }
    // Otherwise, update the result identifier with the second component of the current line
    resultIdentifier = lineParts[1] ;
  }

  // Output the final determined identifier to the standard console
  console.log( resultIdentifier ) ;
}