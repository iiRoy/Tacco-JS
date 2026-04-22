/* This JavaScript file processes some input data. */
/* The 'input' parameter will contain the entire raw input string. */
function   Main  (  input  )
{

    // First, we split the incoming string by newline characters.
    // This converts the single string into an array of strings,
    // where each element corresponds to a line of input.
    input  =  input.split  (  "\n"  )  ;

    // We then parse the first element of the resulting array as an integer.
    // The '10' specifies the radix (base 10) for parsing.
    var   a   =   parseInt  (  input[0]  ,  10  )  ;


    // Finally, we calculate the result using the parsed integer 'a'.
    // The calculation is (a + 1) / 2.
    // The console.log function is used to output the result, formatted as a decimal integer.
    console.log  (  '%d'  ,  (  a  +  1  )  /  2  )  ;
}


/*
 * The following section handles standard input/output.
 * It reads the entire content from /dev/stdin and passes it to the Main function.
 * Please do not modify this part of the code, as it's crucial for the execution environment.
 */
Main  (  require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )  )  ; // Execute the main function with the read data.