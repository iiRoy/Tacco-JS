// This function is designed to process an input string
// and compute a specific cumulative value based on its contents.
function ComputePathCost( inputString )
{
  // A variable to hold the parsed numeric elements.
  var    numericalItems = inputString . split( ' ' ) ;

  // Initialize the result accumulator.
  var accumulatedCost   =   0   ;

  // Convert all string elements to integers.
  numericalItems = numericalItems . map( ( currentStringElement ) => parseInt( currentStringElement ) ) ;

  // Sort the numeric values. Default sort behavior for numbers.
  numericalItems = numericalItems . sort() ;


  // Iterate through the list of numeric values,
  // calculating the absolute difference between adjacent entries.
  for ( var currentIndex = 0 ; currentIndex < numericalItems.length - 1 ; ++ currentIndex )
  {
    accumulatedCost += Math . abs( numericalItems[ currentIndex ] - numericalItems[ currentIndex + 1 ] ) ;
  }

  // Output the final computed total to the console.
  console . log ( accumulatedCost ) ;
}

// The following statement reads data from standard input
// and then invokes the primary processing function with that data.
ComputePathCost( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;