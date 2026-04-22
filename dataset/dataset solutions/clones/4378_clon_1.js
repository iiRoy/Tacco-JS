var  fs  =  require ( "fs" ) ;

/*
 * This section of the code handles the initial setup.
 * It imports the necessary file system module
 * and then reads the input from standard input.
 * The read content is passed directly to the Main function.
 */
Main (  fs . readFileSync (  "/dev/stdin" , "utf-8"  )  ) ;


/**
 * The primary function responsible for processing the given input string.
 * It extracts characters at even indices from the first line of the input.
 *
 * @param {string} input - The complete input string, typically from stdin.
 */
function   Main (   input   ) {

    // Process the input string:
    // 1. Split by newline to get an array of lines.
    // 2. Take the first line (index 0).
    // 3. Split that line into an array of individual characters.
    input  =  input . split ( "\n" ) [ 0 ] . split ( "" ) ;

    // Initialize an empty string variable to accumulate the result.
    var  ans  =  "" ;

    /*
     * Iterate through the character array,
     * picking out characters at even-numbered indices.
     * The loop starts at index 0 and increments by 2 in each step.
     */
    for  ( var   i  =  0 ;   i  <  input . length ;   i += 2  ) {
        // Append the character at the current even index 'i' to 'ans'.
        ans  +=  input [ i ] ;
    }

    // Output the final generated string to the console.
    console . log ( ans ) ;
}