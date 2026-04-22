// This function processes input data to compute a specific angle.
function processGeometricInput ( incomingDataSet ) {
  // Extract numerical parameters from the first line of the input array.
  const parsedNumericalValues = incomingDataSet[ 0 ] . split ( ' ' ) ;

  // Assign the extracted values to descriptive constants, ensuring they are numbers.
  const firstDimension = parseFloat ( parsedNumericalValues[ 0 ] ) ;
  const secondDimension = parseFloat ( parsedNumericalValues[ 1 ] ) ;
  const fillAmount = parseFloat ( parsedNumericalValues[ 2 ] ) ;

  // Calculate the overall capacity of the container.
  const overallCapacity = firstDimension * firstDimension * secondDimension ;

  // Determine the scenario based on the fill amount relative to half the container's capacity.
  if ( fillAmount >= overallCapacity / 2 ) {
    // Scenario 1: Container is more than half full.
    // Calculate the height of the unfilled space from the top.
    let emptyAreaHeight = 2 * ( secondDimension - ( fillAmount / ( firstDimension * firstDimension ) ) ) ;

    // Compute the angle in radians using the arctangent function.
    let angleInRadians = Math.atan ( emptyAreaHeight / firstDimension ) ;

    // Convert the calculated angle from radians to degrees for the final result.
    let finalAngleInDegrees = ( angleInRadians * 180 ) / Math.PI ;

    // Output the computed angle.
    console.log ( "%s", finalAngleInDegrees ) ;
  } else {
    // Scenario 2: Container is less than half full.
    // Calculate the actual height of the liquid.
    let currentLiquidLevel = ( 2 * fillAmount ) / ( firstDimension * secondDimension ) ;

    // Compute the angle in radians based on the liquid level.
    let angleInRadians = Math.atan ( secondDimension / currentLiquidLevel ) ;
   
    // Convert this radian value to degrees.
    let finalAngleInDegrees = ( angleInRadians * 180 ) / Math.PI ;
    
    // Display the final angular value.
    console.log ( "%s", finalAngleInDegrees ) ;
  }
}

// Execute the primary function, reading its input from standard input.
processGeometricInput ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) . split ( "\n" ) ) ;