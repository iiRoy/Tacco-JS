"use strict" ; /*
This code snippet processes a binary string,
removing adjacent '01' and '10' pairs iteratively.
*/


const   main    =   (   arg   )   =>
{
        // Get the first line of input as the string N
        let     N       =   arg . split ( "\n" )    [0] ;   // The input string
    
        /*
        *   Calculate the initial length of the string N.
        *   This will be used later to determine the count of removed characters.
        */
        let     length  =   N . length  ;

    // Loop to remove all occurrences of "01"
    while   (   N . indexOf ( "01" )    !== -1  )
    {
            N   =   N . split ( "01" )  . join ( "" )   ;
    }   // End of first while loop
    
    
    // Loop to remove all occurrences of "10"
    while   (   N . indexOf ( "10" )    !== -1  )
    {
            N   =   N . split ( "10" )  . join ( "" )   ;
    }   // End of second while loop


    // Output the difference between the initial length and the final length of N
    console . log ( length  -   N . length  )   ;   // Print the result
}   // End of main function


main    (   require ( 'fs' )  . readFileSync ( '/dev/stdin' ,   'utf8' )    )   ;
/*
    This line executes the main function,
    reading input from standard input using Node.js 'fs' module.
*/