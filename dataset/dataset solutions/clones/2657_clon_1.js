/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains exact structural and logical equivalence.
 * Only whitespace and comments have been altered significantly
 * to provide a visually distinct representation.
 */
'use strict'
; // Ensure strict mode for robust code execution

/*
 * The main function processes input from stdin.
 * It expects multiple lines, each containing two space-separated integers.
 */
function     main   (  input  )

{

  // Split the entire input string by newline characters
  const lines   =    input   .  split  (  '\n'  )
  ;

  // Remove the last element, which is usually an empty string
  // due to the trailing newline at the end of input.
  lines .   pop( )
  ;


  // Iterate over each processed line of the input
  lines . forEach  (    line    =>
  {
    /*
     * For each line, parse the two space-separated integers.
     * s[0] will be k, s[1] will be x.
     */
    const s   =   line   .   split   (   ' '   )
    ,

          k   =   parseInt   (   s [  0  ]   ,   10   )
    ,

          x   =   parseInt   (   s [  1  ]   ,   10   )
    ;

    // Call function 'f' with the parsed values
    f  (  k  ,  x  )
    ;

  }  )
  ;

} // End of the main function


/*
 * Function 'f' calculates a range based on k and x,
 * then prints all integers within that derived range.
 *
 * @param {number} k - The first integer input.
 * @param {number} x - The second integer input.
 */
function     f    (  k  ,  x  )
{

  // Calculate the radius for the range
  const r   =   k   -   1
  ;

  // Define the absolute minimum and maximum boundaries for the output range
  const min   =   -1000000
  ,
        max   =   1000000
  ;

  // Calculate the initial lower and upper bounds based on x and r
  let oMin   =   x   -   r
  ,
      oMax   =   x   +   r
  ;

  // Adjust the lower bound if it falls below the absolute minimum
  if (   oMin   <   min   )
  {
    oMin   =   min
    ;
  }

  // Adjust the upper bound if it exceeds the absolute maximum
  if (   oMax   >   max   )
  {
    oMax   =   max
    ;
  }

  /*
   * Loop through all integers from the adjusted lower bound (oMin)
   * to the adjusted upper bound (oMax), inclusive.
   */
  for  (   let   i   =   oMin   ;   i   <=   oMax   ;   i ++   )
  {
    // Print each integer to the console
    console   .   log   (   i   )
    ;
  }

} // End of function f


/*
 * This is the entry point of the script.
 * It reads the entire content of stdin synchronously,
 * then passes it to the main function.
 */
main  (
  require  (  'fs'  )
    .  readFileSync  (  '/dev/stdin'  ,  'utf8'  )
)
; // Script execution starts here