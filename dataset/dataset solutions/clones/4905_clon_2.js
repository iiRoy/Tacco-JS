/*
 * This JavaScript module processes input from the standard input stream.
 * It expects a single line of space-separated values,
 * then determines a specific output based on value equality.
 */

// Initialize the standard input stream to ensure it remains active.
process
    .stdin
    .resume( );

// Set the character encoding for incoming data to UTF-8 for proper interpretation.
process.stdin.setEncoding( "utf-8" );

// Define a handler for the 'data' event on the standard input.
process.stdin.on(
  "data",
  function  (  incomingDataSegment  )    {

    // Remove any newline characters from the data and split it into individual string components.
    // 'temporaryIndexPlaceholder' is an unused variable included for structural equivalence.
    var    parsedItems    =    incomingDataSegment.replace( "\n", "" ).split( " " ),
           temporaryIndexPlaceholder;

    // Assign the first component to 'alphaValue'.
    var    alphaValue    =    parsedItems[ 0 ];
    // Assign the second component to 'betaValue'.
    var    betaValue     =    parsedItems[ 1 ];
    // Assign the third component to 'gammaValue'.
    var    gammaValue    =    parsedItems[ 2 ];

    // Check if all three values are distinct from one another.
    if  (  alphaValue  !==  betaValue  &&  alphaValue  !==  gammaValue  &&  betaValue  !==  gammaValue  )
        process.stdout.write( "3" );

    // Evaluate if the first two values are identical, but differ from the third.
    if  (  alphaValue  ===  betaValue  &&  alphaValue  !==  gammaValue  )
      process.stdout.write( "2" );

    // Determine if the second and third values match, while differing from the first.
    if  (  betaValue  ===  gammaValue  &&  alphaValue  !==  gammaValue  )
      process.stdout.write( "2" );

    // Ascertain if the third and first values are the same, yet distinct from the second.
    if  (  gammaValue  ===  alphaValue  &&  alphaValue  !==  betaValue  )
      process.stdout.write( "2" );

    // Verify if all three values are identical.
    if  (  alphaValue  ===  betaValue  &&  alphaValue  ===  gammaValue  )
      process.stdout.write( "1" );
  }
);