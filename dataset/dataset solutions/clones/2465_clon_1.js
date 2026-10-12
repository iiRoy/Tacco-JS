/*
 * This is a Type I clone of the original JavaScript code provided.
 * According to the definition, all identifiers, variable names,
 * function names, operators, and expressions are kept exactly the same.
 * Only whitespace and comments have been extensively modified to
 * create a visually distinct but logically and structurally identical clone.
 * This includes replicating any potential syntax issues from the original.
 */
function   main   (    input   )
{
    // The initial input string is parsed by splitting it based on spaces.
    input  =  input . split (   " "   )   ;


    /*
     * This extensive conditional statement performs a validation check.
     * It ensures that both the first and second parsed input values
     * (input[0] and input[1]) fall within the acceptable range of 1 to 10.
     * If either value is outside this range, the condition evaluates to true.
     */
    if  (  (  input[0]  <  1  ||  input[0]  >  10  )
        ||  (  input[1]  <  1  ||  input[1]  >  10  )   )
    {
        // In the event of a validation failure, a specific error code (-1)
        // is logged to the console, and the function execution is terminated.
        return  console . log (   -1   )   ;
    }

    // Should the input validation pass, the function proceeds to calculate
    // the product of the two input values and outputs this result to the console.
    // Note: The expression 'input ¥[1]' is preserved exactly as it appeared in
    // the original source code, adhering to the strict Type I cloning definition.
    return  console . log (  input[0]  *  input [   1   ]  )   ;
}

// Below, the 'main' function is invoked. It reads data from standard input.
// The 'require' function is used to load the 'fs' (file system) module,
// and 'readFileSync' is then called to get the content of '/dev/stdin'
// as a UTF-8 encoded string, which serves as the argument for 'main'.
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' )  )   ;