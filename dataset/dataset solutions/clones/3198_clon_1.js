/*
 * This is the primary function definition for the application.
 * It takes a single string 'input' and performs a specific calculation.
 */
function   Main (  input  )
{
    // First, the raw input string is split into an array of strings by newline characters.
    // This allows processing each line of input separately if needed.
    input  =  input . split (  "\n"  ) ;

    // Extract the first number (N) from the first line of the input array.
    // The line is split by space, and the first part is parsed as an integer.
    var   N   =   parseInt (  input [ 0 ] . split (  " "  ) [ 0 ]  ) ;

    // Extract the second number (K) from the first line of the input array.
    // The line is split by space, and the second part is parsed as an integer.
    var   K   =   parseInt (  input [ 0 ] . split (  " "  ) [ 1 ]  ) ;

    // Initialize a variable 'ans' (answer) with the default value "NO".
    var   ans   =   "NO" ;


    // A conditional check is performed here.
    // It evaluates if the ceiling of N divided by 2 is greater than or equal to K.
    if (  Math . ceil (  N   /   2  )   >=   K  )
    {
        // If the condition holds true, the 'ans' variable is updated to "YES".
        ans = "YES" ;
    }


    // Finally, the determined answer is printed to the console.
    // '%s' is a format specifier for a string, similar to C-style printf.
    console . log (  '%s' ,   ans  ) ;
}


/*
 * This debug function is intended for local testing or browser environments.
 * It retrieves input from an HTML element and passes it to the Main function.
 */
function   debug (  )
{
    // Get the value from an HTML input element with the ID "input".
    var   input   =   document . getElementById (  "input"  ) . value ;
    // Call the Main function with the retrieved input.
    Main (  input  ) ;
}

// This line is responsible for executing the Main function in a typical programming contest environment.
// It reads the entire content of the standard input file (/dev/stdin) synchronously as UTF-8.
Main (  require (  "fs"  ) . readFileSync (  "/dev/stdin" ,   "utf8"  )  ) ;