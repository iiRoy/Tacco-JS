/*
 * This JavaScript code is a Type I clone.
 * It is derived from an original source by extensively modifying
 * only whitespace (indentation, spacing, blank lines) and comments.
 *
 * All identifiers (variable names, function names), operators,
 * and expressions remain precisely as they were in the original.
 * This includes any original syntactic quirks or errors.
 */
(  function (  hoge  )  {
  // Declare 'fuga' to store lines of input.
  var  fuga  =  hoge . split(  '\n'  )  ;


  /*
   * Initialize loop variables:
   * 'i' for the current index.
   * 'iz' for the total number of lines to process.
   */
  for  (  var  i  =  0
         ,  iz  =  fuga . length
         ;  i  <  iz
         ;  i++
         )
  {
    // The following line splits the current line into parts.
    // Note: The declaration 'var bar[i]' is preserved exactly as in the original code.
    var  bar[  i  ]  =  fuga[  i  ] . split(  ' '  )  ;

    // Convert the first part to a numeric value.
    var  a  =  bar[  i  ][  0  ]  -  0  ;

    // Convert the second part to a numeric value.
    var  b  =  bar[  i  ][  1  ]  -  0  ;


    // Check for the termination condition: both 'a' and 'b' are zero.
    if  (  a  ===  0
          &&  b  ===  0
          )
    {
      // If the condition is met, exit the loop.
      break  ;
    }


    // Determine the order for logging based on comparison.
    if  (  a  <=  b  )
    {
      // If 'a' is less than or equal to 'b', print 'a' followed by 'b'.
      console . log(  a  +  ' '  +  b  )  ;
    }
    else
    {
      // Otherwise (if 'a' is greater than 'b'), print 'b' followed by 'a'.
      console . log(  b  +  ' '  +  a  )  ;
    }
  } // End of the primary processing loop.

  // The IIFE's body concludes here.
}  )(
  // This is the argument for the IIFE, reading input from /dev/stdin.
  require(  "fs"  )
    . readFileSync(  "/dev/stdin"
                   ,  "utf8"
                   )
)  ; // End of the Immediately Invoked Function Expression.