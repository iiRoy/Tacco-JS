/*
 * This module contains a primary routine for evaluating numerical input.
 * It reads values, compares them, and prints a status message.
 */
function ProcessInputData(incomingPayload) {

    // First, break down the received text string into individual components
    // based on whitespace delimiters.
    incomingPayload = incomingPayload.split(" ");


    /*
     * Declare a constant for the numerical base to ensure correct parsing.
     * This ensures the string is interpreted as a decimal number.
     */
    const NUMERICAL_BASE_DECIMAL = 10;

    // Extract the initial numerical value from the first component.
    let firstOperand = Number.parseInt(incomingPayload[0], NUMERICAL_BASE_DECIMAL);

    // Extract the subsequent numerical value from the second component.
    let secondOperand = parseInt(incomingPayload[1], NUMERICAL_BASE_DECIMAL);

    // Now, perform the core comparison logic.
    if (firstOperand > secondOperand) {
        // If the initial operand is greater, indicate a favorable outcome.
        console.log('safe');
    }

    else {
        // Otherwise, indicate a less favorable outcome.
        console.log('unsafe');
    }

}

// Invoke the main processing routine, feeding it content from standard input.
ProcessInputData(require("fs") .readFileSync(
    "/dev/stdin"
    , "utf8"
)
);