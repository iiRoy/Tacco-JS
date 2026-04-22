const    input    =    require ( 'fs' )
    . readFileSync ( '/dev/stdin' ,
        /* This specifies the encoding for the input stream */
        'utf8' )
    . split ( '\n' ) ; // Reads the entire file and splits it into an array of lines

/*
 * The following block iterates over each line of the input
 * and processes it to generate a specific output pattern.
 */
console
    . log ( input . map (
        /*
         * This is an anonymous function that will be applied to each element
         * (which is a line string) in the 'input' array.
         */
        function ( x )
        {
            // Parses the current line 'x' into an array of numbers.
            const    arr    =    x . split ( ' ' )
                . map ( Number ) ;

            /*
             * This is a ternary operator.
             * It checks if the first number in the 'arr' is zero.
             */
            return    arr [ 0 ]    ==    0
                ?    '' // If arr[0] is 0, it returns an empty string.
                :    /*
                     * If arr[0] is not 0, it calls another anonymous function
                     * to generate a pattern.
                     */
                function ( h ,    w )
                {
                    // Generates a single row of '#' characters.
                    const    rowString    =    Array ( w    +    1 ) . join ( '#' ) ;

                    // Repeats the row string 'h' times, each followed by a newline.
                    return    Array ( h    +    1 ) . join ( rowString . concat ( '\n' ) ) ;
                }
                ( /* Passes the first element as height and second as width */ arr [ 0 ] ,    arr [ 1 ] ) ;
        }
    ) // The map function finishes here.
        . join ( '\n' ) // Joins all the processed results back into a single string, separated by newlines.
    ) ; // The console.log statement finishes here, printing the final output.