/*
 * This is the main function of the program.
 * It calculates a sequence of numbers based on a specific condition
 * and then prints them to the console.
 * The input 's' is expected to be a string representation of an integer.
 */
function     Main (  s  )
{
    // Convert the input string 's' to an integer 'k'.
    // The unary plus operator is used for type coercion here.
    var   k   =   +  s  ;

    /*
     * Initialize an empty array 'a'.
     * This array will store the generated sequence of numbers.
     */
    var   a   =   [  ]  ;

    // 'l' represents the "last" number in the sequence that satisfied the condition.
    var   l   =   0   ;

    // 'r' is a multiplier, typically a power of 10, used to explore new candidates.
    var   r   =   1   ;


    // Loop until the array 'a' contains 'k' numbers.
    while   (   a  .  length   <   k   )
    {
        // Calculate 't', a candidate number, by adding 'l' and 'r'.
        var   t   =   l   +   r   ;

        // The core logic: check if the ratio of 't' to its digit sum
        // is less than or equal to the ratio of '(t + r)' to its digit sum.
        // This condition determines whether 't' is added to the sequence.
        if   (   t   /   digitsum  (  t  )   <=   (   t   +   r   )   /   digitsum  (  t   +   r  )   )
        {
            // If the condition is met, 't' is a valid number for the sequence.
            a  .  push  (  t  )  ; // Add 't' to the array.
            l   =   t   ;       // Update 'l' to the newly found number 't'.
        }
        else
        {
            // If the condition is not met, we need to try a larger 'r'.
            // Multiply 'r' by 10 to explore numbers in the next magnitude.
            r   *=   10   ;
        }
    }

    // After generating 'k' numbers, join them with newline characters
    // and print the result to the console.
    console  .  log  (  a  .  join  (  "\n"  )  )  ;
}

/*
 * This helper function calculates the sum of the digits of a given number 'n'.
 * It uses recursion for a concise implementation.
 */
function   digitsum  (  n  )
{
    // Base case: if 'n' is less than 10, its digit sum is 'n' itself.
    return   n   <   10   ?   n   :   // If 'n' is a single digit
           n   %   10   +   // Add the last digit
           digitsum  (   Math  .  floor  (  n   /   10  )   )  ; // Recursively sum digits of the rest of the number
}

// Main execution block:
// Read input from /dev/stdin, convert it to a string, and pass it to the Main function.
Main  (   require  (  "fs"  )  .  readFileSync  (  "/dev/stdin"  ,  "utf8"  )   )  ;