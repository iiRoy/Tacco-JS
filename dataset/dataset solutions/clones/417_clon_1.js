/*
 * This JavaScript code defines a search function and then uses it
 * within a main loop to process multiple sets of input data.
 * It's designed to solve a problem likely involving binary search
 * on a range of possible values.
 */

// The 'seach' function attempts to find a specific configuration
// based on an input value 'x' and a globally defined array 'ary',
// along with a global integer 'm'.
// It returns a boolean indicating whether a valid configuration was found.
function  seach  (  x  )
{
  // Initialize a boolean flag, a counter, and a sum.
  // These variables are used to track conditions within the loop.
  var   flag   =   true   ;
  var   cnt    =   0      ;
  var   sum    =   0      ;

  // Iterate through each element of the 'ary' array.
  for  (  var   i  =  0  ;  i  <  ary . length  ;  i++  )
  {
    // Condition 1: If 'x' is less than the current array element,
    // it means a required condition is not met.
    if  (  x  <  ary [ i ]  )
    {
      flag   =   false   ;  // Set flag to false.
      break              ;  // Exit the loop immediately.
    }
    // Condition 2: If the sum of 'sum' and the current array element equals 'x'.
    else  if  (  sum  +  ary [ i ]  ==  x  )
    {
      sum   =   0   ;  // Reset 'sum' to zero.
      // If it's not the last element, increment the counter.
      if  (  i  !=  ary . length  -  1  )  cnt++   ;
    }
    // Condition 3: If the sum of 'sum' and the current array element is greater than 'x'.
    else  if  (  sum  +  ary [ i ]  >  x  )
    {
      sum   =   ary [ i ]   ;  // Reset 'sum' to the current array element.
      cnt++                 ;  // Increment the counter.
    }
    // Condition 4: If the sum of 'sum' and the current array element is less than 'x'.
    else  if  (  sum  +  ary [ i ]  <  x  )
    {
      sum   +=   ary [ i ]   ;  // Add the current array element to 'sum'.
    }

    // After evaluating the element, check if the counter 'cnt' has reached 'm'.
    if  (  cnt  ==  m  )
    {
      flag   =   false   ;  // If it has, set flag to false.
      break              ;  // Exit the loop.
    }
  }

  // Return the final state of the flag.
  return   flag   ;
}


// Read input from the standard input stream.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

// Process the input: trim any leading/trailing whitespace and split into an array of lines.
var   arr     =   input . trim ( ) . split ( "\n" ) ;

// Start a loop to process multiple test cases until a specific termination condition is met.
while  (  true  )
{
  // Extract the first line from the array, which contains 'm' and 'n'.
  var   mn   =   arr . shift ( ) ;

  // Check if the termination string "0 0" is encountered.
  if  (  mn  ==  "0 0"  )
    break   ;  // If so, exit the main loop.

  // Parse 'm' and 'n' from the extracted line.
  // Split by space and convert the parts to numbers.
  mn   =   mn . split ( " " ) . map ( Number ) ;

  // Assign the parsed values to global variables 'm' and 'n'.
  var   m    =   mn [ 0 ]   ;
  var   n    =   mn [ 1 ]   ;

  // Initialize an empty array 'ary' for the current test case.
  var   ary  =  [ ]   ;

  // Populate 'ary' with 'n' elements from the input array 'arr'.
  // The '- 0' ensures numerical conversion.
  while  (  n--  )
    ary . push ( arr . shift ( )  -  0 ) ;

  // Initialize variables for binary search: lower bound 'L' and upper bound 'R'.
  var   L  =  0           ;
  var   R  =  1500000     ; // A sufficiently large upper bound for the problem context.

  // Start the binary search loop.
  while  (  true  )
  {
    // Calculate the middle point of the current search range.
    var   middle   =   Math . floor ( ( L  +  R )  /  2 ) ;

    // Call the 'seach' function with the 'middle' value.
    var   flag     =   seach ( middle ) ;

    // Adjust the search range based on the 'flag' returned by 'seach'.
    if  (  flag  )
    {
      R   =   middle  -  1   ;  // If true, the solution might be smaller or equal to 'middle'.
    }
    else
    {
      L   =   middle  +  1   ;  // If false, the solution must be greater than 'middle'.
    }

    // Check if the binary search has converged (L > R).
    if  (  L  >  R  )
    {
      // Output the result:
      // If 'flag' is true (meaning 'middle' was a valid solution),
      // the answer is R+1 (the smallest value that failed, so R+1 is the first success).
      // Otherwise, the answer is L (the smallest value that succeeded).
      if  (  flag  )
        console . log ( R  +  1 ) ;
      else
        console . log ( L ) ;

      break   ;  // Exit the binary search loop.
    }
  }
}