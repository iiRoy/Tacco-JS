/*
 * This is a Type I clone of the original JavaScript code.
 * All variable names, function names, operators, and expressions
 * remain exactly the same as in the original.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */
function Main ( input )
{
  // Split the input string by newline characters into an array
  input = input . split ( "\n" ) ;

  // Parse the first element of the input array as an integer for N
  N = parseInt ( input [ 0 ] ) ;

  // Initialize three arrays A, B, C with size N
  A = new Array ( N ) ;
  B = new Array ( N ) ;
  C = new Array ( N ) ;

  // Split the second and third lines of input into temporary arrays
  tmpa = input [ 1 ] . split ( " " ) ;
  tmpb = input [ 2 ] . split ( " " ) ;

  // Initialize an empty list
  list = new Array ( ) ;

  // Initialize sum 's' and answer 'ans' variables
  var s   =   0 ;
  var ans =   0 ;

  // Loop through the arrays from 0 to N-1
  for ( var i = 0 ; i < N ; i ++ )
  {
    // Convert elements of tmpa and tmpb to integers and assign to A and B
    A [ i ] = parseInt ( tmpa [ i ] ) ;
    B [ i ] = parseInt ( tmpb [ i ] ) ;

    // Check if the difference A[i] - B[i] is positive
    if ( A [ i ] - B [ i ] > 0 )
    {
      // If positive, add the difference to the 'list'
      list . push ( A [ i ] - B [ i ] ) ;
    }
    else
    {
      // If not positive (i.e., zero or negative),
      // add the minimum of 0 and the difference to 's'
      s += Math . min ( 0 , A [ i ] - B [ i ] ) ;

      // Increment the answer counter
      ans ++ ;
    }
  }

  // Negate the sum 's'
  s = - s ;

  // Sort the 'list' in descending order
  list . sort ( function ( a , b ) { return ( b - a ) ; } ) ;

  // Initialize another sum 's2'
  var s2 = 0 ;

  // Loop through the sorted 'list'
  for ( var i = 0 ; i < list . length ; i ++ )
  {
    // Add the current element to 's2'
    s2 += list [ i ] ;

    // Check if 's2' is greater than or equal to 's'
    if ( s2 >= s )
    {
      // If true, update 'ans' and break the loop
      ans += i + 1 ;
      break ;
    }
    // If it's the last element of the list and the condition is not met
    else if ( i == list . length - 1 )
    {
      // Set 'ans' to -1, indicating an impossible scenario
      ans = -1 ;
    }
  }


  // Output the final answer to the console
  console . log ( '%s' , ans ) ;
}


// This function is intended for debugging purposes within a browser environment.
// It retrieves input from an HTML element and passes it to the Main function.
function debug ( )
{
  var input = document . getElementById ( "input" ) . value ;
  Main ( input ) ;
}

// Execute the Main function using input read from standard input in Node.js environment.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;