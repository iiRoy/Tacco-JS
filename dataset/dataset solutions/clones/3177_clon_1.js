/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions
 *   remain completely unchanged.
 * - Only whitespace (indentation, spacing, blank lines) and comments
 *   (added, removed, or modified) have been altered.
 * The goal is to make the code visually different
 * while preserving its exact logical and structural identity.
 */


"use strict" /* Ensure strict mode for code execution */ ;

// The primary function to handle the input and logic
function Main(  input  ) {

  // Process the input string: split by whitespace and parse each part as an integer.
  input = input . split  (  /\s+/  ) ;

  // Convert all input elements to base-10 integers
  for (  let i  =  0  ;  i  <  input . length  ;  i ++  )
  {
    input [  i  ]  =  parseInt  (  input [  i  ]  ,  10  ) ;
  }


  // Extract initial parameters from the processed input array
  var   A   =   input . shift ( ) ; // Number of elements for array 's'
  var   B   =   input . shift ( ) ; // Number of elements for array 't'
  var   Q   =   input . shift ( ) ; // Number of queries


  // Populate arrays 's' and 't' using splice, then assign remaining input to 'x'
  var   s   =   input . splice  (  0  ,  A  ) ;
  var   t   =   input . splice  (  0  ,  B  ) ;
  var   x   =   input ; // Remaining input elements, which are the queries


  // Sort the query array 'x' while preserving original indices
  var   y   =   binarySort  (  x  ) ;


  // Initialize arrays to store values before and after each query point
  var   s_before   =   [ ] ;
  var   s_after    =   [ ] ;
  var   t_before   =   [ ] ;
  var   t_after    =   [ ] ;


  // Pointers for iterating through sorted arrays 's' and 't'
  var   p   =   0  ,   q   =   0  ;


  // For each query, find the elements in 's' and 't' immediately before and after it
  for  (  let i  =  0  ;  i  <  Q  ;  i ++  )
  {
    // Find the position in 's' relative to the current query value y[i][0]
    while  (  s [  p  ]  <  y [  i  ] [  0  ]  )
    {
      p ++ ;
    }

    // Store the element before and after the query in 's', with sentinels for bounds
    s_before [  i  ]  =  (  s [  p - 1  ]  ||  -1e14  ) ; // -1e14 as a very small number
    s_after  [  i  ]  =  (  s [  p  ]  ||  1e14   ) ; // 1e14 as a very large number


    // Find the position in 't' relative to the current query value y[i][0]
    while  (  t [  q  ]  <  y [  i  ] [  0  ]  )
    {
      q ++ ;
    }

    // Store the element before and after the query in 't', with sentinels for bounds
    t_before [  i  ]  =  (  t [  q - 1  ]  ||  -1e15  ) ; // -1e15 as a very small number
    t_after  [  i  ]  =  (  t [  q  ]  ||  1e15   ) ; // 1e15 as a very large number
  }


  /*
   * // Original commented-out console log.
   * // console.log(s_before,s_after);
   */


  // Array to store the final answers for each query
  var   ans   =   [ ] ;


  // Calculate the minimum distance for each query
  for  (  let i  =  0  ;  i  <  Q  ;  i ++  )
  {
    // Retrieve original index and query value
    let   j   =   y [  i  ] [  1  ] ; // Original index of the query
    let   Y   =   y [  i  ] [  0  ] ; // The query value itself


    // Retrieve the before/after values for 's' and 't' for the current query
    let   sb   =   s_before [  i  ]  ,
          sa   =   s_after  [  i  ]  ,
          tb   =   t_before [  i  ]  ,
          ta   =   t_after  [  i  ]  ;


    /*
     * This commented-out block represents an alternative or prior logic
     * for calculating distances, which is not currently active.
     *
     * if (sb <= tb && ta <= sa) {
     *   ans[j] = Math.min(sa - Y, Y - sb);
     * } else if (tb <= sb && sa <= ta) {
     *   ans[j] = Math.min(ta - Y, Y - tb);
     * } else if (tb <= sb && ta <= sa) {
     *   ans[j] = Math.min(sa - Y, Y - tb, 2 * ta - Y - sb, Y + ta - 2 * sb);
     * } else if (sb <= tb && sa <= ta) {
     *   ans[j] = Math.min(ta - Y, Y - sb, 2 * sa - Y - tb, Y + sa - 2 * tb);
     * }
     */


    // Alias Math.abs for brevity in calculations
    let   abs   =   Math . abs ;


    // Calculate the minimum distance using all 8 possible combinations of paths
    // The result is converted to a string.
    ans [  j  ]  =  Math . min  (
      abs (  sa - Y  )  +  abs (  ta - sa  )  , // Y -> sa -> ta
      abs (  sa - Y  )  +  abs (  tb - sa  )  , // Y -> sa -> tb
      abs (  sb - Y  )  +  abs (  ta - sb  )  , // Y -> sb -> ta
      abs (  sb - Y  )  +  abs (  tb - sb  )  , // Y -> sb -> tb
      abs (  ta - Y  )  +  abs (  sa - ta  )  , // Y -> ta -> sa
      abs (  ta - Y  )  +  abs (  sb - ta  )  , // Y -> ta -> sb
      abs (  tb - Y  )  +  abs (  sa - tb  )  , // Y -> tb -> sa
      abs (  tb - Y  )  +  abs (  sb - tb  )    // Y -> tb -> sb
    ) . toString (  10  ) ;
  }


  // Output the results, joined by newlines, trimmed, and with a final newline
  console . log (  ans . join  (  "\n"  ) . trim ( )  +  '\n'  ) ;
} // End of Main function


/*
 * Helper function: binarySort
 * Sorts an array A while preserving original indices.
 * It creates a new array B where each element is [value, original_index].
 * This is effectively an insertion sort using binary search for insertion point.
 */
function   binarySort  (  A  )  {

  var   a   =   A . length ; // Store the length of the input array
  var   B   =   [  [  A [  0  ]  ,  0  ]  ] ; // Initialize B with the first element and its index


  // Iterate through the remaining elements of A
  for  (  let i  =  1  ;  i  <  a  ;  i ++  )  {

    let   u   =   B . length - 1 ; // Upper bound for binary search
    let   d   =   0 ;              // Lower bound for binary search
    let   m   =   Math . floor  (  (  d  +  u  )  /  2  ) ; // Middle index


    // Perform binary search to find the insertion point
    while  (  ! (  d  >  u  )  )  {

      if  (  B [  m  ] [  0  ]  <  A [  i  ]  )  {
        d   =   m  +  1 ;
      }  else  {
        u   =   m  -  1 ;
      }

      m   =   Math . floor  (  (  d  +  u  )  /  2  ) ;
    }


    // Insert the current element and its original index into B at the found position
    B . splice  (  m  +  1  ,  0  ,  [  A [  i  ]  ,  i  ]  ) ;
  }


  return   B ; // Return the sorted array with original indices
} // End of binarySort function


/*
 * Main program execution:
 * Reads input from stdin, processes it, and passes it to the Main function.
 */
Main  (
  require  (  'fs'  ) . readFileSync  (  "/dev/stdin"  ,  "utf8"  )
) ;