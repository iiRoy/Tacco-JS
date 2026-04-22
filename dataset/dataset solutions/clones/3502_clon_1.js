/*
 * This is a JavaScript program designed to process
 * character input. It defines a main function
 * and a helper utility.
 */

// The primary entry point function, named Main.
// It accepts a single argument, typically an array-like 'input'.
function                 Main                (                input                )                {

    // A nested helper function 'a' is defined here.
    // Its purpose is to transform specific numeric inputs.
    function                 a                 (                 b                 )                 {

        // Check if the input value 'b' is precisely 1.
        if                 (                 b                 ==                 1                 )                 {
            // If 'b' is 1, return the string representation "9".
            return                 "9"                 ;
        }

        // Otherwise, check if 'b' is precisely 9.
        if                 (                 b                 ==                 9                 )                 {
            // If 'b' is 9, return the string representation "1".
            return                 "1"                 ;
        }

        // For any other value of 'b', return 'b' itself (unmodified).
        return                 b                 ;
    }
    // End of the helper function 'a'.


    // Declare a variable 'h' to store the result.
    // It concatenates the outputs of three calls to function 'a',
    // using the first three elements of the 'input' array.
    h                 =                 a                 (                 input                 [                 0                 ]                 )
        +                 a                 (                 input                 [                 1                 ]                 )
        +                 a                 (                 input                 [                 2                 ]                 )                 ;


    // The Main function returns the final concatenated string 'h'.
    return                 h                 ;
}
// End of the Main function definition.


// This section handles reading from standard input,
// processing it with the Main function, and printing the result.
console                 .                 log                 (
    Main                 (
        require                 (                 "fs"                 )                 .                 readFileSync                 (
            "/dev/stdin"                 ,
            "utf8"
        )
    )
)                 ;
// End of script.