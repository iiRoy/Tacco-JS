/* This is an example of JavaScript code.
 *
 * It defines a simple function and then attempts to use it.
 *
 * This specific version is a Type I clone, meaning:
 * - All identifiers (variable names, function names) are identical.
 * - All operators and expressions are identical.
 * - The only permitted changes are whitespace (spacing, indentation, blank lines)
 *   and comments (adding, modifying, or removing).
 *
 * The goal is to make the code look visually distinct
 * while maintaining its exact logical and structural identity.
 *
 */


    // Start of the function definition for calculating circumference.
    // This function takes a single parameter, conventionally representing the radius.
    function    circumference    (    r    )
    {
        // Inside the function body:
        // A variable named 'circumference' is assigned the calculated value.
        // Note that this variable has the same name as the function itself,
        // which can lead to unexpected behavior if not handled carefully
        // (e.g., if 'circumference' was declared with 'var', 'let', or 'const'
        // it would be a local variable, otherwise it could become a global
        // or overwrite the function reference).
        circumference       =       r       *       2       *       3.14       ; // Calculation: radius * 2 * PI (approx)

        // The calculated value is then returned by the function.
        return       circumference       ;

    } // End of the 'circumference' function definition.


    // After the function has been defined,
    // an attempt is made to log its output to the console.
    //
    // CRITICAL OBSERVATION FOR TYPE I CLONING:
    // 1. There is a typographical error in the function call: 'circumsference' instead of 'circumference'.
    //    This error is intentionally preserved to adhere to Type I cloning rules.
    // 2. The variable 'r' passed as an argument to 'circumsference' is not defined
    //    in the global scope, which will result in a runtime error (ReferenceError).
    //    This original characteristic is also strictly maintained.
    console    .    log    (    circumsference    (    r    )    )    ; // Attempting to log the result of the function call.