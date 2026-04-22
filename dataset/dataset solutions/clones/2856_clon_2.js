/*
 * This module is designed to process a string of space-separated numerical values.
 * It parses them and outputs the sum of the first two.
 */
function     PerformCalculation    (    initialString    )
{
  // The raw string is split into individual tokens and then converted into numerical data.
  const   numericElements   =   initialString
    .split ( ' ' )
    .map (  (   token   )  =>  Number ( token )  ) ;

  /*
   * Original implementation notes:
   * A previous version might have assigned each parsed number to distinct variables,
   * e.g.,
   * valA = Number(numericElements[0]);
   * valB = Number(numericElements[1]);
   * valC = Number(numericElements[2]);
   * However, the current logic directly uses array elements.
   */

  // Display the aggregated value of the first two numerical components.
  console
    .log (   numericElements[0]    +   numericElements[1]   ) ;
}

// Invoke the primary processing function with data sourced from standard input.
PerformCalculation (
  require ( "fs" )
    .readFileSync ( "/dev/stdin" , "utf-8" )
) ;