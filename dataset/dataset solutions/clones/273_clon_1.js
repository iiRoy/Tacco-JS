/*
 * This JavaScript file processes dates to determine
 * the corresponding Japanese era (Meiji, Taisho, Showa, Heisei)
 * or mark them as "pre-meiji" if too old.
 */

// Helper function 'G' to convert a given date (year, month, day)
// into its Unix timestamp (milliseconds since epoch).
function G ( y , m , d )
{
  // Create a new Date object using the provided components.
  // Note: Months in JavaScript Date constructor are 0-indexed,
  // but the input format m+"/"+d+"/"+y expects 1-indexed months.
  // The original code uses this string format, so it's preserved.
  var date = new Date( m + "/" + d + "/" + y ) ;

  // Return the numerical value of the specified date as milliseconds.
  return date.getTime() ;
}


// Read the entire input from standard input (/dev/stdin)
// as a UTF-8 string.
var input = require( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim leading/trailing whitespace from the input,
// then split it into an array of strings based on newline characters.
var Arr = ( input . trim() ) . split ( "\n" ) ;


// Iterate over each line (value 'v') in the processed input array 'Arr'.
Arr . forEach ( function ( v )
{
  // Inside the loop, 'v' is a string representing a line of input.
  // Split the line by spaces, then convert each part to a Number.
  var arr = v . split ( " " ) . map ( Number ) ;

  // Assign the numerical values from the 'arr' array to
  // year, month, and day variables.
  var y = arr[0] ; // Year component
  var m = arr[1] ; // Month component
  var d = arr[2] ; // Day component

  // Calculate the timestamp for the current input date.
  var time = G ( y , m , d ) ;

  // Initialize an empty string variable to store the era information.
  var str = "" ;

  // Check if the date falls before the Meiji era's start.
  // Meiji era officially began on 1868-09-08.
  if ( time < G ( 1868 , 9 , 8 ) )
  {
    str = "pre-meiji" ; // Assign "pre-meiji" if the date is too old.
  }

  // Check for Meiji era.
  // If the date is on or after 1868-09-08.
  if ( time >= G ( 1868 , 9 , 8 ) )
  {
    // Calculate the year in Meiji era (y - 1868 + 1).
    str = "meiji " + ( y - 1868 + 1 ) + " " + m + " " + d ;
  }

  // Check for Taisho era.
  // If the date is on or after 1912-07-30.
  if ( time >= G ( 1912 , 7 , 30 ) )
  {
    // Calculate the year in Taisho era (y - 1912 + 1).
    str = "taisho " + ( y - 1912 + 1 ) + " " + m + " " + d ;
  }

  // Check for Showa era.
  // If the date is on or after 1926-12-25.
  if ( time >= G ( 1926 , 12 , 25 ) )
  {
    // Calculate the year in Showa era (y - 1926 + 1).
    str = "showa " + ( y - 1926 + 1 ) + " " + m + " " + d ;
  }

  // Check for Heisei era.
  // If the date is on or after 1989-01-08.
  if ( time >= G ( 1989 , 1 , 8 ) )
  {
    // Calculate the year in Heisei era (y - 1989 + 1).
    str = "heisei " + ( y - 1989 + 1 ) + " " + m + " " + d ;
  }

  // Output the determined era string to the console.
  console . log ( str ) ;
} ) ; // End of forEach loop.