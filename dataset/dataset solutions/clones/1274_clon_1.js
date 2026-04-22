/*
 * This script processes input from standard input.
 * It reads the entire content, splits it into lines,
 * takes the second line, splits it by spaces,
 * reverses the resulting array, and prints it back
 * to standard output, joined by spaces.
 */


const   chunk   =   require('fs') . readFileSync (   '/dev/stdin' ,   'utf8'   )   ;


//  The 'chunk' variable now holds the raw input string.
var     lines   =   chunk . split (   '\n'   )   ;


/*
 *  From the 'lines' array, we are interested in the
 *  element at index 1 (the second line).
 *  This line is then split by space characters.
 */
var     a       =   lines[ 1 ] . split (   ' '   )   ;


//  Finally, we reverse the array 'a' and join its elements
//  back into a single string, separated by spaces.
//  This result is then printed to the console.
console . log (   a . reverse (   ) . join (   ' '   )   )   ;