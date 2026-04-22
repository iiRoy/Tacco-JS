/*
 * This JavaScript code defines a function to check for leap years
 * and then processes a range of years provided via standard input.
 * It's designed to read input line by line, where each line contains
 * two space-separated integers representing a year range [a, b].
 * The process continues until a line "0 0" is encountered.
 */

// Function: check
// Determines if a given year 'x' is a leap year.
// A leap year occurs every 4 years, except for years divisible by 100
// but not by 400.
function   check  (  x  ) {
  // Rule 1: If the year is not divisible by 4, it's not a leap year.
  if  (  x  %  4  !=  0  ) return  false;

  // Rule 2: If the year is divisible by 400, it is a leap year.
  if  (  x  %  400  ==  0  ) return  true;

  // Rule 3: If the year is divisible by 100 but not by 400 (covered by previous rule),
  // it's not a leap year.
  if  (  x  %  100  ==  0  ) return  false;

  // If none of the above conditions are met, it means the year is divisible by 4,
  // but not by 100 (or it would have been caught by the previous rule),
  // and not by 400 (or it would have been caught by the second rule).
  // Thus, it is a leap year.
  return  true;
}


// Main execution block.
// Reads input, processes year ranges, and outputs leap years.
var   input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var   Arr   =   (  input . trim ( )  ) . split ( "\n" ) ;

// Loop through each line (year range) in the input array.
for  (  var   i  =  0  ;  i  <  Arr . length  ;  i  ++  ) {

  // Check for the termination condition: "0 0".
  if  (  Arr [  i  ]  ==  "0 0"  ) break;

  // Add an empty line as a separator between outputs of different ranges,
  // except for the very first range.
  if  (  i  !=  0  ) console . log ( "" ) ;

  // Parse the start year 'a' from the current input line.
  var   a   =   (  Arr [  i  ] . split ( " " )  ) [  0  ]  -  0  ;

  // Parse the end year 'b' from the current input line.
  var   b   =   (  Arr [  i  ] . split ( " " )  ) [  1  ]  -  0  ;

  // Initialize an empty array to store leap years found within the current range.
  var   arr   =   [  ]  ;

  // Iterate from the start year 'a' to the end year 'b' (inclusive).
  for  (  var   j  =  a  ;  j  <=  b  ;  j  ++  ) {
    // If the current year 'j' is a leap year, add it to our array.
    if  (  check (  j  )  ) arr . push (  j  ) ;
  }

  // If no leap years were found in the range, print "NA".
  if  (  arr . length  ==  0  ) console . log ( "NA" ) ;

  // If leap years were found, print each one on a new line.
  if  (  arr . length  !=  0  ) arr . forEach (  function (  v  ) { console . log (  v  ) ; }  ) ;
}