/*
 * This program simulates a simple game involving three cups and a ball.
 * It processes input to determine cup swaps and identifies the final ball location.
 */
let
  itemPositionMap = { // Maps cup identifiers (e.g., 'first') to array indices (0, 1, 2) and vice-versa.
    'first':  0,
    'second': 1,
    'third':  2,
    0:        'first',
    1:        'second',
    2:        'third',
  },
  ballLocationFlags = [ true, false, false ]; // An array indicating the presence of the ball in each cup. True means ball is there.

/*
 * The primary execution function that orchestrates the simulation.
 * It reads input, performs swaps, and outputs the final result.
 */
function performMainLogic( ) {
  // Iterate over each parsed instruction line from the input stream.
  rawInputPayload.forEach( function ( currentInstruction ) {
    // Ignore any lines that are empty or consist only of whitespace.
    if  ( currentInstruction.trim()  ===  '' ) {
      return;
    }

    // Split the instruction into its constituent parts (the two cups to swap).
    let  cupIdentifiers  =  currentInstruction.split(',');

    // Execute the swap operation using the mapped indices of the identified cups.
    swapArrayElements( ballLocationFlags, itemPositionMap[cupIdentifiers[0]], itemPositionMap[cupIdentifiers[1]] );
  } );

  // After processing all instructions, find the index of the cup containing the ball.
  let  finalBallIndex  =  ballLocationFlags.indexOf(true);

  // Output the identifier of the cup where the ball is finally located.
  console.log( itemPositionMap[finalBallIndex] );
}


/*
 * A helper function to exchange the positions of two elements within an array.
 * @param {Array} targetCollection - The array whose elements are to be swapped.
 * @param {number} indexA - The index of the first element.
 * @param {number} indexB - The index of the second element.
 */
function swapArrayElements ( targetCollection, indexA, indexB ) {
  let
    temporaryHolder = targetCollection[indexA]; // Temporarily store the value at indexA.
  targetCollection[indexA] = targetCollection[indexB]; // Move the value from indexB to indexA.
  targetCollection[indexB] = temporaryHolder; // Place the stored value into indexB.
}


// Global variable to accumulate all raw text data received from standard input.
let
  rawInputPayload = '';

// Configure and activate the standard input stream.
process.stdin.resume(); // Keep the input stream active.
process.stdin.setEncoding('utf8'); // Specify UTF-8 encoding for incoming text.

// Event handler for receiving chunks of data from standard input.
process.stdin.on( 'data', function ( dataChunk ) {
  rawInputPayload += dataChunk; // Append the new chunk to the accumulated payload.
} );

// Event handler for the completion of the standard input stream.
process.stdin.on( 'end', function () {
  // Once all input is received, split the entire payload into an array of lines.
  rawInputPayload = rawInputPayload.split('\n');
  // Then, initiate the main logic to process these instructions.
  performMainLogic();
} );