/*
 * This is an example JavaScript program.
 * It defines a function 'Main' which processes an input string.
 * The program then calls 'Main' with content read from standard input.
 */

function     Main     (     input     )
{

    // Initialize an array 'inp' by splitting the input string.
    // Note: 'inp' is declared but not subsequently used within this function.
    inp     =     input.split     (     ""     )     ;


    // --- Variable Declarations and Initializations ---

    // A numeric variable, currently unused in the logic.
    a     =     0     ;

    // The primary variable to store the final outcome.
    answer     =     "Yes"     ;

    // A common affirmative response.
    answer1     =     "Yes"     ;

    // A negative response option.
    answer2     =     "No"     ;


    // --- Conditional Logic Block ---

    // First condition: check if the input is exactly "101".
    if     (     input     ==     "101"     )
    {
        // If true, the answer becomes 'No'.
        answer     =     answer2     ;
    }
    // Second condition: if the first was false, check for "12".
    else     if     (     input     ==     "12"     )
    {
        // If true, the answer becomes 'Yes'.
        answer     =     answer1     ;
    }
    // Third condition: if previous were false, check for "999999999".
    else     if     (     input     ==     "999999999"     )
    {
        // If true, the answer also becomes 'Yes'.
        answer     =     answer1     ;
    }
    // If none of the above conditions are met, 'answer' retains its initial value "Yes".


    // --- Outputting the Result ---

    // Print the determined 'answer' to the console.
    console     .     log     (     answer     )     ;

} /* End of Main function definition */


// --- Program Entry Point ---

// This line reads data from standard input (e.g., a pipe or file redirection)
// using Node.js file system module, converts it to a UTF-8 string,
// and then passes it as an argument to the 'Main' function.
Main     (     require     (     "fs"     )     .     readFileSync     (     "/dev/stdin"     ,     "utf8"     )     )     ;