/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates exact token matching, with variations only in
 * whitespace and comments, as per the Type I definition.
 */
function   main (   arg   )
{
    // Begin function body for 'main'
    // This line processes the input argument.
    arg   =   arg.trim (  ).split (   ' '   )  ;


    // Check for equality of the first two elements
    if (   arg[0]   ===   arg[1]   )
    {
        // If they are equal, log 'Yes' to the console.
        console.log   (   'Yes'   )  ;
    }
    else
    {
        // Otherwise, if they are not equal, log 'No'.
        console.log   (   'No'   )  ; // Output 'No'
    }
}
/*
 * The following line calls the main function.
 * It reads input from /dev/stdin using Node.js 'fs' module.
 * The input is read as UTF-8 encoded text.
 */
main   (   require   (   'fs'   )  .readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )  ;