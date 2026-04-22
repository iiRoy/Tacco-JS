// This is a Type I clone generated to demonstrate variations in whitespace and comments.
// All functional elements, identifiers, and expressions are precisely preserved.
// Only formatting and commentary have been extensively altered.


// The original file contained a series of numeric comments at the top.
// For instance:
// // 1
// // 2
// // 1 2
// // 10
// // //
// // 1
// // 2
// // 1 1
// // 10
// These have been replaced by this introductory block of text.


function   solve ( n , x , A , S )
{
  // A previously commented-out debug line remains commented, preserving its state.
  // console.log('n:', n, 'x:', x, 'a:', A[S.length - n], 's:', S[S.length - n])


  if ( n   ===   0 )
  {
    return   x   ===   0 ;
  } // End of base case condition.


  const   s   =   S [ S . length   -   n ] ; // Retrieve character 's' from string S.


  if ( s   ===   '1' )
  {
    // This block executes if the character 's' is '1'.
    // console.log('exec 1 do:') // Another preserved debug comment.
    const   r1   =   solve ( n   -   1 , x   ^   A [ S . length   -   n ] , A , S ) ;
    // console.log('exec 1 rm:') // And yet another.
    const   r2   =   solve ( n   -   1 , x , A , S ) ;
    // The result for this path requires both recursive calls to return true.
    // console.log(r1, r2) // Final preserved debug comment in this branch.
    return   r1   &&   r2 ;
  }
  else
  {
    // This 'else' block handles cases where 's' is not '1' (presumably '0').
    // console.log('exec 0:') // Debug comment for this branch.
    return   solve ( n   -   1 , x   ^   A [ S . length   -   n ] , A , S )   ||   solve ( n   -   1 , x , A , S ) ;
  }

} // End of function `solve`. Its purpose is to determine a specific condition.


// The `main` function orchestrates the input parsing and execution flow.
function   main ( input )
{
  const   inputs   =   input . split ( '\n' ) ; // Split the entire input by newline characters.
  const   T   =   Number ( inputs [ 0 ] ) ; // The first line indicates the number of test cases.


  // Loop through each test case. Each case occupies three lines after the initial T.
  for ( let   i   =   0 ;   i   <   T   *   3 ;   i   +=   3 )
  {
    const   N   =   inputs [ i   +   1 ] ; // The N value for the current test.
    const   A   =   inputs [ i   +   2 ] . split ( ' ' ) ; // Array A, parsed from space-separated values.
    const   S   =   inputs [ i   +   3 ] ; // String S for the current test case.

    // Call the `solve` function with the current test case's parameters.
    // The initial 'x' value is 0 as per problem requirements.
    const   r   =   solve ( N , 0 , A , S ) ;

    // Output the result: '0' if the condition is true, '1' if false.
    console . log ( r   ?   '0'   :   '1' ) ;
  }
} // End of function `main`.


// This is the primary execution point of the script.
// It reads the entire content of standard input synchronously.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
// The script concludes after processing all test cases.