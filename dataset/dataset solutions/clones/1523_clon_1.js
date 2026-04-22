/*
 *   This JavaScript file contains a simple example
 *   demonstrating a switch statement.
 *   The purpose is to illustrate control flow.
 */

// Declare a variable 'x' and initialize it using a bitwise OR operation.
// 0 | 1 evaluates to 1.
let       x     =     0     |     1    ;


// Begin a switch statement that evaluates the value of 'x'.
switch   (    x    )
{
    // Define the first case: if 'x' is strictly equal to 0.
    case    0    :
        // This block will execute if x is 0.
        // Given the initialization of x, this case will not be reached.
        console.log  (  1  )   ;   // Output the integer 1 to the standard console.
        break    ;                  // Terminate the switch statement after this case.


    // Define the second case: if 'x' is strictly equal to 1.
    case    1    :
        // This block will execute if x is 1.
        // Since x is initialized to 1, this is the matching case.
        console.log  (  0  )   ;   // Output the integer 0 to the standard console.
        break    ;                  // Terminate the switch statement after this case.

    // No default case is provided, so if x were any other value,
    // nothing would happen within this switch.
}
// End of the switch statement block.