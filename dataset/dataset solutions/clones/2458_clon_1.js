/*
 * This is a JavaScript program designed to solve a specific problem.
 * It processes an input string, analyzes character patterns,
 * and calculates a final numerical result based on certain conditions.
 * The Main function orchestrates the primary logic.
 */

function   Main ( input )
{
  // Split the input string by newline characters to get an array of lines.
  input   =   input . split ( "\n" ) ;

  // Take the first line of input and split it into individual characters.
  var   S   =   input [ 0 ] . split ( "" ) ;

  // Calculate N, which is one more than the length of the character array S.
  var   N   =   S . length + 1 ;

  // Initialize a variable 'min' to zero. Its purpose might become clear later.
  var   min   =   0 ;

  // Initialize 'ans' (answer) to zero. This will accumulate the final result.
  var   ans   =   0 ;

  // Create a new array 'L' of size N. This array will store intermediate results.
  var   L   =   new   Array ( N ) ;

  // First loop: Iterate through the character array S to populate 'L'.
  // This loop identifies specific patterns (like "<" at start, "><", or ">" at end).
  for ( var   i   =   0 ;   i   <   N - 1 ;   i ++ )
  {
    // Check for the pattern "<" at the very beginning of the string.
    if (   i   ==   0   &&   S [ i ]   ==   "<"   )
    {
      L [ i ]   =   0 ; // Mark this position in L.
    }
    // Check for the pattern "><" in the middle of the string.
    else   if (   S [ i ]   ==   ">"   &&   S [ i + 1 ]   ==   "<"   )
    {
      L [ i + 1 ]   =   0 ; // Mark the position after '>' and before '<'.
    }
    // Check for the pattern ">" at the very end of the string.
    else   if (   i   ==   N - 2   &&   S [ i ]   ==   ">"   )
    {
      L [ i + 1 ]   =   0 ; // Mark the position after the last '>'.
    }
  }


  // Initialize two helper counters 'h' and 'h2' to zero.
  var   h   =   0 ;
  var   h2   =   0 ;

  // Create two more arrays, Lf (left-forward) and Lb (left-backward),
  // both of size N and initialized with zeros.
  var   Lf   =   new   Array ( N ) . fill ( 0 ) ;
  var   Lb   =   new   Array ( N ) . fill ( 0 ) ;

  // Second main loop: Process the string to fill Lf and Lb arrays.
  // This loop iterates from both ends conceptually to calculate counts.
  for ( var   i   =   0 ;   i   <   N - 1 ;   i ++ )
  {
    // If L[i] is zero, reset the forward counter 'h'.
    if (   L [ i ]   ==   0   )
    {
      h   =   0 ;
    }

    // If the current character is '<', increment 'h' and store it in Lf.
    if (   S [ i ]   ==   "<"   )
    {
      h ++ ;
      Lf [ i + 1 ]   =   h ;
    }
    // Otherwise, reset 'h' and store it (which is 0) in Lf.
    else
    {
      h   =   0 ;
      Lf [ i + 1 ]   =   h ;
    }

    // If L[N-1-i] is zero, reset the backward counter 'h2'.
    if (   L [ N - 1 - i ]   ==   0   )
    {
      h2   =   0 ;
    }

    // If the character from the reverse scan is '>', increment 'h2' and store it in Lb.
    if (   S [ N - 2 - i ]   ==   ">"   )
    {
      h2 ++ ;
      Lb [ N - 2 - i ]   =   h2 ;
    }
    // Otherwise, reset 'h2' and store it (which is 0) in Lb.
    else
    {
      h2   =   0 ;
      Lb [ N - 2 - i ]   =   h2 ;
    }
  }


  // Reset 'ans' to zero before the final calculation.
  // Note: 'ans' was initialized earlier, but this effectively clears it for accumulation.
  ans   =   0 ;

  // Final loop: Iterate through N positions to compute the final answer.
  for ( var   i   =   0 ;   i   <   N ;   i ++ )
  {
    // If L[i] is not zero, it means this position contributes to the answer.
    if (   L [ i ]   !=   0   )
    {
      // Add the maximum of Lf[i] and Lb[i] to the total answer.
      ans   +=   Math . max ( Lf [ i ] , Lb [ i ] ) ;
    }
  }


  // Output the final calculated answer to the console.
  console . log ( '%s' ,   ans ) ;

  // Return the calculated answer.
  return   ans ;
}



/*
 * The 'debug' function is a utility for testing the 'Main' function
 * within a browser environment (assuming specific HTML elements exist).
 * It retrieves input from a text area, runs the main logic,
 * and displays whether the result is 'AC' (Accepted) or 'WA' (Wrong Answer).
 */
function   debug ( n )
{
  // Get input value from an HTML element identified by "input" + n.
  var   input   =   document . get ElementById ( "input" + n ) . value ;

  // Call the Main function with the retrieved input.
  var   ans   =   Main ( input ) ;

  // Initialize the result status to "WA" (Wrong Answer).
  var   result   =   "WA" ;

  // Compare the calculated answer with the expected output from another HTML element.
  if (   ans   ==   document . getElementById ( "output" + n ) . value . split ( "\n" ) [ 0 ]   )
  {
    // If they match, set the result status to "AC" (Accepted).
    result   =   "AC" ;
  }

  // Display the result status in an HTML element identified by "result" + n.
  document . get ElementById ( "result" + n ) . innerHTML   =   result ;
}

// --- Entry point for the program when executed in a Node.js environment ---
// Read input from standard input (/dev/stdin) using Node's 'fs' module.
// The 'utf8' encoding is specified for the input.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;
// --- End of script ---