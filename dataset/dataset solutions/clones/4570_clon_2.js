// This function processes geometry-related input and calculates a minimal difference.
function ProcessGeometryData ( rawTextualInput )
{
  // Split the entire input string into individual lines based on newline characters.
  let processedLines = rawTextualInput . split ( "\n" ) ;

  // Extract the first numerical dimension (height) from the first line.
  // The '- 0.0' operation ensures string-to-number conversion.
  const primaryDimension = processedLines [ 0 ] . split ( ' ' ) [ 0 ] - 0.0 ;

  // Extract the second numerical dimension (width) from the first line.
  const secondaryDimension = processedLines [ 0 ] . split ( ' ' ) [ 1 ] - 0.0 ;

  // Initialize a variable to hold the smallest calculated difference,
  // setting it to the largest possible number initially.
  var minimumPossibleDifference = Number . MAX_VALUE ;

  // Check for specific conditions where one of the dimensions is perfectly divisible by 3.
  if ( ( primaryDimension % 3.0 === 0.0 ) || ( secondaryDimension % 3.0 === 0.0 ) )
  {
    // If either condition is met, the minimal difference is 0.0.
    console . log ( 0.0 ) ;
    return ; // Terminate the function's execution early.
  }

  // Establish an initial minimum difference based on the smaller of the two dimensions.
  minimumPossibleDifference = Math . min ( primaryDimension , secondaryDimension ) ;

  // Evaluate various scenarios contingent on the primary dimension's parity.
  if ( primaryDimension % 2.0 === 0.0 )
  {
    // If the primary dimension is an even number, update minimumPossibleDifference with half its value.
    minimumPossibleDifference = Math . min ( minimumPossibleDifference , primaryDimension / 2.0 ) ;
  }
  else
  {
    // If the primary dimension is an odd number, compute a more elaborate value involving both dimensions.
    minimumPossibleDifference = Math . min ( minimumPossibleDifference , primaryDimension / 2.0 + secondaryDimension / 3.0 - 1.0 / 6.0 ) ;
  }

  // Assess further scenarios based on the secondary dimension's parity.
  if ( secondaryDimension % 2.0 === 0.0 )
  {
    // If the secondary dimension is an even number, update minimumPossibleDifference with half its value.
    minimumPossibleDifference = Math . min ( minimumPossibleDifference , secondaryDimension / 2.0 ) ;
  }
  else
  {
    // If the secondary dimension is an odd number, compute a more elaborate value involving both dimensions.
    minimumPossibleDifference = Math . min ( minimumPossibleDifference , secondaryDimension / 2.0 + primaryDimension / 3.0 - 1.0 / 6.0 ) ;
  }

  // Display the final computed minimum difference, rounded to the nearest integer value.
  console . log ( Math . round ( minimumPossibleDifference ) ) ;
}

// The subsequent line of code is for standard input processing and should not be modified.
ProcessGeometryData ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;