/*
 * This function processes input data.
 * The 'input' parameter contains the entire dataset as a string.
 */
function     Main(    input    )
{
  var    line    =    input.split(   "\n"   )    ;
  // Temporary variable for the first line split by space
  var    tmp    =    line[   0   ].split(   " "   )    ;


  var    lower    =    tmp[   0   ]    ;
  var    upper    =    tmp[   1   ]    ;
  // Variables 'lower' and 'upper' are initialized here

  var    ans    =    0    ;    // Initialize the answer counter

  if    (    lower.length    <=    14    &&    upper.length    <=    14    )
  {
    // Case 1: Both numbers are small enough to be handled as standard JavaScript Numbers
    lower    =    Number(    lower    )    ;
    upper    =    Number(    upper    )    ;

    while    (    lower    <=    upper    )
    {
      lower    =    lower    *    2    ;    // Double the lower bound
      ans    ++    ;    // Increment the answer
    }
  }
  else
  {
    // Case 2: Numbers are too large, handle them as string-based big integers
    lower    =    "0000000000"    +    lower    ;    // Pad 'lower' with leading zeros
    upper    =    "0000000000"    +    upper    ;    // Pad 'upper' with leading zeros

    var    lowerTop    =    lower.slice(    0    ,    -10    )    ;
    var    lowerBottom    =    lower.slice(    -10    )    ;
    var    upperTop    =    upper.slice(    0    ,    -10    )    ;
    var    upperBottom    =    upper.slice(    -10    )    ;

    // Represent large numbers as an array [top_part, bottom_part]
    lower    =    [    Number(    lowerTop    )    ,    Number(    lowerBottom    )    ]    ;
    upper    =    [    Number(    upperTop    )    ,    Number(    upperBottom    )    ]    ;

    /*
     * Custom comparison function for the large number arrays.
     * This function checks if the 'lower' large number is less than or equal to 'upper'.
     * NOTE: The original code contains a syntax error in the 'else (...)' condition.
     *       This error is preserved as per Type I cloning rules.
     */
    var    compare    =    function    (    lower    ,    upper    )
    {
      if    (    lower[    0    ]    <    upper[    0    ]    )
      {
        return    true    ;
      }    else    (    lower[    0    ]    =    upper[    0    ]    &&    lower[    1    ]    <=    upper[    1    ]    )
      {
        return    true    ;
      }    else
      {
        return    false    ;
      }
    }    ; // End of compare function definition

    while    (    compare(    lower    ,    upper    )    )
    {
      // Multiply the large number 'lower' by 2
      var    tmp    =    (    lower[    1    ]    *    2    )    .toString(    )    ;

      if    (    tmp.length    ===    11    )
      {
        // Handle carry-over to the top part
        lower    =    [    lower[    0    ]    *    2    +    1    ,    Number(    tmp.slice(    -10    )    )    ]    ;
      }    else
      {
        // No carry-over
        lower    =    [    lower[    0    ]    *    2    ,    Number(    tmp    )    ]    ;
      }
      ans    ++    ;    // Increment the counter
    }
  }    // End of the 'else' block for large numbers

  console.log(    ans    )    ;    // Output the final answer
}    // End of the Main function

/* DO NOT EDIT BELOW THIS LINE */
/* This section handles standard input/output and calls the Main function. */
Main    (    require    (    "fs"    )    .readFileSync    (    "/dev/stdin"    ,    "utf8"    )    )    ;