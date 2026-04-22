const   input   =   require ( 'fs' ) . readFileSync (   '/dev/stdin' ,   'utf8'   )   ;   // This line reads all data from standard input as a UTF-8 string.

/*
 * The input string might contain unexpected whitespace.
 * We first remove any single space characters,
 * and then parse the resulting string into an integer.
 * The radix 10 is specified for decimal conversion.
 */
const   number   =   parseInt (   input . replace (   ' '   ,   ''   )   ,   10   )   ;

// Here, we calculate the square root of the number obtained from the input.
// Math.sqrt returns a floating-point number.
const   square   =   Math . sqrt (   number   )   ;

/*
 * Finally, we check if the calculated square root is an integer.
 * Number.isInteger() is a robust method for this check.
 * Based on the result, we print "Yes" or "No" to the console.
 */
console . log (   Number . isInteger (   square   )   ?   'Yes'   :   'No'   )   ;   // Output the result.