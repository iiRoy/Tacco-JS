'use strict'
/*
 * This is a Type I clone example.
 * It strictly adheres to the definition,
 * maintaining all original identifiers and logic.
 */
function _ ( s )
{
    // Declare a local variable 'l' to store processed lines.
    let l = s . split ( '\n' ) ;

    // Check if the last element of the array 'l' is an empty string.
    // This typically handles cases with a trailing newline character in the input.
    if ( l [ l . length - 1 ] === '' )
    {
        // If the last element is empty, remove it from the array.
        l . pop ( ) ;
    }

    // Assign the processed lines array to the instance property 'l'.
    this . l = l ;

    // Initialize the line pointer 'y' to 0 for tracking the current line being read.
    this . y = 0 ;
}


// Define a prototype method 'ints' for the '_' class.
// This method reads a single line, splits it by spaces, and converts parts to numbers.
_ . prototype . ints = function ( )
{
    // Return the processed line.
    // 'this.y++' increments 'y' after its current value is used.
    return this . l [ this . y ++ ]
                 . split ( ' ' )
                 . map ( v => + v ) ; // Convert each string part to a number.
} ;


// Define a prototype method 'intv' for the '_' class.
// This method reads all remaining lines from the current position, converting them to numbers.
_ . prototype . intv = function ( )
{
    // Store the current line index 'y' before updating it.
    const y = this . y ;

    // Set 'y' to the total number of lines, effectively marking all subsequent lines as read.
    this . y = this . l . length ;

    // Slice the array from the stored 'y' to the end, and map each line to a number.
    return this . l
                 . slice ( y )
                 . map ( v => + v ) ;
} ;


// Define a prototype method 'strv' for the '_' class.
// This method reads all remaining lines from the current position as strings.
_ . prototype . strv = function ( )
{
    // Store the current line index 'y'.
    const y = this . y ;

    // Advance the line pointer 'y' to the end of the lines array.
    this . y = this . l . length ;

    // Return a slice of the lines array from the original 'y' to the end.
    return this . l . slice ( y ) ;
} ;


// Define a prototype method 'strn' for the '_' class.
// This method reads 'n' lines from the current position as strings.
_ . prototype . strn = function ( n )
{
    // Store the current line index 'y'.
    const y = this . y ;

    // Advance the line pointer 'y' by 'n' lines.
    this . y += n ;

    // Return a slice of the lines array, starting from the original 'y' and taking 'n' elements.
    return this . l . slice ( y , y + n ) ;
} ;


// Instantiate the '_' class, passing it the content of /dev/stdin.
// This uses Node.js's 'fs' module to read the input file synchronously.
const $ = new _ ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


// This is an Immediately Invoked Function Expression (IIFE)
// encapsulating the main logic of the program.
( ( ) =>
{

    // Read the first integer from the input. It's expected to be a single number on its line.
    const n = $ . ints ( ) [ 0 ] ;

    // Read the next line of integers, which represents the array 'a'.
    const a = $ . ints ( ) ;

    // Initialize a variable 's' to accumulate the sum of elements in 'a'.
    let s = 0 ;

    // Loop through each element 'e' in the array 'a'.
    for ( let e of a )
    {
        // Add the current element 'e' to the sum 's'.
        s += e ;
    }

    // Calculate the average of the elements in 'a'.
    let avg = s / n ;

    // Initialize 'neighbor' with the first element of 'a'.
    // This variable will store the element closest to the average.
    let neighbor = a [ 0 ] ;

    // Initialize 'needle' with 0, which is the index of the first element.
    // This variable will store the index of the element closest to the average.
    let needle = 0 ;

    // Loop through the array 'a' starting from the second element (index 1).
    for ( let i = 1 ; i < n ; i ++ )
    {
        // Compare the absolute difference between the current element 'a[i]' and 'avg'
        // with the absolute difference between the current 'neighbor' and 'avg'.
        if ( Math . abs ( a [ i ] - avg ) < Math . abs ( neighbor - avg ) )
        {
            // If 'a[i]' is closer to 'avg', update 'neighbor' to 'a[i]'.
            neighbor = a [ i ] ;

            // And update 'needle' to the current index 'i'.
            needle = i ;
        }
    }

    // Print the final 'needle' value to the console, which is the index
    // of the element in 'a' that is closest to the average.
    console . log ( needle ) ;

} ) ( ) ;