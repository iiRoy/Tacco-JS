/*
 *  This script processes input data to find a specific pattern.
 *  The entire input data is passed to the Main function.
 *  It includes utility functions for parsing space-separated strings and numbers.
 *  The core logic calculates a profit-related value and its occurrences.
 */
function         Main(  input  )
{

    /*
     *   Helper function to parse a line of space-separated strings.
     *   It removes leading/trailing whitespace and splits the line by spaces.
     *   Each element remains a string.
     */
    var     space_strinput = function( line  )
    {
        // Remove leading/trailing whitespace using regex and then split by space.
        var    arr = line.replace(  /(^\s+)|(\s+$)/g, "" ).split( " " ) ;

        // No type conversion needed, elements are already strings.
        for ( var i = 0 ; i < arr.length ; ++i )
        {
            arr[i] = arr[i] ; // Self-assignment, conceptually keeps it as string
        }

        return arr ;
    } ;

    /*
     *   Helper function to parse a line of space-separated numbers.
     *   It cleans up whitespace and converts each element to a number.
     */
    var     space_numinput = function( line )
    {
        // Clean whitespace and split into an array of string numbers.
        var    arr = line.replace( (/(^\s+)|(\s+$)/g) , "" ).split( " " ) ;

        // Convert each string element to a number.
        for  (   var   i = 0 ; i < arr.length ; ++i   )
        {
            arr[i] = +arr[i] ; // Unary plus operator converts string to number
        }

        return   arr   ;
    } ;



    /*
     *   Utility function to determine the minimum of two numbers.
     *   Uses a ternary operator for concise comparison.
     */
    var   getmin = function ( a , b )  { return   a > b ? b : a ; } ;


    // Split the entire input string into an array of lines.
    // Each line from the input file becomes an element in the 'lines' array.
    lines = input.split("\n") ; // input[0] is 1st line, input[1] is 2nd line, etc.


    // Parse the first line for initial parameters.
    var   l0 = space_numinput( lines[0] ) ;
    var   n  = l0[0] ; // First value from l0 array
    var   t  = l0[1] ; // Second value from l0 array


    // Parse the second line, which contains the main data array 'a'.
    var   a = space_numinput( lines[1] ) ;


    // Initialize variables for profit calculation.
    var   rieki = 0 ;                       // Stores the maximum profit found so far.
    var   rieki_place_count = 0 ;           // Counts how many times the maximum profit occurs.
    var   min = a[0] ;                      // Tracks the minimum value encountered up to the current point.
    var   max = a[0] ;                      // This 'max' variable is declared but not used in the final logic.


    // Special case: if there's only one element, no profit can be made.
    if  ( n  ==  1 )
    {
        console.log( "0" ) ; // Output 0 for single element case.
    }


    // Iterate through the array 'a' to find the maximum profit and its occurrences.
    for  (   var   i = 0 ;   i < n ;   ++i   )
    {
        var   val = a[i] ; // Current value being processed from array 'a'.

        // Check if the current profit (val - min) is greater than the maximum profit found so far.
        if  (   val  -  min  >  rieki   )
        {
            rieki = val - min ;             // Update the maximum profit.
            rieki_place_count = 1 ;         // Reset count as a new maximum profit is found.
        }
        // If the current profit equals the maximum profit, increment the count.
        else   if   (   val   -   min   ==   rieki   )
        {
            rieki_place_count++ ;           // Increment the count of maximum profit occurrences.
        }

        // Update the minimum value encountered so far.
        // This is crucial for calculating future potential profits.
        min = val < min ? val : min ;
    }


    // Output the minimum of the profit count and half of 't'.
    // Math.floor ensures an integer result for t/2.
    console.log(   getmin(   rieki_place_count ,   Math.floor( t / 2 )   )   ) ;

} // End of Main function


// Call the Main function with input read from stdin.
// Uses Node.js 'fs' module to synchronously read the entire file.
Main(   require( "fs" ).readFileSync( "/dev/stdin" , "utf8" )   ) ;