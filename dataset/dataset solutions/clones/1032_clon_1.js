/*
 * This JavaScript file processes input lines to calculate pond areas.
 * It uses standard input/output for interaction.
 */

process.stdin.resume(); // Ensure the standard input stream stays open.
process.stdin.setEncoding("utf8"); // Set the encoding for incoming data.


/*
 * Initialize a readline interface to handle input and output.
 * This allows reading input line by line.
 */
const reader = require("readline") . createInterface ( {
  input: process.stdin,  /* Use standard input as the source. */
  output: process.stdout, /* Use standard output for any prompts (though not used here). */
} ) ;


// Array to store all input lines read from the standard input.
const lines = [ ] ;


/*
 * Event listener for each 'line' event.
 * When a line of input is received, it's added to the 'lines' array.
 */
reader . on ( "line" , ( line ) => {
  lines . push ( line ) ; // Add the current line to our collection.
} ) ;


/*
 * Event listener for the 'close' event.
 * This fires when the input stream ends, indicating all data has been received.
 * The core logic for processing the field data resides here.
 */
reader . on ( "close" , ( ) => {

  // The first line of input is assumed to contain the 'fields' string.
  const fields = lines [ 0 ] ;

  // Stack to keep track of the starting indices of '/' characters.
  const fieldStack = [ ] ;
  // Stack to store pond objects (area and first index).
  const pondStack = [ ] ;

  // Get the length of the fields string for iteration.
  const len = fields . length ;

  /*
   * Iterate through each character of the 'fields' string.
   * This loop simulates traversing a 2D terrain represented by characters.
   */
  for ( let i = 0 ; i < len ; i ++ ) {

    const c = fields [ i ] ; // Current character being processed.

    if ( c === "\\" ) { // If the character is a backslash, it indicates a potential start of a depression.
      fieldStack . push ( i ) ; // Push its index onto the field stack.
    }
    else if ( c === "/" ) { // If the character is a forward slash, it indicates a potential end of a depression.

      // Pop the last starting index from the field stack.
      let j = fieldStack . pop ( ) ;

      // If a corresponding start was found (j is not null/undefined).
      if ( j != null ) {

        // Calculate the initial area of the current pond.
        let a = i - j ;
        // Pop the last pond from the pond stack.
        let pond = pondStack . pop ( ) ;

        // While there are previous ponds and conditions are met, merge them.
        while ( pond ) {
          // If the previous pond's starting point is after the current pond's starting point,
          // it means the previous pond is contained within the current one.
          if ( pond . first > j ) {
            a += pond . area ; // Add the area of the contained pond.
            pond = pondStack . pop ( ) ; // Pop the next pond to check.
          }
          else {
            // If the previous pond is not contained, push it back and break.
            pondStack . push ( pond ) ;
            break ;
          }
        }
        // Push the newly formed or merged pond onto the pond stack.
        pondStack . push ( { area : a , first : j } ) ;
      }
    }
  }

  // Calculate the total area of all ponds by summing their 'area' properties.
  console . log ( pondStack . reduce ( ( prev , e ) => prev + e . area , 0 ) ) ;

  // Prepare the message string for the second output.
  let msg = "" + pondStack . length ; // Start with the count of ponds.

  // If there are any ponds, append their individual areas to the message.
  if ( pondStack . length > 0 ) {
    msg += " " + pondStack . map ( ( e ) => e . area ) . join ( " " ) ; // Map to areas and join with spaces.
  }
  // Output the message.
  console . log ( msg ) ;
} ) ;