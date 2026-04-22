var    input = require('fs') . readFileSync( '/dev/stdin' ,  'utf8' ) . trim() ; // Read input from standard input and remove leading/trailing whitespace

// Split the input into an array of lines
var lines = input.split( '\n' ) ;


var line ; /* Declare a variable to hold each line read from the input */
while ( line = lines.shift() )
{ // Loop through each line of input until no more lines are available
    var arr  =  line . split( ' ' ) ; /* Split the current line by space to get individual values */
    var a    =    +arr[0] ; // Convert the first element to a number
    var b    =    +arr[1] ;  /* Convert the second element to a number */
    var n    =    +arr[2] ; // Convert the third element to a number

    /* Calculate the division, fix to n+1 decimal places, and store as a string */
    var str  =  ( a / b ) . toFixed( n + 1 ) ;
    var idx  =  str . indexOf( '.' ) ; // Find the index of the decimal point
    str      =  str . substring( idx + 1 , str . length - 1 ) ; /* Extract the fractional part, excluding the last digit */
    s        =  str . split( '' ) . reduce( function( p , n )
    {
        /* Sum the digits of the extracted fractional part */
        return ( +p ) + ( +n ) ;
    } ) ;

    console . log( s ) ; // Print the calculated sum of digits to the console
}