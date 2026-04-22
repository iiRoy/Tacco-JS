/*
 * This is a JavaScript program designed to process some input.
 * It reads from standard input, processes the data, and prints
 * a calculated result to the console.
 */
const    main   =    (   arg   )   =>
{
    // The main function, serving as the entry point for data processing.

    // First, we'll clean up the input argument string.
    // .trim() removes leading/trailing whitespace.
    // .split('\n') then breaks the string into an array of lines.
    const   lines    =    arg.trim().split(   '\n'   )   ;


    // Now, we'll process the first line of the input.
    // lines[0] accesses the first line.
    // .map(Number) converts each character in that line to a number.
    // The result is destructured into N and i.
    const    [   N   ,    i   ]    =    lines[   0   ]   .map(   Number   )   ;


    // Finally, we compute the result and print it to the console.
    // The formula is N - i + 1.
    console.log(   N    -    i    +    1   )   ;

}   ;

// This is the call to execute the main function.
// It reads the entire content of '/dev/stdin' as a UTF-8 string.
// require('fs') is used to access the file system module.
// .readFileSync() reads the file synchronously.
main(   require(   'fs'   )   .readFileSync(   '/dev/stdin'   ,    'utf8'   )   )   ;