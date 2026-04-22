/*
 * This script showcases a fundamental
 * conditional branching construct
 * using a switch statement in JavaScript.
 * It initializes a numeric flag and then
 * performs an action based on its value.
 */
let statusIndicator = 0 | 1;   // Declares and initializes a flag variable.
                                // The bitwise OR operation (0 | 1) results in 1.

// The main conditional block begins here.
// It evaluates the value held by 'statusIndicator'.
switch
  (statusIndicator)
{
    // This block executes if 'statusIndicator' evaluates to the numeric literal 0.
    case
        0
        :
        console.log
            (1)
            ; // Outputs the integer '1' to the console.
        // Terminates the current case's execution, preventing fall-through.
        break
        ;

    // This block executes if 'statusIndicator' evaluates to the numeric literal 1.
    case 1:
        // Outputs the integer '0' to the console.
        console.log(0);
        // Exits the switch statement after this case is handled.
        break;
}
// End of the conditional logic flow.