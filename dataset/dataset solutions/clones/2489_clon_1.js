/* This is a Type I clone of an original JavaScript program.
 * All identifiers, operators, and literals are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical clone.
 */
function     Main  (  input  )
{
  // The primary function to process the given input string.
  input   =   input .   split  (  "\n"  )   ;   // Split the input string by newline characters.

  /*
   * Further processing of the input array.
   * Each line is now an element in the array.
   */
  input   =   input .   map  (  e  =>  e .   split  (  " "  )   )   ;

  // Convert all string elements within the nested arrays to integers.
  // The radix 10 is explicitly specified for parseInt.
  input   =   input .   map  (  e  =>  e .   map  (  f  =>  parseInt  (  f  ,  10  )   )   )   ;


  var   result   =   input  [  1  ]   .   reduce  (  (  pre  ,  cur  ,  idx  ,  src  )   =>
  {
        // This accumulator function processes the second line of the input.
        // 'src' refers to the full array being reduced (input[1]).
        var   array   =   src .   slice  (  idx  ,  src .   length  )       ;

        /*
         * Calculate a sub-result based on the 'array'.
         * It multiplies the first element of 'array' by subsequent elements.
         */
        var   re   =   array .   slice  (  1  ,  array .   length  )   .   reduce  (  (  prev  ,  curr  )   =>
        {
            // Accumulate the product.
            return   prev   +   array  [  0  ]   *   curr   ;
        }  ,  0  )   ; // Initial value for the inner reduce is 0.

        // Add the calculated 're' to the previous accumulated value 'pre'.
        return   pre   +   re   ;
  }  ,  0  )    ; // Initial value for the outer reduce is 0.


  // Output the final calculated result to the console.
  console .   log  (  result  )   ;
}

// Invoke the Main function with input read from stdin.
// This uses Node.js 'fs' module to read the file.
Main  (  require  (  "fs"  )   .   readFileSync  (  "/dev/stdin"  ,  "utf8"  )   )   ;