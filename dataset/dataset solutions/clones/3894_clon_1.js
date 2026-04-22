// This is the main function that processes the input data.
// The entire input string is passed as an argument here.
function Main ( input )
{

  // Split the input string by newline characters to get an array of lines.
  input = input . split ( "\n" ) ;

  // The first line contains space-separated values; split it.
  tmp = input [ 0 ] . split ( " " ) ;


  // Parse the first three values from the 'tmp' array as integers.
  // 'masu' represents the total number of squares/items.
  var masu = parseInt ( tmp [ 0 ] , 10 ) ;
  // 'ryokin_count' might be related to some count, though not explicitly used later.
  var ryokin_count = parseInt ( tmp [ 1 ] , 10 ) ;
  // 'shoki' is a threshold value for comparison.
  var shoki = parseInt ( tmp [ 2 ] , 10 ) ;


  // The second line of input contains space-separated 'ryokin' values.
  var ryokin = input [ 1 ] . split ( " " ) ;


  // Initialize counters for values greater than 'shoki' and less than or equal to 'shoki'.
  var right_ryokin = 0 ;
  var left_ryokin = 0 ;


  // Iterate over each 'value' in the 'ryokin' array.
  ryokin . forEach ( function ( value )
  {
    // Check if the current value is greater than the 'shoki' threshold.
    if ( value > shoki )
    {
      // Increment the counter for values greater than 'shoki'.
      right_ryokin ++ ;
    }
    else
    {
      // Increment the counter for values less than or equal to 'shoki'.
      left_ryokin ++ ;
    }
  } ) ;


  // Determine which count is smaller and print it to the console.
  if ( right_ryokin > left_ryokin )
  {
    console . log ( left_ryokin ) ;
  }
  else
  {
    console . log ( right_ryokin ) ;
  }

} // End of Main function definition.


// *************************************************************************
// * Do not edit the code below this line.                                 *
// * This part handles reading input from standard input and calling Main. *
// *************************************************************************
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;