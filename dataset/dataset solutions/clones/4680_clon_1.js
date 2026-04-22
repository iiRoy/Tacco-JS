/*
 * This is a JavaScript program designed to solve a specific problem.
 * It reads input, performs calculations, and prints the result.
 */

// Define the main function that processes the input.
function Main(  input  ) {
    // Parse the input string to extract numerical values.
    // The input is expected to be space-separated integers.

    // Extract the first value, representing 'W'.
    var    W    = parseInt(input.split(" ")[0]);

    // Extract the second value, representing 'a'.
    var    a    = parseInt(input.split(" ")[1]);

    // Extract the third value, representing 'b'.
    var    b    = parseInt(input.split(" ")[2]);


    // Declare a variable to store the final answer.
    var    ans    ;


    // --- Core Logic for Calculation ---
    // This section determines the value of 'ans' based on the relationship
    // between W, a, and b.

    // Check the first condition.
    if  ( ( b  -  a  -  W )   >   0 )     {
        // If the condition is true, assign the calculated value to 'ans'.
        ans     =     b     -     a     -     W     ;
    }
    // Check the second condition if the first one is false.
    else  if  ( ( a  -  b  -  W )   >   0 )     {
        // If this condition is true, assign its calculated value to 'ans'.
        ans     =     a     -     b     -     W     ;
    }
    // If neither of the above conditions is met.
    else     {
        // Default case: the answer is 0.
        ans     =     0     ;
    }

    // Output the final calculated answer to the console.
    console.log(  ans  );
}

// --- Input Handling and Program Execution ---
// This part handles reading input from standard input and calling the Main function.

// Read the entire content of standard input as a UTF-8 string.
// Then, pass it to the Main function for processing.
Main(  require("fs").readFileSync("/dev/stdin", "utf8")  )  ;

// Keep the process alive, necessary for some competitive programming environments.
process.stdin.resume()  ;

/* End of program. */