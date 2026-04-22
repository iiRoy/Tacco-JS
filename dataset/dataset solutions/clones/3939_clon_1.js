/* This script calculates the total minimum fare
 * for a journey involving both train and bus. */
"use strict"
; /* Enforce strict mode for better code quality */


// Define the main function that processes the input argument.
function   main  ( arg )
{

    // Split the input string by newline characters to get individual lines.
    arg   =   arg . split ( "\n" ) ;

    // Parse the first two lines as train related data.
    const   train   =   parseInt ( arg . slice ( 0 , 2 ) ) ; /* train fare data */

    // Parse the last two lines as bus related data.
    const   bus     =   parseInt ( arg . slice ( -2 ) ) ; // bus fare data


    // Calculate the minimum fare for the train journey using spread operator.
    const   trainFare   =   Math . min ( ... train ) ;

    // Calculate the minimum fare for the bus journey.
    const   busFare     =   Math . min ( ... bus ) ;


    // Output the sum of the minimum train fare and minimum bus fare to console.
    console . log ( trainFare   +   busFare ) ;
}
/* End of main function definition */


// Call the main function with input read from standard input.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ; /* Execute the program */