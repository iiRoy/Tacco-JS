/*
 * This is a JavaScript program designed to process and compare two input strings.
 * It demonstrates string manipulation, array sorting, and conditional logic.
 *
 * This code is a Type I clone, meaning only whitespace and comments have been altered.
 */
function   Main ( input )
{
    // The input, which is a single string, is first split by newline characters.
    // This typically separates multiple lines of input into an array of strings.
    var input = input . split ( '\n' ) ;


    // The first line of input is taken, and its characters are split into an array.
    var s = input [ 0 ] . split ( '' ) ;

    // Similarly, the second line of input is processed into an array of characters.
    var t = input [ 1 ] . split ( '' ) ;


    /*
     * The array of characters 's' is sorted alphabetically.
     * The custom comparison function (a, b) => a < b ? -1 : 1 ensures ascending order.
     * After sorting, the array is converted back into a single string.
     */
    var ss = s . sort ( ( a , b ) => a < b ? -1 : 1 ) . toString ( ) ;


    // The array of characters 't' is also sorted alphabetically,
    // but then its order is reversed before being converted to a string.
    var tt = t . sort ( ( a , b ) => a < b ? -1 : 1 ) . reverse ( ) . toString ( ) ;


    // An array named 'sstt' is created, containing the two processed strings 'ss' and 'tt'.
    var sstt = [ ss , tt ] ;

    // Another array 'x' is created, which is an identical copy of 'sstt' at this point.
    var x = [ ss , tt ] ;


    /*
     * The 'sstt' array itself is then sorted.
     * Since 'sstt' contains strings, this will sort the strings alphabetically.
     * The result of this sort operation is stored in the 'Sort' variable.
     */
    var Sort = sstt . sort ( ( a , b ) => a < b ? -1 : 1 ) ;


        // The first conditional check: are the original character arrays 's' and 't' strictly equal?
        if ( s === t )
        {
            // If they are, print 'No'.
            console . log ( 'No' ) ;
        }
    // If 's' and 't' are not strictly equal, proceed to the next condition.
    else
        if ( x [ 0 ] === Sort [ 0 ] )
        {
            // This checks if the first element of array 'x' (which is 'ss')
            // is strictly equal to the first element of the 'Sort' array (which is the alphabetically first string from 'ss' and 'tt').
            // If they are equal, print 'Yes'.
            console . log ( 'Yes' ) ;
        }
    // If neither of the above conditions is met, execute the final 'else' block.
    else {
        // In all other scenarios, print 'No'.
        console . log ( 'No' ) ;
    }

}


// This line reads the content of '/dev/stdin' (standard input) as 'utf8' encoded text.
// The read content is then passed as the 'input' argument to the 'Main' function,
// initiating the program's execution.
Main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;