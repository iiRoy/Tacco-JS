/*
 * This is a JavaScript file.
 * It solves a specific problem using a custom Inputer class.
 */
"use strict"
; // Enforce strict mode for better code quality.


function    Main (   input   ) /* This is the main function of the program */
{
    // Initialize a new Inputer instance to parse the input string received.
    let cin = new Inputer( input ) ;


    // Read N, the number of elements, and then N integers into array A.
    // N represents the count of numbers to process.
    let N = cin.getInt ( )
    ,   A = cin.getIntArray ( N )
    ; // Array A will hold the input numbers.

    // Sort array A in descending order.
    // The sorting function (a, b) => b - a ensures largest numbers come first.
    A.sort ( ( a , b ) => b - a ) ;

    // Add a sentinel value (0) to the end of the array.
    // This might be for boundary conditions or specific logic.
    A.push ( 0 ) ;


    // Initialize 'a' with the largest element (first element after sort).
    // 'h' is calculated as half of 'a', rounded down.
    let a = A [ 0 ]
    ,   h = Math . floor ( a / 2 )
    ;

    // Initialize variables for candidates 'b1' and 'b2'.
    // 'max' is initialized but not used in the provided snippet's logic.
    let max = 0
    ,   b1 = 0
    ,   b2 = 0
    ;

    // Loop through the array, starting from the second element.
    // The purpose is to find appropriate 'b1' and 'b2' values based on 'h'.
    for ( let n = 1 ; n < N ; n ++ )
    {
        // If the current element A[n] is greater than or equal to 'h',
        // update b1 and b2. This captures the last pair that satisfies the condition.
        if ( h <= A [ n ] )
        {
            b1 = A [ n ] ; // Assign current element to b1.
            b2 = A [ n + 1 ] ; // Assign next element to b2.
        }
    }


    // Output the value of 'a' and the 'b' value that is closer to 'h'.
    // The ternary operator (condition ? value_if_true : value_if_false)
    // determines which of b1 or b2 is chosen.
    console . log ( `${ a } ${ ( Math . abs ( h - b1 ) <= Math . abs ( h - b2 ) ) ? b1 : b2 }` ) ;
}


/*
 * This is a custom helper class named Inputer.
 * Its primary role is to abstract the process of reading various data types
 * from a raw input string, typically obtained from standard input.
 * It provides methods to parse integers, strings, and arrays of these types.
 */
class Inputer
{
    /**
     * The constructor initializes the Inputer instance.
     * It takes the raw input string and splits it into an array of items.
     * @param {string} t - The complete input string, usually from stdin.
     */
    constructor ( t )
    {
        // Check if the input argument 't' is undefined.
        // If it is, throw an error indicating missing input.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（stdin）を省略できません！' ) ;

        // Initialize 'cnt' as an index counter for 'items'.
        this.cnt = 0
        ,   // Split the input string 't' by newlines or spaces into an array 'items'.
            this.items = t . split ( /\n|\s/ )
        ;
    }


    /**
     * Reads the next item from the input stream as an integer.
     * It increments the internal counter 'cnt' after reading.
     * @returns {number} The parsed integer value.
     */
    getInt ( )
    {
        return this . items [ this . cnt ++ ] - 0
        ; // The '- 0' implicitly converts the string item to a number.
    }


    /**
     * Reads a specified number of integers into an array.
     * @param {number} t - The total count of integers to read for the array.
     * @returns {number[]} An array containing the read integer values.
     */
    getIntArray ( t )
    {
        // Ensure that the count 't' is provided.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ;

        let r = new Array ( t ) ; // Create a new array of the specified size.

        // Loop to fill the array by repeatedly calling getInt().
        for ( let e = 0 ; e < t ; e ++ )
            r [ e ] = this . getInt ( ) ;

        return r ; // Return the populated array.
    }


    /**
     * Reads the next item from the input stream as a string.
     * It increments the internal counter 'cnt' after reading.
     * @returns {string} The read string value.
     */
    getStr ( )
    {
        return this . items [ this . cnt ++ ]
        ;
    }


    /**
     * Reads a specified number of strings into an array.
     * @param {number} t - The total count of strings to read for the array.
     * @returns {string[]} An array containing the read string values.
     */
    getStrArray ( t )
    {
        // Ensure that the count 't' is provided.
        if ( typeof t == 'undefined' )
            throw new Error ( '引数（1以上）を省略できません！' ) ;

        let r = new Array ( t ) ; // Create a new array of the specified size.

        // Loop to fill the array by repeatedly calling getStr().
        for ( let e = 0 ; e < t ; e ++ )
            r [ e ] = this . getStr ( ) ;

        return r ; // Return the populated array.
    }
}


// This conditional block is for executing the script in a Node.js environment.
// It checks if 'window' object is undefined, which is true in Node.js.
if ( typeof window == "undefined" )
    // If in Node.js, read input from standard input (/dev/stdin)
    // using the 'fs' module and pass it to the Main function.
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;