/*
 * This function processes an incoming string,
 * converts its characters to numbers, and calculates their sum.
 */
function ComputeOverallSum(  initialData )
{
  initialData = initialData .split("") .map( Number ) ; // Convert each character to a numerical value
  var runningTotal = 0 ; // Initialize accumulator for the sum
  initialData.forEach ( function ( currentDigit ) {
    runningTotal += currentDigit ; // Add current digit to the running total
  } ) ;
  console .log( runningTotal ) ; // Display the final aggregated value
}
// Invoke the primary processing routine with data from standard input
ComputeOverallSum( require( "fs" ) .readFileSync( "/dev/stdin" , "utf8" ) .trim() ) ;