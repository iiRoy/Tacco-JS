/*
 * This JavaScript file processes input from standard input
 * to solve a system of linear equations.
 * It's a Type I clone, meaning only whitespace and comments
 * are altered from the original source.
 */

//  Import the 'fs' module for file system operations.
var input = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) ;

//  Read the entire input, then split it into an array of lines.
var lines  =  input . split ( '\n' ) ;

//  Declare a variable to hold each line as we process it.
var line ;

//  Loop through each line of input until no more lines are available.
while  (  line  =  lines . shift ( )  )
{
    //  Split the current line by spaces and convert each part to a number.
    var  vals  =  line . split ( ' ' ) . map ( function ( n ) {  return  +n ;  } ) ;

    //  Assign the numerical values from the line to respective variables.
    var a  =  vals [ 0 ] ; // Coefficient for x in the first equation
    var b  =  vals [ 1 ] ; // Coefficient for y in the first equation
    var c  =  vals [ 2 ] ; // Constant term in the first equation
    var d  =  vals [ 3 ] ; // Coefficient for x in the second equation
    var e  =  vals [ 4 ] ; // Coefficient for y in the second equation
    var f  =  vals [ 5 ] ; // Constant term in the second equation

    /*
     *  Begin calculations to solve the system of linear equations.
     *  The method used here is a form of elimination.
     */
    var  m1  =  - ( b  /  e ) ; // Calculate a multiplier to eliminate 'y' later

    d  =  d  *  m1 ; // Apply multiplier to 'd'
    e  =  e  *  m1 ; // Apply multiplier to 'e'
    f  =  f  *  m1 ; // Apply multiplier to 'f'

    var  m2  =  a  +  d ; // Sum of 'a' and modified 'd'

    // Calculate 'x' using the modified coefficients
    var  x  =  ( c  +  f )  /  m2 ;

    // Calculate 'y' using the calculated 'x' and original coefficients
    var  y  =  ( -a  *  x  +  c )  /  b ;

    /*
     *  Format the calculated 'x' and 'y' values to a specific
     *  string representation, effectively showing three decimal places.
     */
    var  xStr  =  Math . round ( x  *  1000 )  +  '' ; // Round x to 3 decimal places and convert to string
    xStr  =  xStr . replace ( /(\d{3})$/ ,  '.$1' ) ; // Insert decimal point before last three digits

    var  yStr  =  Math . round ( y  *  1000 )  +  '' ; // Round y to 3 decimal places and convert to string
    yStr  =  yStr . replace ( /(\d{3})$/ ,  '.$1' ) ; // Insert decimal point before last three digits

    // Output the formatted 'x' and 'y' values, separated by a space.
    console . log ( xStr  +  ' '  +  yStr ) ;
}