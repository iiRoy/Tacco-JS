/*
 * This module is designed to process an input string containing numerical data
 * and compute a specific result based on predefined mathematical operations and conditional logic.
 * It expects two numerical values to be extracted from the provided text.
 */
function CalculateResult(inputString) {
    // Divide the incoming string into an array of segments using newline or space characters as delimiters.
    // This step prepares the raw text for numerical extraction.
    let splitSegments = inputString.split(/\n|\s/);

    // Convert the first identified segment into its numerical representation.
    // The Number() constructor is used to ensure proper type conversion,
    // including handling of potential empty strings which would result in 0.
    let firstOperand = Number(splitSegments[0]);

    // Convert the second identified segment into its numerical form.
    // This value will be used in subsequent calculations as a divisor or factor.
    let secondOperand = Number(splitSegments[1]);

    // Perform an initial calculation using ceiling division.
    // This operation rounds up the result of the division to the nearest whole number.
    let computedOutcome = Math.ceil(firstOperand / (secondOperand - 1));

    // Evaluate a special condition: if the second operand is exactly two.
    // If this condition is met, a different calculation path is taken.
    if (secondOperand === 2) {
        computedOutcome = firstOperand - 1;
    }
    // Evaluate another specific condition: if the remainder of the division
    // of the first operand by (secondOperand - 1) is precisely one.
    // If true, the computed outcome is decremented.
    else if ((firstOperand % (secondOperand - 1)) === 1) {
        computedOutcome--;
    }

    // Output the final calculated numerical value to the standard console.
    console.log(computedOutcome);
}

// The main execution point of the script.
// It reads all data from the standard input stream as a UTF-8 encoded string,
// then passes this raw string to the primary calculation function.
CalculateResult(require('node:fs').readFileSync('/dev/stdin', 'utf8'));