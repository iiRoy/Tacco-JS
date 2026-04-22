/*
 * This is the primary function for processing the input data.
 * It takes the raw input string and performs calculations based on it.
 */
function         Main   (   input   )
{
    // Declare variables to hold the counts of dogs and monkeys.
    var   n_dog,   n_monkey   ;

    // Split the input string by newlines to get individual lines.
    input = input.split(   "\n"   )   ;

    // Take the first line and split it by spaces to get the numbers.
    input = input[   0   ].split(   " "   )   ;

    // Assign the first number to n_dog.
    n_dog = input[   0   ]   ;

    // Assign the second number to n_monkey.
    n_monkey = input[   1   ]   ;

    // Start conditional logic based on the absolute difference between n_dog and n_monkey.

    if(   Math.abs(   n_dog   -   n_monkey   )   >=   2   )
    {
        // If the difference is 2 or more, output 0.
        console.log(   0   )   ;
    }
    else   if(   Math.abs(   n_dog   -   n_monkey   )   ==   1   )
    {
        // If the difference is exactly 1, calculate and output the product of factorials modulo 1000000007.
        console.log(   (   factorial(   n_dog   )   %   1000000007   )   *   (   factorial(   n_monkey   )   %   1000000007   )   %   1000000007   )   ;
    }
    else   if(   Math.abs(   n_dog   -   n_monkey   )   ==   0   )
    {
        // If the difference is 0 (n_dog == n_monkey), calculate and output twice the product of factorials modulo 1000000007.
        console.log(   (   (   factorial(   n_dog   )   %   1000000007   )   *   (   factorial(   n_monkey   )   %   1000000007   )   *   2   )   %   1000000007   )   ;
    }

}


/*
 * This helper function calculates the factorial of a given number 'n'.
 * It also applies the modulo operation at each step to prevent overflow.
 */
function         factorial   (   n   )
{
    // Initialize the result to 1 for factorial calculation.
    var   result   =   1   ;

    // Loop from 1 up to n to compute the factorial.
    for   (   var   i   =   1   ;   i   <=   n   ;   i++   )
    {
        // Multiply result by i, applying modulo at each step.
        result   =   (   result   %   1000000007   )   *   (   i   %   1000000007   )   ;
    }

    // Return the final factorial result.
    return   result   ;
}

// This section handles reading from standard input and invoking the main function.
// IMPORTANT: Do not modify the code below this line, as it is part of the standard input/output handling.
Main(   require(   "fs"   ).readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ;