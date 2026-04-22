/*
 * This script is designed to read input from standard input,
 * process it, and then output a result to standard output.
 * It primarily handles character sequence manipulation.
 */

// Resume the standard input stream to listen for data.
process.stdin.resume();

// Set the encoding for the standard input stream.
process.stdin.setEncoding( 'utf-8' );

let rawInputBuffer = ''; // Buffer to accumulate all incoming data chunks.
let lineCounter = 0;     // Tracks the current line number being processed from the buffer.

// Event listener for incoming data chunks on standard input.
process.stdin.on('data', dataChunk => {
    rawInputBuffer += dataChunk; // Append each received data chunk to the buffer.
});


// Event listener for the 'end' signal on standard input, indicating no more data.
process.stdin.on( 'end', voidParam => {
    // Process the accumulated input:
    // 1. Trim leading/trailing whitespace from the entire buffer.
    // 2. Split the buffer into an array of lines based on newline characters.
    // 3. For each line, trim any leading/trailing whitespace.
    rawInputBuffer = rawInputBuffer.trim().split( '\n' ).map( singleTextLine => {
        return singleTextLine.trim();
    } );
    
    // Once input is parsed, initiate the main processing logic.
    processMainTask();    
} );


/**
 * Retrieves the next line from the processed input buffer.
 * Increments the line counter after each retrieval.
 * @returns {string} The next line of input.
 */
function getNextInputLine() {
    return rawInputBuffer[ lineCounter++ ];
}

/**
 * The core logic function that performs the main task.
 * This function is responsible for sorting a sequence of 'R' and 'W' characters
 * by moving all 'W' characters to the left and 'R' characters to the right,
 * counting the minimum number of swaps required.
 */
function processMainTask() {

  // Read the first line of input, which is expected to be the count of elements.
  const elementCount = Number( getNextInputLine() );
  // Read the second line of input, which is the character sequence itself.
  const charArraySequence = getNextInputLine();

  let leftBoundary = 0;     // Pointer for the left end of the sequence.
  let rightBoundary = elementCount - 1; // Pointer for the right end of the sequence.
  let totalSwaps = 0;       // Counter for the total number of swap operations.

  // Define the target characters for clarity.
  const redMarker   = 'R';
  const whiteMarker = 'W';

  // Loop continues as long as the left pointer does not cross the right pointer.
  while ( leftBoundary <= rightBoundary ) {

    let whitePresent = false; // Flag to indicate if a 'W' was found from the left.
    let redPresent   = false; // Flag to indicate if an 'R' was found from the right.

    // Inner loop: Search for a 'W' from the left.
    for ( let currentLeftIdx = leftBoundary; currentLeftIdx < rightBoundary; currentLeftIdx++ ) {
      // If the character at currentLeftIdx is 'R', it's already in a good position (right side).
      // So, we skip it and continue searching for 'W'.
      if ( charArraySequence[ currentLeftIdx ] === redMarker ) {
        continue;
      }
      
      // A 'W' character is found at currentLeftIdx.
      whitePresent = true;
      redPresent   = false; // Reset the redPresent flag for the inner-most loop.

      // Innermost loop: Search for an 'R' from the right.
      for ( let currentRightIdx = rightBoundary; currentRightIdx > currentLeftIdx; currentRightIdx-- ) {
        // If the character at currentRightIdx is 'W', it's already in a good position (left side).
        // So, we skip it and continue searching for 'R'.
        if ( charArraySequence[ currentRightIdx ] === whiteMarker ) {
          continue;
        }
        
        // An 'R' character is found at currentRightIdx.
        // This 'R' can be swapped with the 'W' found at currentLeftIdx.
        rightBoundary = currentRightIdx - 1; // Move the right pointer inward.
        totalSwaps += 1;                     // Increment the swap counter.
        redPresent = true;                   // Mark that an 'R' was found and handled.
        break;                               // Exit this innermost loop as a swap pair is found.
      }
      
      // If no 'R' was found to swap with the 'W' (meaning all remaining characters to the right are 'W'),
      // then we can break the outer 'W' search loop as no more swaps are possible from this left position.
      if ( !redPresent ) {
        break;
      }

      // If a swap occurred, move the left pointer past the swapped 'W'.
      leftBoundary = currentLeftIdx + 1;
      break; // Exit the 'W' search loop, restart the main while loop.
    }

    // If no 'W' was found from the left, or no 'R' was found from the right to swap with,
    // then the sequence is effectively sorted or no more swaps are needed.
    if ( !whitePresent || !redPresent ) {
      break; // Exit the main sorting loop.
    }
  }

  // Output the final count of swap operations required.
  console.log( totalSwaps );
}