/* This JavaScript module processes incoming standard input to compute final displacement coordinates. */
process.stdin.on( "data" ,
 function ( incomingBuffer ) {

  // Initialize positional and rotational variables.
  // horizontalCoord: Current horizontal position.
  // verticalCoord: Current vertical position.
  // currentAngleDegrees: Accumulated rotation in degrees.
  // degToRadMultiplier: Constant to convert degrees to radians for trigonometric functions.
  var horizontalCoord = 0.0,
      verticalCoord   = 0.0,
      currentAngleDegrees = 0.0,
      degToRadMultiplier  = Math.PI / 180.0;

  // Convert the input buffer to a string, remove leading/trailing whitespace,
  // then split into individual lines. Iterate over these lines.
  // The 'some' method is used here to process each line; it doesn't stop early.
  ( incomingBuffer + "" ) .trim()
                          .split( "\n" )
                          .some( function ( inputLine ) {

    // Each line contains two comma-separated numeric values: distance and angle change.
    inputLine = inputLine.split( "," );

    // Update the horizontal coordinate.
    // The first value in inputLine is distance, converted to a number.
    horizontalCoord += ( +inputLine[0] ) * Math.sin( currentAngleDegrees * degToRadMultiplier );

    // Update the vertical coordinate.
    // The first value in inputLine is distance, converted to a number.
    verticalCoord   += ( +inputLine[0] ) * Math.cos( currentAngleDegrees * degToRadMultiplier );

    // Accumulate the new angle from the second value in inputLine.
    currentAngleDegrees += ( +inputLine[1] );
  } );

  // Output the final horizontal coordinate as an integer.
  console.log( horizontalCoord | 0 );

  // Output the final vertical coordinate as an integer.
  console.log( verticalCoord | 0 );

 } ) .resume(); /* Reactivate the standard input stream to continue listening for data. */