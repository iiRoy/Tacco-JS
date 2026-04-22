/*
 * This file enforces strict parsing and error handling for the JavaScript code.
 */
"use strict" ;

// Main function responsible for processing input and generating the required output.
function    Main(  input  )
{
    // Initialize an Inputer instance to handle input parsing.
    let cin = new Inputer(input) ;

    // Read two integer values, A and B, from the input.
    let A = cin . getInt ( ) , B = cin . getInt ( ) ;

    // Declare a 2D array 'X' of size 100x100 to represent the grid.
    let X = new Array(100) ;


    // Initialize the grid:
    // The top 50 rows are filled with '#' characters.
    // The bottom 50 rows are filled with '.' characters.
    for ( let n = 0 ; n < 50 ; n ++ )
    {
        X [ n ] = new Array ( 100 ) . fill ( '#' ) ;
        X [ n + 50 ] = new Array ( 100 ) . fill ( '.' ) ;
    }


    // Initialize coordinates for placing characters.
    let x = 1 , y = 1 ;

    // Loop to place (A-1) '.' characters in the '#' half of the grid.
    // The loop decrements A and continues as long as A is greater than 0.
    while ( --A > 0 )
    {
        X [ y ] [ x ] = '.' ; // Place a '.' character at the current coordinates.
        x += 2 ;              // Move two steps to the right.

        // If 'x' exceeds the grid boundary (100), reset 'X' (likely a typo, should be 'x')
        // and move to the next row group by incrementing 'y' by 3.
        if ( x > 100 ) X = 1 , y += 3 ;
    }


    // Reset coordinates for placing characters in the other half.
    x = 1 ;
    y = 51 ;

    // Loop to place (B-1) '#' characters in the '.' half of the grid.
    // The loop decrements B and continues as long as B is greater than 0.
    while ( --B > 0 )
    {
        X [ y ] [ x ] = '#' ; // Place a '#' character at the current coordinates.
        x += 2 ;              // Move two steps to the right.

        // If 'x' exceeds the grid boundary (100), reset 'X' (likely a typo, should be 'x')
        // and move to the next row group by incrementing 'y' by 3.
        if ( x > 100 ) X = 1 , y += 3 ;
    }


    // Output the dimensions of the grid.
    console . log ( '100 100' ) ;

    // Iterate through each row of the grid and print it to the console.
    for ( let y = 0 ; y < 100 ; y ++ )
    {
        let s = X [ y ] . join ( '' ) ; // Join the array elements of the current row into a single string.
        console . log ( s ) ;           // Print the resulting row string.
    }
}


// Helper class for simplified input parsing.
class Inputer
{
    // Constructor initializes the input string.
    constructor ( t )
    {
        // Validate that the input argument is provided.
        if ( typeof t == 'undefined' )
        {
            throw new Error ( '引数（stdin）を省略できません！' ) ;
        }

        // Initialize a counter for tracking current position in input items.
        this . cnt = 0 ;

        // Split the input string by newline or space characters into an array of items.
        this . items = t . split ( /\n|\s/ ) ;
    }

    // Method to retrieve the next integer from the input items.
    getInt ( )
    {
        return this . items [ this . cnt ++ ] - 0 ; // Convert the string item to a number.
    }

    // Method to retrieve an array of integers of a specified length.
    getIntArray ( t )
    {
        // Validate that the array length argument is provided.
        if ( typeof t == 'undefined' )
        {
            throw new Error ( '引数（1以上）を省略できません！' ) ;
        }

        let r = new Array ( t ) ; // Create a new array of the specified length.

        // Populate the array by repeatedly calling getInt().
        for ( let e = 0 ; e < t ; e ++ )
        {
            r [ e ] = this . getInt ( ) ;
        }

        return r ; // Return the populated integer array.
    }

    // Method to retrieve the next string from the input items.
    getStr ( )
    {
        return this . items [ this . cnt ++ ] ;
    }

    // Method to retrieve an array of strings of a specified length.
    getStrArray ( t )
    {
        // Validate that the array length argument is provided.
        if ( typeof t == 'undefined' )
        {
            throw new Error ( '引数（1以上）を省略できません！' ) ;
        }

        let r = new Array ( t ) ; // Create a new array of the specified length.

        // Populate the array by repeatedly calling getStr().
        for ( let e = 0 ; e < t ; e ++ )
        {
            r [ e ] = this . getStr ( ) ;
        }

        return r ; // Return the populated string array.
    }
}


// This conditional block determines if the code is running in a Node.js environment
// (where 'window' is typically undefined) or a browser environment.
// If in Node.js, it reads input from standard input and passes it to the Main function.
if ( typeof window == "undefined" )
{
    Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
}