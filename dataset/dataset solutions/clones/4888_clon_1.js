/*
 * This file processes input data for a specific problem.
 * The 'input' parameter will contain the entire raw input string.
 */
function Main ( input )
{

  // Helper function to parse a line of space-separated strings.
  // It trims leading/trailing whitespace and splits the string by spaces.
  var space_strinput = function ( line )
  {
    var arr = line.replace( / ( ^ \s + ) | ( \s + $ ) / g , "" ) . split ( " " ) ;
    // Ensure each element is processed, though in this case it's a no-op for strings.
    for ( var i = 0 ; i < arr . length ; ++ i )
    {
      arr [ i ] = arr [ i ] ; // Identity assignment for string array elements.
    }
    return arr ;
  } ; // End of space_strinput function definition.


  // Helper function to parse a line of space-separated numbers.
  // It trims leading/trailing whitespace, splits, and converts each part to a number.
  var space_numinput = function ( line )
  {
    var arr = line . replace ( / ( ^ \s + ) | ( \s + $ ) / g , "" ) . split ( " " ) ;
    // Convert each string element to a number using the unary plus operator.
    for ( var i = 0 ; i < arr . length ; ++ i )
    {
      arr [ i ] = + arr [ i ] ; // Convert to numeric type.
    }
    return arr ;
  } ; // End of space_numinput function definition.


  // Simple helper function to find the minimum of two numbers.
  // Uses a ternary operator for concise comparison.
  var getmin = function ( a , b )
  {
    return a > b ? b : a ;
  } ;


  // Split the entire input string by newline characters to get an array of lines.
  // The first line will be at index 0, the second at index 1, and so on.
  var lines = input . split ( "\n" ) ;


  // Parse the first line (lines[0]) into an array of numbers.
  // This line typically contains problem parameters.
  var l0 = space_numinput ( lines [ 0 ] ) ;

  // Extract 'n' from the first element of l0.
  var n = l0 [ 0 ] ;

  // Extract 't' from the second element of l0.
  var t = l0 [ 1 ] ;


  // Parse the second line (lines[1]) into an array of numbers.
  // This likely represents the main data array for processing.
  var a = space_numinput ( lines [ 1 ] ) ;


  // Initialize 'rieki' (profit) to zero. This will store the maximum profit found.
  var rieki = 0 ;

  // Initialize 'rieki_place_count' to zero.
  // This counter tracks how many times the maximum profit has been achieved.
  var rieki_place_count = 0 ;


  // Initialize 'min' with the first element of the array 'a'.
  // This will keep track of the minimum value encountered so far in the iteration.
  var min = a [ 0 ] ;

  // Initialize 'max' with the first element of the array 'a'.
  // NOTE: 'max' is declared but not used in the original logic.
  var max = a [ 0 ] ;


  // Special case: If 'n' (the number of elements) is 1, no profit can be made.
  if ( n == 1 )
  {
    console . log ( "0" ) ; // Output 0 and exit.
  }

  // Main loop to iterate through the array 'a' to find the maximum profit.
  // The loop runs from the first element up to (but not including) 'n'.
  for ( var i = 0 ; i < n ; ++ i )
  {
    // Get the current value from the array.
    var val = a [ i ] ;

    // Check if the current profit (val - min) is greater than the previously recorded maximum profit.
    if ( val - min > rieki )
    {
      rieki = val - min ;           // Update the maximum profit.
      rieki_place_count = 1 ;       // Reset the count as a new maximum profit is found.
    }
    // If the current profit is equal to the maximum profit AND the profit is not zero,
    // increment the counter for maximum profit occurrences.
    else if ( val - min == rieki && rieki != 0 )
    {
      rieki_place_count ++ ; // Increment the count of places with this max profit.
    }

    // Update the minimum value encountered so far.
    // If 'val' is less than current 'min', 'min' becomes 'val'. Otherwise, 'min' remains unchanged.
    min = val < min ? val : min ;
  }


  // Output the minimum of 'rieki_place_count' and 't' divided by 2 (integer division).
  // This is the final result based on the problem's requirements.
  console . log ( getmin ( rieki_place_count , Math . floor ( t / 2 ) ) ) ;

} // End of Main function.


// This line reads the input from standard input (/dev/stdin)
// using Node.js's file system module and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;