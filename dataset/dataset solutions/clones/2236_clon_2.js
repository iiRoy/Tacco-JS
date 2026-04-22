function ProcessGeometricData ( rawInputText )
{
  // This initial step separates the entire input string into an array of individual lines.
  const lineSegments = rawInputText.split ( '\n' ) ;

  // The first line represents the vertical measurement; it's converted to an integer.
  let verticalDimension = Math.trunc ( parseFloat ( lineSegments[0] ) ) ;
  // The second line provides the horizontal measurement, also converted to an integer.
  let horizontalDimension = Math.trunc ( parseFloat ( lineSegments[1] ) ) ;
  // The third line indicates the total required area, parsed as an integer value.
  let totalAreaNeeded = Math.trunc ( parseFloat ( lineSegments[2] ) ) ;
  
  // A variable is initialized to hold the ultimate computed outcome, starting at zero.
  let calculatedResult = 0 ;
  
  // A conditional check is performed to determine which dimension is greater.
  if ( verticalDimension > horizontalDimension )
  {
    // If the vertical dimension is larger, it is used as the divisor for the area.
    calculatedResult = Math.ceil ( totalAreaNeeded / verticalDimension ) ;
  }
  else
  {
    // Otherwise, the horizontal dimension is utilized for the division.
    calculatedResult = Math.ceil ( totalAreaNeeded / horizontalDimension ) ;
  }
  
  // The final calculated result is then displayed via the console's information stream.
  console.info ( calculatedResult ) ;
}

// The main processing function is invoked, reading its data from the standard input file.
ProcessGeometricData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;