/*
 * This JavaScript program defines a single function 'main'
 * which takes an input, typically a number or a string representation of a number.
 *
 * The purpose of the 'main' function is to determine if the input number
 * is perfectly divisible by the sum of its individual digits.
 *
 * If the number is divisible, it prints 'Yes' to the console.
 * Otherwise, it prints 'No'.
 *
 * This file is structured to be executed using Node.js, reading input from /dev/stdin.
 */

// Define the primary function responsible for the core logic of the program.
function         main ( input ) {

    // Declare and initialize a variable 'inputA'.
    // It converts the 'input' argument to a string, then splits it into an array of individual character digits.
    // Example: if input is 123, inputA becomes ['1', '2', '3'].
    var     inputA    =    input.toString().split('');


    // Declare and initialize a variable 'inputB'.
    // It converts the 'input' argument into an integer using parseInt.
    // This integer value will be used for the divisibility check later.
    var     inputB    =    parseInt( input );


    // Declare and initialize a variable 'sum' to zero.
    // This variable will accumulate the sum of the digits of the input number.
    var     sum       =    0;


    // Begin a 'for' loop to iterate through each digit character stored in the 'inputA' array.
    // The loop runs from the first digit (index 0) up to, but not including, the total number of digits.
    for ( var    i = 0 ;    i < inputA.length ;    i++ )
    {
    	// Inside the loop:
    	// Convert the current digit character (inputA[i]) to an integer.
    	// Add this integer value to the 'sum' variable.
    	sum      +=      parseInt(inputA[i]);
    }
    // The loop concludes after all digits have been processed and their sum calculated.


    // Now, evaluate the condition: Is 'inputB' (the original number) divisible by 'sum' (the sum of its digits)?
    // The modulo operator (%) returns the remainder of a division.
    // If the remainder is 0, then 'inputB' is perfectly divisible by 'sum'.
    if  (  inputB    %    sum    ==    0  )
    {
        // If the condition is true (divisible), print 'Yes' to the standard output.
        console.log ( 'Yes' );
    }
    else // If the condition in the 'if' statement is false.
    {
        // If the condition is false (not divisible), print 'No' to the standard output.
        console.log ( 'No' );
    }

    // The 'main' function completes its execution here.

} // End of the 'main' function definition.


// This line of code is responsible for invoking the 'main' function.
// It first uses Node.js's 'fs' (file system) module to synchronously read the content
// of the '/dev/stdin' file, which typically represents standard input.
// The content is read as a 'utf8' encoded string.
// This string content is then passed as the 'input' argument to the 'main' function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,    'utf8' ) );
// The program finishes execution after the 'main' function has completed.