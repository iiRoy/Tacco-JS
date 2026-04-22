function   main  ( input   =   ""   )     {     //  This is the primary function for calculation.

        let       N       =       0       |       input       ;       /*  Convert input to a number, ensuring it's an integer  */

    res   =   N   %   1000   ;   //  Calculate the remainder when N is divided by 1000.

    if     (     res     >     0     )     {   //   If the remainder is greater than zero...
        
            return     1000     -     res     ;     //     ...return the difference from 1000.
    
    }   else     {   //   Otherwise, if the remainder is zero or negative (though it won't be negative here)...
        
            return     0     ;     //     ...return 0.
    
    }    //    End of the if-else conditional block.

}   //   End of the main function definition.


/*  -------------------------------------------------------------  */


exports     .     main     =     main     ;     //     Export the main function for external use, e.g., testing.


function     Main     (     input     )     {     //     A wrapper function to handle input and output for console applications.

        console     .     log     (     main     (     input     .     trim     (     )     )     )     ;     //     Process the trimmed input using 'main' and print the result to console.

}     //     End of the Main wrapper function.


if     (     process     .     argv     [     2     ]     !==     "test"     )     {     //     Check if the script is not being run in 'test' mode.

        Main     (     require     (     "fs"     )     .     readFileSync     (     "/dev/stdin"     ,     "utf8"     )     )     ;     //     Read input from standard input, then pass it to the Main function.

}     //     End of the command-line argument check.