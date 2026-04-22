/* This is the main entry point of the program */
function main ( input )
{
  // Split the input string into an array of lines
  var rows  =  input . split ( '\n' ) ;

  /* Extract the number of pieces from the first line. */
  var pieceCount = rows [ 0 ] . split ( " " ) . map ( Number ) [ 0 ] ;

  // Process the second line to get sorted coordinates
  var coordinates = rows [ 1 ] . trim ( ) . split ( " " ) . map ( Number ) . sort ( ( a , b ) => a - b ) ;

  // Initialize an empty array to store step differences
  var steps = [ ] ;

  /* Iterate through the coordinates to calculate differences. */
  coordinates . forEach ( ( item , i ) =>
  {
    // Ensure we are not at the first element to avoid negative index
    if ( i > 0 )
    {
      steps . push ( item - coordinates [ i - 1 ] ) ; // Calculate the difference between current and previous coordinate
    }
  } ) ;

  // Sort the calculated steps and slice to keep only the necessary ones
  steps = steps . sort ( ( a , b ) => a - b ) . slice ( 0 , steps . length - pieceCount + 1 ) ;

  /* Finally, sum up the remaining steps and print the result to the console. */
  console . log ( steps . reduce ( ( sum , cur ) => sum + cur , 0 ) ) ;
}

// Call the main function with input from standard input
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;