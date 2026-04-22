/*
 * This is an extensively modified version
 * of the original JavaScript code.
 * All core logic and identifiers remain unchanged,
 * adhering strictly to Type I clone definition.
 */
// The primary function to process the input data.
function  Main (  input  )
{
  // Input string is split into an array of lines.
  input   =   input . split (   "\n"   )   ;
  // The first line is then split by spaces to get individual values.
  tmp   =   input [ 0 ] . split (   " "   )   ;


  // Variable declarations and parsing of numerical values.
  // parseInt is crucial for converting string segments to integers (base 10).
  var   N   =   parseInt (   tmp [ 0 ] ,   10   )   ;
  var   A   =   parseInt (   tmp [ 1 ] ,   10   )   ;
  var   B   =   parseInt (   tmp [ 2 ] ,   10   )   ;

  // Calculate the product of A and N.
  var   CalcA   =   A   *   N   ;

  // Determine which value to output based on a comparison.
  if   (   CalcA   >=   B   )
  {
    // If CalcA is greater than or equal to B, print CalcA.
    console . log (   '%d' ,   CalcA   )   ;
  }
  else
  {
    // Otherwise, print B.
    console . log (   '%d' ,   B   )   ;
  }

  // Original code had commented-out output example, removed here.
} // End of the Main function.

// This statement reads from standard input and passes it to the Main function.
Main (   require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" )   )   ;