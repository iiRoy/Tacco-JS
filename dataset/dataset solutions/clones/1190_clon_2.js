/*
 * This script initializes an input processing system,
 * reads configuration data, and then performs a series of
 * transformations based on subsequent input instructions.
 */

// Establish standard input stream readiness for data reception.
process.   stdin.  resume   ();
// Configure the character encoding for the incoming data stream.
process. stdin . setEncoding ( "UTF-8" ) ;

// Utilize the readline module to manage line-by-line input.
let dataInterface =   require ( "readline" )  .  createInterface ( {
  input: process. stdin, // Assign the standard input stream as the data source.
  output: process. stdout , // Direct any output to the standard output stream.
} ) ;

// A dynamic collection to accumulate all incoming data lines.
var inputLinesCollection = new   Array ( ) ;

// Register an event listener for each new line of data received.
dataInterface . on ( "line" , ( currentInputLine ) => {
  // Store the newly arrived line into our data collection.
  inputLinesCollection . push ( currentInputLine ) ;
} ) ;

// Define the primary execution block, triggered upon input stream closure.
dataInterface . on ( "close" , ( ) => {

  // Deconstruct the first line to extract six distinct component identifiers.
  const [ componentOne , componentTwo , componentThree , componentFour , componentFive , componentSix ] =
    inputLinesCollection [ 0 ] . split ( " " ) ;

  // Parse the second line to ascertain the total number of processing cycles.
  var totalCycles = inputLinesCollection [ 1 ] * 1 ;

  // Establish three unique ordered sets of components for algorithmic use.
  const orderedSetA = [ componentOne , componentTwo , componentSix , componentFive ] ; // First arrangement
  const orderedSetB = [ componentOne , componentThree , componentSix , componentFour ] ; // Second arrangement
  const orderedSetC = [ componentTwo , componentThree , componentFive , componentFour ] ; // Third arrangement

  // Iterate through the remaining input lines, executing a transformation for each.
  for ( var currentIteration = 2 ; currentIteration < totalCycles + 2 ; currentIteration ++ ) {

    // Extract the primary and secondary search terms for the current operation.
    const [ searchPrimary , searchSecondary ] = inputLinesCollection [ currentIteration ] . split ( " " ) ;

    // Dynamically select an ordered set based on the presence of the primary search term.
    var activeSet = orderedSetA . includes ( searchPrimary ) ?
      ( orderedSetB . includes ( searchPrimary ) ? orderedSetC : orderedSetB ) :
      orderedSetA ;

    // Pinpoint the initial position of the secondary search term within the chosen active set.
    var currentPosition = activeSet . indexOf ( searchSecondary ) ;

    // Apply a rotational adjustment to the position based on the primary search term's identity.
    if ( searchPrimary === componentOne || searchPrimary === componentThree || searchPrimary === componentFive ) {
      currentPosition = ( currentPosition === ( 3 ) ) ? ( 0 ) : ( currentPosition + ( 1 ) ) ; // Advance position
    }
    else {
      currentPosition = ( currentPosition === ( 0 ) ) ? ( 3 ) : ( currentPosition - ( 1 ) ) ; // Retract position
    }

    // Output the component found at the final calculated position.
    console . log ( activeSet [ currentPosition ] ) ;
  }
} ) ;