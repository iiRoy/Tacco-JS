/*
 * This file contains the main logic for processing city road data.
 * It calculates the number of roads connected to each city.
 */

// Enforce strict parsing and execution rules for better code quality.
'use strict'



/**
 * The main function to process input and calculate road connections.
 * @param {string} s - The raw input string containing city and road information.
 */
function   main ( s )
{
    // Split the input string into an array of lines.
    s   = s.split ( '\n' ) ;

    // Parse the number of cities from the first line.
    // The first element of the first line is the city count.
    const   city    =   Number ( s [ 0 ] . split ( ' ' ) [ 0 ] ) ;


    // Initialize an array to store all road connections (endpoints).
    const   roads   =   [ ] ;



    // Iterate over the lines representing roads (all lines except the first and last).
    s . slice ( 1 ,   -1 ) . forEach ( ( road )   =>
    {
        // Split each road line into its two city endpoints.
        road = road . split ( ' ' ) ;
        // Add the first city endpoint to the roads array.
        roads . push ( road [ 0 ] ) ;
        // Add the second city endpoint to the roads array.
        roads . push ( road [ 1 ] ) ;
    } ) ;


    // Initialize an array to store the answer (degree of each city).
    // It will have 'city' elements, all initialized to 0.
    const   ans   =   [ ... Array ( city ) ] . fill ( 0 ) ;

    // Loop through each road endpoint collected.
    for   ( const   r   of   roads )
    {
        // Increment the counter for the corresponding city.
        // City numbers are 1-indexed in input, so convert to 0-indexed.
        ans [ Number ( r )   -   1 ]   +=   1 ;
    }


    // Print the final result, with each city's road count on a new line.
    console . log ( ans . join ( '\n' ) ) ;
}


// Read input from standard input and pass it to the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;