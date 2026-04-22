/*
 * This section handles the entire input data.
 * The 'input' parameter will contain the raw string from standard input.
 */

function Main ( input )
{
  // Split the input string by newlines to get an array of lines.
  input = input.split ( "\n" ) ;

  // Split the first line by spaces to get an array of temporary values.
  let tmp = input [ 0 ] .split ( " " ) ;


  // Parse the first temporary value as an integer for 'n'.
  var n = parseInt ( tmp [ 0 ] , 10 ) ;
  // Parse the second temporary value as an integer for 'x'.
  var x = parseInt ( tmp [ 1 ] , 10 ) ;
  // Parse the third temporary value as an integer for 'y'.
  var y = parseInt ( tmp [ 2 ] , 10 ) ;


  // Calculate the maximum possible value, which is the minimum of x and y.
  var max = Math.min ( x , y ) ;

  // Initialize the minimum value to 0.
  var min = 0 ;

  // Check if both x and y are not zero.
  if ( x != 0 && y != 0 )
  {
    // Calculate num1, adjusting x based on half of n.
    var num1 = x - Math.floor ( n / 2 ) ;
    // Calculate num2, adjusting y based on half of n.
    var num2 = y - Math.floor ( n / 2 ) ;

    // Ensure num1 is not negative.
    if ( num1 < 0 )
    {
      num1 = 0 ;
    }

    // Ensure num2 is not negative.
    if ( num2 < 0 )
    {
      num2 = 0 ;
    }

    // Assign the sum of num1 and um2 (typo preserved) to min.
    min = num1 + um2 ;
  }

  // Display the calculated maximum and minimum values to the console.
  // This is the primary output of the program.
  console.log ( '%d %d' , max , min ) ;
}


// --- Do not modify the code below this line ---
// This part reads input from standard input and calls the Main function.
// It ensures the program can be run in a standard competitive programming environment.
Main ( require ( "fs" ) .readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 * End of file.
 * This comment marks the end of the script and should not be edited further.
 */