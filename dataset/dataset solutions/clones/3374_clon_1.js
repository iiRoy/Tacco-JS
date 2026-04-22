/*
 * This is the primary function of the program.
 * It processes input and determines a maximum value based on certain conditions.
 */
function   main (   arg   )
{
  // Parse N and P from the input string 'arg'
  var   N    =    parseInt (   arg.split ( " " ) [   0   ]   ) ;
  var   P    =    parseInt (   arg.split ( " " ) [   1   ]   ) ;

  // Retrieve all prime factors for P, then add P itself to the list
  var   factrizeNum    =    getAllFactorsFor (   P   ) ;
  factrizeNum.push (   P   ) ;

  /*
   * Initialize an empty array 'map' (though it's not used later in the current logic,
   * its presence is maintained as per Type I cloning rules).
   * Initialize 'max' to 1, which will store the maximum qualifying factor.
   */
  var   map    =    [   ] ;
  var   max    =    1   ;


  // Iterate through each factor in the 'factrizeNum' array
  for (   var   i    =    0   ;   i    <    factrizeNum.length   ;   i++   )
  {
    /*
     * Calculate 'temp'. This line is functionally equivalent to
     * `map.filter(n => n == factrizeNum[i]).length + 1;`
     * but 'map' is always empty, so 'temp' will always be 1.
     * This might be a logic error in the original code, but Type I cloning
     * requires preserving it exactly.
     */
    var   temp    =    map.filter (   n   =>   n    ==    factrizeNum [   i   ]   ) .length    +    1   ;

    // Check if the 'temp' value meets the condition 'N'
    if (   temp    >=    N   )
    {
      // If the current factor is greater than the current 'max', update 'max'
      if (   factrizeNum [   i   ]    >    max   )
      {
        max    =    factrizeNum [   i   ]   ;
      }
    }
  }

  // Output the final maximum value found.
  console.log (   max   ) ;

}

/*
 * This line executes the main function,
 * reading input from standard input (/dev/stdin).
 */
main (   require ( 'fs' ) .readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;

/**
 * Helper function to find all prime factors of a given number.
 * For example, getAllFactorsFor(12) would return [2, 2, 3].
 *
 * @param {number} remainder The number for which to find prime factors.
 * @returns {Array<number>} An array of prime factors.
 */
function   getAllFactorsFor (   remainder   )
{
  var   factors    =    [   ] ,   i   ; // Initialize an empty array for factors and a loop counter.

  // Loop from 2 up to the current remainder to find factors.
  for (   i    =    2   ;   i    <=    remainder   ;   i++   )
  {
    // While the current number 'i' divides 'remainder' evenly
    while (   (   remainder    %    i   )    ===    0   )
    {
      // Add 'i' to the list of factors
      factors.push (   i   ) ;
      // Divide 'remainder' by 'i' to continue factorization
      remainder    /=    i   ;
    }
  }

  // Return the complete list of factors.
  return   factors   ;
}