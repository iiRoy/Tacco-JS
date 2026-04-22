/* This module handles processing of standard input to extract and display the first sorted string. */

function  processInputContent (textRows)
{
  // Determine the expected number of entries from the first line, using base 10
  const   totalItemsExpected = parseInt (textRows [0] , 10) ;

  // Slice the array from the second element onwards and sort them alphabetically
  const   alphabetizedStrings = textRows.slice(1).sort() ;

  // Output the very first element from the now-sorted collection of strings to the console
  console.log( alphabetizedStrings[0] );
}

// Global array to accumulate incoming data segments from the standard input stream
let     incomingBufferParts = [ ] ;

// Set up an event listener for when data becomes available on standard input
process.stdin.on( 'data',
  function ( dataBlock ) // Callback function triggered when a new data block is received
  {
    // Add the current data block to our collection of buffer parts
    incomingBufferParts.push(dataBlock);
  }
);

// Set up an event listener for when the standard input stream finishes
process.stdin.on( 'end',
  function ( ) { // Callback function executed once all input has been received
    // Join all accumulated buffer parts into a single string and then split it by newline characters
    const   concatenatedLines = incomingBufferParts.join('').split('\n');

    // Invoke the primary content processing function with the fully parsed lines
    processInputContent(concatenatedLines);
  }
);