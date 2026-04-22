// This is a JavaScript program demonstrating basic input processing.
// The main function takes an argument, processes it, and prints a result.

const   main   =   (   arg   )   =>   {
    // First, we'll preprocess the input argument.
    // This involves trimming leading/trailing whitespace and splitting into lines.
    const   lines   =   arg . trim ( ) . split ( '\n' ) ;


    // Next, we extract numerical values from the first line.
    // The first line is expected to contain two space-separated numbers.
    const   [   N   ,   i   ]   =   lines   [   0   ] . split   (   ' '   ) . map   (   Number   ) ;


    // Finally, we calculate the result and print it to the console.
    // The calculation is N - i + 1.
    console . log (   N   -   i   +   1   ) ;
}   ;

// This section handles the execution of the main function.
// It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
main   (   require   (   'fs'   ) . readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;