// This function processes the entire incoming payload.
function ExecuteSolution ( dataString )
{
  // Split the raw input into its constituent lines.
  var [ firstLineInfo, elementsString ] = dataString . split ( "\n" ) ;

  // Parse the second line into an array of integers.
  var parsedNumbers = elementsString . split ( " " ) . map ( currentStr => Number ( currentStr ) ) ;

  // Initialize a counter for specific conditions.
  let matchCount = 0 ;

  // Iterate through the collection to find matching pairs.
  parsedNumbers . forEach ( ( elementValue , position , sourceCollection ) => {
    // Check if the value at the 'elementValue - 1' index
    // is equal to the current 'position + 1'.
    matchCount += ( sourceCollection [ elementValue - 1 ] === position + 1 ) ? 1 : 0 ;
  } ) ;

  // Output the final computed result.
  console . log ( matchCount / 2 ) ;
}
// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
ExecuteSolution ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;