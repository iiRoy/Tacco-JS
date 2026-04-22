/*
 * This file contains a custom input reader utility and a main program logic.
 * The 'gets' function is designed to handle standard input parsing,
 * often used in competitive programming environments.
 *
 * The main function implements specific logic to determine an output
 * based on numerical input.
 */


// Begin definition of the 'gets' input reading utility.
// This is an Immediately Invoked Function Expression (IIFE)
// to encapsulate its internal components.
var   gets   =   (   function (  )  {


    // Inner function 'f': Acts as the public interface for 'gets'.
    // It constructs and returns a new input reader instance.
    function   f (   s   )   {
        return   new   g (   s   ) ;
    }


    // Constructor function 'g': Manages the state of the input stream.
    // 's' is the raw input string, typically from stdin.
    function   g (   s   )   {
        // Store input lines after trimming whitespace and splitting by newline.
        this . _s   =   s . trim ( ) . split ( "\n" ) ;
        // Initialize line pointer to the first line.
        this . _y   =   0 ;
    }


    // Attach method 'a' to the prototype of 'g'.
    // This method reads a single token (number or string) from the current line.
    g . prototype . a   =   function (   f   )   {
        // Declare local variables for convenience and readability.
        var   s   =   this . _s ,
            y   =   this . _y ,
            r   ;

        // Check if the current line (s[y]) is still a single string.
        // If so, split it into tokens and reverse for efficient 'pop' operation.
        if   (   typeof   s [ y ]   ===   "string"   )   {
            s [ y ]   =   s [ y ] . split ( " " ) . reverse ( ) ;
        }

        // Extract the last token from the current line.
        r   =   s [ y ] . pop ( ) ;

        // If the current line is now empty after popping, advance to the next line.
        if   (   ! s [ y ] . length   )   {
            this . _y ++ ;
        }

        // Return the token: as a string if 'f' is truthy, otherwise converted to a number.
        return   f   ?   r   :   + r ;
    } ;


    // Attach method 'l' to the prototype of 'g'.
    // This method reads an entire line of space-separated values.
    g . prototype . l   =   function (   f   )   {
        // Get the current line, split it by spaces, and then increment the line pointer.
        var   s   =   this . _s [ this . _y ++ ] . split ( " " ) ;
        // Return the array of tokens: as strings if 'f' is truthy, otherwise mapped to numbers.
        return   f   ?   s   :   s . map (   a   =>   + a   ) ;
    } ;


    // Attach method 'm' to the prototype of 'g'.
    // This method reads 'n' lines, with each line split into space-separated values.
    g . prototype . m   =   function (   n ,   f   )   {
        // Slice 'n' lines from the input buffer, then map each line to an array of split strings.
        var   r   =   this . _s . slice (   this . _y ,   this . _y   +   n   ) . map (   a   =>   a . split ( " " )   ) ;
        // Advance the line pointer by 'n' lines.
        this . _y   +=   n ;
        // Return the result: an array of string arrays if 'f' is truthy, otherwise inner arrays mapped to numbers.
        return   f   ?   r   :   r . map (   a   =>   + a   ) ;
    } ;


    // Attach method 'r' to the prototype of 'g'.
    // This method reads 'n' lines as raw strings (without splitting individual lines).
    g . prototype . r   =   function (   n ,   f   )   {
        // Slice 'n' lines directly from the input buffer.
        var   r   =   this . _s . slice (   this . _y ,   this . _y   +   n   ) ;
        // Advance the line pointer by 'n' lines.
        this . _y   +=   n ;
        // Return the result: an array of strings if 'f' is truthy, otherwise mapped to numbers.
        return   f   ?   r   :   r . map (   a   =>   + a   ) ;
    } ;


    // The IIFE returns the 'f' function, which is the primary entry point for 'gets'.
    return   f ;

} ) ( ) ;


// Initialize the input object 'o' by reading the entire content of stdin.
// 'fs.readFileSync' is used to synchronously read the file content.
var   o   =   gets (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   ) ;


// Call the main program logic function and print its return value to the console.
console . log (   main ( )   ) ;


/*
 * The main function encapsulates the primary business logic.
 * It processes input data and returns a "Yes" or "No" decision.
 */
function   main ( )   {

    // Define constants for output strings to prevent typos.
    var   Y   =   "Yes" ,
        N   =   "No" ;

    // Read the first integer, which is usually the count of subsequent items.
    var   n   =   o . a ( ) ;

    // Read a line of space-separated integers into array 'a'.
    var   a   =   o . l ( ) ;

    // Initialize an array 'b' to act as counters for different modulo 4 results.
    var   b   =   [   0 ,   0 ,   0   ] ;

    // Iterate through the input array 'a'.
    for   (   var   i   =   0 ;   i   <   n ;   i ++   )   {
        // Calculate the remainder when the current element is divided by 4.
        var   t   =   a [ i ]   %   4 ;

        // Categorize elements based on their modulo 4 result.
        // b[2] for t === 0 (multiples of 4)
        // b[1] for t === 2
        // b[0] for t === 1 or t === 3 (odd numbers)
        if   (   t   ===   0   )   {
            b [ 2 ] ++ ;
        }
        else   if   (   t   ===   2   )   {
            b [ 1 ] ++ ;
        }
        else   {
            b [ 0 ] ++ ;
        }
    }


    // Check the first condition for returning "Yes".
    // If 'n' is equal to the count of numbers with remainder 2.
    if   (   n   ===   b [ 1 ]   )   {
        return   Y ;
    }

    // Increment the count of odd numbers (b[0]).
    b [ 0 ] ++ ;

    // Check the second condition for returning "Yes".
    // This condition involves counts of multiples of 4 (b[2]) and odd numbers (b[0]).
    if   (   b [ 2 ]   &&   b [ 0 ]   <=   b [ 2 ]   +   1   )   {
        return   Y ;
    }

    // If neither of the above conditions are met, return "No".
    return   N ;
}