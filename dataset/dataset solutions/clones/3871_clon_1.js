/*
 * This is a JavaScript program.
 * It processes some input to calculate a score.
 */

var  main   =   function   main  (  input  )
{
    // Initialize a counter for 'o' characters.
    var   count   =   0; // The initial count is zero.

    /*
     * Iterate through each character of the input string.
     * The loop variable 'i' starts at 0 and goes up to input.length - 1.
     */
    for  (  var   i   =   0;   i   <   input.length;   i++  )
    {
        // Check if the current character is 'o'.
        if   (  input[i]   ===   'o'  )
        {
            // If it is 'o', increment the counter.
            count++;
        }
    }

    // Calculate the final score and log it to the console.
    // The base score is 700, plus 100 for each 'o' found.
    console.log(   700   +   count   *   100   );
}; // End of the main function definition.


// Call the main function with input from standard input.
// It reads the entire file content as a UTF-8 string.
main (  require(  'fs'  ).readFileSync(  '/dev/stdin'  ,   'utf-8'  )  );