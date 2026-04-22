"use strict" ; /* This directive enables strict mode for the entire script, enforcing stricter parsing and error handling. */


// --- Definition of the Main function, which serves as the primary entry point for the program. ---
function Main ( input )
{
    // Create a new instance of the Inputer class to handle parsing of the provided input string.
    let cin = new Inputer ( input ) ;

    // Declare and initialize several variables by extracting values from the input using the 'cin' object.
    // N: an integer, S: a string, K: another integer.
    let N = cin.getInt ( ) ,
        S = cin.getStr ( ) ,
        K = cin.getInt ( ) ;

    // Initialize an empty array named 'ans' which will store the characters forming the final output string.
    let ans = [ ] ;

    // Determine the character at the (K-1)th position in the string S (since string indices are 0-based).
    // This character, 'Ch', will be used for comparison within the loop.
    let Ch = S.charAt( K - 1 ) ;

    // Begin a loop that iterates 'N' times, with 'n' as the loop counter starting from 0.
    for ( let n = 0 ; n < N ; n ++ )
    {
        // Inside the loop, perform a conditional check:
        // If the character at the current position 'n' in string 'S' is identical to 'Ch',
        // then push 'Ch' itself into the 'ans' array.
        // Otherwise (if they are different), push an asterisk ('*') into the 'ans' array.
        ans.push( Ch == S.charAt( n ) ? Ch : "*" ) ;
    }

    // After the loop completes, join all the characters stored in the 'ans' array into a single string
    // without any separator, and then print this resulting string to the console.
    console.log( ans.join( '' ) ) ;
}


/*
 * The Inputer class is designed to facilitate the structured parsing of input data.
 * It takes a raw string as input, splits it into individual items, and provides
 * methods to retrieve these items as various data types (integers, strings, arrays).
 */
class Inputer
{
    // The constructor method for the Inputer class. It initializes the instance.
    constructor ( t )
    {
        this.cnt    =   0 ;                                 // 'cnt' is an internal counter to keep track of the current item's index.
        this.items  =   t.split( /\n|\s/ ) ;                // 'items' is an array created by splitting the input string 't'
                                                            // based on newline characters or spaces as delimiters.
    }

    // This method retrieves the next available item from the 'items' array and converts it to an integer.
    getInt ( )
    {
        // It accesses the item at the current 'cnt' index, then increments 'cnt' for the next call.
        // The '- 0' operation is a concise way to explicitly convert the string item to a number.
        return this.items[ this.cnt ++ ] - 0 ;
    }

    // This method retrieves an array of 't' integers from the input stream.
    getIntArray ( t )
    {
        let r = new Array( t ) ;                            // Create a new array 'r' with a predefined size 't'.
        for ( let e = 0 ; e < t ; e ++ )                    // Loop 't' times to fill the array.
        {
            r[ e ] = this.getInt( ) ;                       // For each iteration, call getInt() to populate the array.
        }
        return r ;                                          // Return the newly created array of integers.
    }

    // This method retrieves the next available item from the 'items' array as a string.
    getStr ( )
    {
        // It accesses the item at the current 'cnt' index, then increments 'cnt'.
        // The item is returned as a string directly.
        return this.items[ this.cnt ++ ] ;
    }

    // This method retrieves an array of 't' strings from the input stream.
    getStrArray ( t )
    {
        let r = new Array( t ) ;                            // Create a new array 'r' with a predefined size 't'.
        for ( let e = 0 ; e < t ; e ++ )                    // Loop 't' times to fill the array.
        {
            r[ e ] = this.getStr( ) ;                       // For each iteration, call getStr() to populate the array.
        }
        return r ;                                          // Return the newly created array of strings.
    }
}


/*
 * This conditional block checks the execution environment.
 * If 'window' is undefined (typical in Node.js or command-line environments),
 * it assumes the script is running outside a web browser.
 */
if ( typeof window == "undefined" )
{
    // In a Node.js environment, it reads the input from '/dev/stdin' (standard input)
    // using the 'fs' (file system) module, decodes it as 'utf8', and passes it to the Main function.
    Main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;
}