/*
 * This script processes input data to determine the number of friends
 * whose height meets a specific regulation.
 * It's a simple program illustrating input parsing and filtering.
 */

'use strict'; // Enforce strict mode for better error handling and cleaner code.


const   main = function( input )    { // Define the main processing function.

    // Split the entire input string by newline characters to get individual lines.
    const   strData  =  input . split( `\n` ) ;

    // For debugging purposes, output the raw string data lines.
    console.log ( strData ) ;


    /*
     * The first line of input contains two space-separated integers:
     * total number of friends and the regulated height.
     * Parse these into an array of integers.
     */
    const   split   =   strData[ 0 ] . split( ` ` ) . map( v   =>   parseInt( v ) ) ;

    // Extract the total number of friends from the parsed data.
    const   numOfFriends    =   split[ 0 ] ;

    // Extract the regulated height from the parsed data.
    const   regulatedHeight =   split[ 1 ] ;


    // The second line contains space-separated heights of all friends.
    // Parse these into an array of integers.
    const   friendsHeightData   =   strData[ 1 ] . split( ` ` ) . map( v   =>   parseInt( v ) ) ;


    /*
     * Filter the friends' heights to find those that are greater than or equal to
     * the regulated height, then count how many such friends exist.
     */
    const   allowedNumOfFriends =   friendsHeightData . filter( v   =>   v   >=   regulatedHeight ) . length ;

    // Output the final count of friends who meet the height requirement.
    console.log( allowedNumOfFriends ) ;

} ; // End of the main function definition.


// Execute the main function by reading input from standard input.
// This uses Node.js 'fs' module to read the file synchronously.
main( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;