/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, operators, and expressions are preserved exactly.
 * Only whitespace and comments have been altered significantly
 * to create a visually distinct but functionally identical version.
 */

// Define the main processing function for input data.
function    Main  (  input   )
{

    // Split the entire input string by newline characters.
    input   =  input.split  (   "\n"   )  ;

    // Get the first line of the input, which is expected to be character C.
    var   C    =   input   [   0   ]   ;

    // Log the ASCII (or Unicode) value of the first character of C.
    console.log  (  C.charCodeAt  (  0  )  )  ;

    /*
     * Calculate the character following C.
     * This involves getting C's char code, adding 1,
     * and then converting it back to a character.
     */
    var   ans   =   String.fromCharCode  (  C.charCodeAt  (  0  )  +  1  )  ;


    // Output the resulting character to the console.
    console.log  (  '%s'  ,   ans  )  ;

    // Return the calculated answer.
    return   ans  ;

}   // End of Main function definition.


// This function is likely for debugging or testing within a browser environment.
function    debug   (   n   )
{
    // Retrieve input value from a dynamically named HTML element.
    var   input   =   document.getElementById  (  "input"  +  n  )  .value  ;

    // Call the Main function with the retrieved input.
    var   ans   =   Main  (  input  )  ;

    // Initialize result status as "Wrong Answer".
    var   result   =   "WA"  ;

    // Compare the computed answer with the expected output from another HTML element.
    if  (  ans  ==  document.getElementById  (  "output"  +  n  )  .value.split  (  "\n"  )  [  0  ]  )
    {
        // If answers match, set result to "Accepted".
        result   =   "AC"  ;
    }

    // Update the inner HTML of a result display element.
    document.getElementById  (  "result"  +  n  )  .innerHTML   =   result  ;
}   // End of debug function.


// Execute the Main function, reading input from standard input (typically for competitive programming).
Main  (  require  (  "fs"  )  .readFileSync  (  "/dev/stdin"  ,   "utf8"  )  )  ;

/*
 * End of Type I cloned code.
 * Remember, exact character-by-character equivalence (excluding whitespace and comments)
 * is maintained for all functional parts.
 */