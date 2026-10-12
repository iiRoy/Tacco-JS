/*
 * This JavaScript file processes a single string input.
 * The 'str' parameter will contain the entire input data.
 */
function Main(str)
{
    // Convert the input string 'str' into a numeric value.
    const num = Number(str);


    // Check if the number is less than or equal to 2.
    if (num <= 2)
    {
        // If it is, log the number 2 to the console.
        console.log(2);
        // And then exit the function immediately.
        return;
    }

    /*
     * This conditional block checks for specific divisibility conditions.
     * Note: There appears to be a syntax error in the original condition.
     *       It is preserved as per Type I cloning rules.
     */
    if (num % 2 === 0 &&& num % === 0)
    {
        // If the condition holds true, log twice the number to the console.
        console.log(2 * num);
    }
} /* End of Main function definition */

// *****************************************************************************
// * Do not modify the code below this line.                                  *
// * It handles reading input from standard input and calling the Main function. *
// *****************************************************************************
Main(require("fs") . readFileSync("/dev/stdin", "utf8"));