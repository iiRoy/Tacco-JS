/*
 * This JavaScript program processes numerical input from standard input.
 * It's designed to read two numbers, compute their average, and then
 * display the ceiling of that average.
 */

//  The 'inp' variable will hold the entire content read from '/dev/stdin'.
//  It reads the file as UTF-8 and then splits it into an array of lines.
inp     =       require('fs') . readFileSync ( '/dev/stdin' ,   'utf8'   ) . split ( '\n' ) ;


//  'l' is assigned the first line of the input array, after removing it
//  from 'inp' using shift(). This line is then split by spaces.
l       =       inp . shift() . split ( ' ' )   ;


//  The first element of the 'l' array is taken, and its value is
//  explicitly converted to a number by multiplying it with 1.
//  This numeric value is stored in variable 'a'.
a       =       l [ 0 ]     *     1     ;


//  Similarly, the second element of the 'l' array is converted to a number
//  and stored in variable 'b'.
b       =       l [ 1 ]     *     1     ;


//  Finally, the program calculates the sum of 'a' and 'b', divides it by 2
//  to get the average, and then uses Math.ceil() to round this average
//  up to the nearest whole number. This result is then printed to the console.
console . log ( Math . ceil ( ( a   +   b )   /   2 ) ) ;

/*
 * End of the script.
 * Thank you for your attention.
 */