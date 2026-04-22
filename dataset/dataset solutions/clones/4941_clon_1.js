// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered significantly.

// Resume the standard input stream to prevent the program from exiting immediately.
process.stdin.resume();


// Set the encoding for standard input to 'utf8' for proper character handling.
process.stdin.setEncoding( 'utf8' );


/*
 * Attach an event listener to the standard input stream.
 * This function will be executed every time data is received.
 * The 'chunk' parameter contains the incoming data.
 */
process.stdin.on( 'data', function ( chunk ) {

  // Call the main processing function, ensuring the input chunk is trimmed
  // of any leading or trailing whitespace before processing.
  main( chunk.trim() );

} );


/**
 * The primary function responsible for processing the input string.
 * It iteratively removes all occurrences of the substring "ST" from the input.
 * The process continues until no more "ST" substrings can be found,
 * ensuring that even newly formed "ST"s (e.g., from "SSTT" becoming "ST") are removed.
 *
 * @param {string} chunk - The string data received from standard input to be processed.
 */
function main ( chunk ) {

  // Initialize a variable 'ans' with the initial length of the chunk.
  // This will be used to detect if a replacement has occurred in the loop.
  var ans = chunk.length ;

  // Perform the first replacement operation.
  // This is necessary to potentially change the length before entering the loop.
  chunk = chunk.replace( "ST", "" ) ;


  // Enter a loop that continues as long as the length of the chunk
  // changes after a replacement operation.
  // This ensures all "ST" sequences are removed.
  while ( ans != chunk.length ) {

    // If the length changed, update 'ans' to the new current length.
    // This value will be compared in the next iteration.
    ans = chunk.length ;

    // Perform another replacement. If "ST" is still present, the length will change again.
    chunk = chunk.replace( "ST", "" ) ;

  }

  // After all "ST" substrings have been removed,
  // print the final length of the processed chunk to the console.
  console.log( chunk.length ) ;

}